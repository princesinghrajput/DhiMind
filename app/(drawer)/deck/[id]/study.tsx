import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  Dimensions,
  PanResponder,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../../constants/Colors';
import { getDeckCards, Card, updateCardReview } from '../../../../services/card.service';

const { width } = Dimensions.get('window');
const ROTATION_DURATION = 300;
const SWIPE_THRESHOLD = width * 0.3;
const SWIPE_DURATION = 250;
const AUTO_ADVANCE_DELAY = 1000; // 1 second delay before showing next card

type CardStatus = 'new' | 'learning' | 'review' | 'relearning';

interface StudySession {
  newCards: number;
  reviewCards: number;
  learningCards: number;
}

interface GroupedCards {
  new: Card[];
  learning: Card[];
  review: Card[];
  relearning: Card[];
}

export default function StudyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    totalReviewed: 0,
    correct: 0,
    streak: 0,
  });
  const [studySession, setStudySession] = useState<StudySession>({
    newCards: 0,
    reviewCards: 0,
    learningCards: 0,
  });

  // Animation refs
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const swipeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const nextCardScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      // Use getDeckCards instead of getDueCards to get all cards
      const allCards = await getDeckCards(id as string);
      console.log('All cards received:', allCards);
      
      // If allCards is undefined or null, treat it as an empty array
      const cards = allCards || [];
      
      if (cards.length === 0) {
        Alert.alert(
          'No Cards',
          'This deck has no cards yet. Add some cards first.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // Initialize grouped as an object with empty arrays for each status
      const grouped: GroupedCards = {
        new: [],
        learning: [],
        review: [],
        relearning: [],
      };

      // Group cards by their status, treating undefined status as 'new'
      cards.forEach(card => {
        // If the card has no status or nextReview, it's a new card
        if (!card.status || !card.nextReview) {
          grouped.new.push({
            ...card,
            status: 'new' as CardStatus,
            nextReview: new Date().toISOString(),
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0
          });
        } else {
          const status = card.status as CardStatus;
          if (status in grouped) {
            grouped[status].push(card);
          } else {
            grouped.new.push({
              ...card,
              status: 'new' as CardStatus
            });
          }
        }
      });

      console.log('Grouped cards:', grouped);

      // Sort each group by due date and difficulty
      (Object.keys(grouped) as CardStatus[]).forEach(status => {
        grouped[status].sort((a: Card, b: Card) => {
          const dateA = new Date(a.nextReview || Date.now());
          const dateB = new Date(b.nextReview || Date.now());
          if (dateA.getTime() === dateB.getTime()) {
            return (b.easeFactor || 2.5) - (a.easeFactor || 2.5);
          }
          return dateA.getTime() - dateB.getTime();
        });
      });

      // Organize cards in optimal learning sequence
      const sortedCards = [
        ...grouped.learning,
        ...grouped.relearning,
        ...grouped.review,
        ...grouped.new,
      ];

      console.log('Final sorted cards:', sortedCards);

      if (sortedCards.length > 0) {
        setCards(sortedCards);
        setStudySession({
          newCards: grouped.new.length,
          reviewCards: grouped.review.length,
          learningCards: grouped.learning.length + grouped.relearning.length,
        });
      } else {
        Alert.alert(
          'No Cards Available',
          'There are no cards available for review at this time.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load cards. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const autoAdvance = useCallback(() => {
    if (!continuousMode) return;
    
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        if (isFlipped) {
          handleFlip();
        }
      }
    }, AUTO_ADVANCE_DELAY);
  }, [continuousMode, currentIndex, cards.length, isFlipped]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isFlipped,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        return !isFlipped && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderMove: (_, { dx }) => {
        swipeAnimation.setValue(dx);
        // Scale based on swipe distance
        const scale = Math.max(0.95, 1 - Math.abs(dx) / (width * 2));
        scaleAnimation.setValue(scale);
        nextCardScale.setValue(Math.min(1, 0.9 + Math.abs(dx) / (width * 2)));
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const swipeDirection = dx > 0 ? 1 : -1;
        const isSwipeValid = Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.5;

        if (isSwipeValid) {
          Animated.parallel([
            Animated.timing(swipeAnimation, {
              toValue: swipeDirection * width * 1.5,
              duration: SWIPE_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
              toValue: 0.8,
              duration: SWIPE_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(nextCardScale, {
              toValue: 1,
              duration: SWIPE_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => {
            handleRate(swipeDirection > 0 ? 5 : 1);
            resetCardPosition();
          });
        } else {
          Animated.parallel([
            Animated.spring(swipeAnimation, {
              toValue: 0,
              useNativeDriver: true,
              friction: 5,
            }),
            Animated.spring(scaleAnimation, {
              toValue: 1,
              useNativeDriver: true,
              friction: 5,
            }),
            Animated.spring(nextCardScale, {
              toValue: 0.9,
              useNativeDriver: true,
              friction: 5,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const resetCardPosition = () => {
    swipeAnimation.setValue(0);
    scaleAnimation.setValue(1);
    nextCardScale.setValue(0.9);
  };

  const handleFlip = useCallback(() => {
    const toValue = isFlipped ? 0 : 1;
    Animated.timing(flipAnimation, {
      toValue,
      duration: ROTATION_DURATION,
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped));
  }, [isFlipped, flipAnimation]);

  const handleRate = async (quality: number) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const card = cards[currentIndex];
      await updateCardReview(card._id, quality);
      
      // Update session stats
      setSessionStats(prev => {
        const isCorrect = quality >= 3;
        return {
          totalReviewed: prev.totalReviewed + 1,
          correct: prev.correct + (isCorrect ? 1 : 0),
          streak: isCorrect ? prev.streak + 1 : 0,
        };
      });

      // Update study session stats
      setStudySession(prev => {
        const newStats = { ...prev };
        if (card.status === 'new') newStats.newCards--;
        else if (card.status === 'review') newStats.reviewCards--;
        else if (card.status === 'learning') newStats.learningCards--;
        return newStats;
      });

      if (currentIndex === cards.length - 1) {
        const accuracy = Math.round((sessionStats.correct / sessionStats.totalReviewed) * 100);
        Alert.alert(
          'Session Complete',
          `Great job! You've completed all cards with ${accuracy}% accuracy and a streak of ${sessionStats.streak}!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else if (continuousMode) {
        autoAdvance();
      } else {
        setCurrentIndex(currentIndex + 1);
        if (isFlipped) {
          handleFlip();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update card status');
    } finally {
      setSubmitting(false);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [
      { scale: scaleAnimation },
      { translateX: swipeAnimation },
      { rotateY: frontInterpolate },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      { scale: scaleAnimation },
      { translateX: swipeAnimation },
      { rotateY: backInterpolate },
    ],
  };

  const nextCardAnimatedStyle = {
    transform: [{ scale: nextCardScale }],
    opacity: nextCardScale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0.5, 1],
    }),
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Check if we have cards before rendering the study interface
  if (!cards || cards.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No cards available for review</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = cards[currentIndex];
  
  // Safety check for currentCard
  if (!currentCard) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Session complete</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nextCard = currentIndex + 1 < cards.length ? cards[currentIndex + 1] : null;
  const progress = `${currentIndex + 1}/${cards.length}`;
  const accuracy = sessionStats.totalReviewed > 0
    ? Math.round((sessionStats.correct / sessionStats.totalReviewed) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={styles.progress}>{progress}</Text>
          <Text style={styles.accuracy}>{accuracy}% • Streak: {sessionStats.streak}</Text>
        </View>
        <View style={styles.modeSwitch}>
          <Switch
            value={continuousMode}
            onValueChange={setContinuousMode}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>
      </View>

      <View style={styles.sessionInfo}>
        <View style={styles.sessionStat}>
          <Text style={styles.sessionStatNumber}>{studySession.learningCards}</Text>
          <Text style={styles.sessionStatLabel}>Learning</Text>
        </View>
        <View style={styles.sessionStat}>
          <Text style={styles.sessionStatNumber}>{studySession.reviewCards}</Text>
          <Text style={styles.sessionStatLabel}>Review</Text>
        </View>
        <View style={styles.sessionStat}>
          <Text style={styles.sessionStatNumber}>{studySession.newCards}</Text>
          <Text style={styles.sessionStatLabel}>New</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {nextCard && (
          <Animated.View style={[styles.card, styles.nextCard, nextCardAnimatedStyle]}>
            <Text style={styles.cardText}>{nextCard.front}</Text>
          </Animated.View>
        )}
        
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleFlip}
          {...panResponder.panHandlers}
        >
          <Animated.View style={[styles.card, frontAnimatedStyle]}>
            <Text style={styles.cardText}>{currentCard.front}</Text>
            <Text style={styles.tapHint}>Tap to flip • Swipe to rate</Text>
          </Animated.View>
          
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <Text style={styles.cardText}>{currentCard.back}</Text>
            <Text style={styles.tapHint}>Tap to flip</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={[styles.ratingContainer, { opacity: isFlipped ? 1 : 0.5 }]}>
        <Text style={styles.ratingTitle}>How well did you remember this?</Text>
        <View style={styles.ratingButtons}>
          <TouchableOpacity
            style={[styles.ratingButton, styles.hardButton]}
            onPress={() => handleRate(1)}
            disabled={!isFlipped || submitting}
          >
            <Text style={styles.ratingButtonText}>Hard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.ratingButton, styles.goodButton]}
            onPress={() => handleRate(3)}
            disabled={!isFlipped || submitting}
          >
            <Text style={styles.ratingButtonText}>Good</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.ratingButton, styles.easyButton]}
            onPress={() => handleRate(5)}
            disabled={!isFlipped || submitting}
          >
            <Text style={styles.ratingButtonText}>Easy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  stats: {
    alignItems: 'center',
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  accuracy: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modeSwitch: {
    width: 40,
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: width - 32,
    height: 400,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextCard: {
    position: 'absolute',
    zIndex: -1,
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardText: {
    fontSize: 20,
    color: Colors.text,
    textAlign: 'center',
  },
  tapHint: {
    position: 'absolute',
    bottom: 16,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  ratingContainer: {
    padding: 16,
    gap: 16,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  hardButton: {
    backgroundColor: '#E53935',
  },
  goodButton: {
    backgroundColor: '#7CB342',
  },
  easyButton: {
    backgroundColor: '#039BE5',
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  sessionStat: {
    alignItems: 'center',
  },
  sessionStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sessionStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 