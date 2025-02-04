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
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../../constants/Colors';
import { getDeckCards } from '../../../../services/card.service';

const { width, height } = Dimensions.get('window');

export default function StudyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalReviewed: 0,
    correct: 0,
    streak: 0,
  });

  // Animation values
  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCards();
  }, [id]); // Add id as dependency to reload when deck changes

  const loadCards = async () => {
    try {
      if (!id) {
        console.error('No deck ID provided');
        Alert.alert('Error', 'Invalid deck selected');
        router.back();
        return;
      }

      setLoading(true);
      const allCards = await getDeckCards(id as string);
      console.log('Loaded cards for deck:', id, allCards);
      
      if (!Array.isArray(allCards)) {
        console.error('Invalid cards data received:', allCards);
        Alert.alert('Error', 'Failed to load cards');
        return;
      }

      // Filter out cards that don't belong to this deck
      const deckCards = allCards.filter(card => card.deck === id);
      if (deckCards.length === 0) {
        Alert.alert('No Cards', 'This deck has no cards yet. Add some cards first!');
        router.back();
        return;
      }

      // Shuffle the cards for better study experience
      const shuffledCards = [...deckCards].sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
      setCurrentIndex(0); // Reset to first card
      setSessionStats({
        totalReviewed: 0,
        correct: 0,
        streak: 0,
      });
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 45,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleResponse = (quality: number) => {
    if (currentIndex < cards.length - 1) {
      // Reset flip state
      flipAnimation.setValue(0);
      setIsFlipped(false);
      
      // Update stats
      setSessionStats(prev => ({
        totalReviewed: prev.totalReviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        streak: quality >= 3 ? prev.streak + 1 : 0,
      }));

      // Move to next card
      setCurrentIndex(currentIndex + 1);
    } else {
      // Session complete
      router.back();
    }
  };

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const renderCardContent = () => {
    if (loading || !cards.length) return null;

    const currentCard = cards[currentIndex];
    if (!currentCard) return null;

    console.log('Rendering card:', currentCard); // Debug log

    if (currentCard.type === 'standard') {
      return (
        <View style={styles.cardContent}>
          <Text style={[styles.cardLabel, { color: isDark ? '#aaa' : '#666' }]}>
            {isFlipped ? 'Answer' : 'Question'}
          </Text>
          <Text style={[styles.cardText, { color: isDark ? '#fff' : '#000' }]}>
            {isFlipped ? currentCard.back : currentCard.front}
          </Text>
        </View>
      );
    }

    if (currentCard.type === 'cloze' && currentCard.clozeText) {
      const clozeText = currentCard.clozeText;
      const parts = clozeText.split(/({{c1::.*?}})/g).filter(Boolean);
      
      return (
        <View style={styles.cardContent}>
          <Text style={[styles.cardLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Fill in the blank
          </Text>
          <View style={styles.clozeContainer}>
            <Text style={[styles.cardText, { color: isDark ? '#fff' : '#000' }]}>
              {parts.map((part, index) => {
                const clozeMatch = part.match(/{{c1::(.*?)}}/);
                if (clozeMatch) {
                  if (isFlipped) {
                    return (
                      <Text key={index} style={styles.highlightedCloze}>
                        {clozeMatch[1]}
                      </Text>
                    );
                  }
                  return (
                    <Text key={index} style={styles.clozeBlank}>
                      [...]
                    </Text>
                  );
                }
                return <Text key={index}>{part}</Text>;
              })}
            </Text>
          </View>
        </View>
      );
    }

    // If card type is not recognized, show an error
    return (
      <View style={styles.cardContent}>
        <Text style={[styles.cardLabel, { color: isDark ? '#aaa' : '#666' }]}>
          Error
        </Text>
        <Text style={[styles.cardText, { color: isDark ? '#fff' : '#000' }]}>
          Unknown card type: {currentCard.type}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!cards.length) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>No cards to study</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <View style={styles.header}>
        <Text style={[styles.progress, { color: isDark ? '#fff' : '#000' }]}>
          {currentIndex + 1} / {cards.length}
        </Text>
        <Text style={[styles.streak, { color: isDark ? '#fff' : '#000' }]}>
          Streak: {sessionStats.streak}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleFlip}>
          <Animated.View
            style={[
              styles.card,
              frontAnimatedStyle,
              { backgroundColor: isDark ? '#1a1b1e' : '#fff' },
            ]}
          >
            {renderCardContent()}
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              backAnimatedStyle,
              { backgroundColor: isDark ? '#1a1b1e' : '#fff' },
            ]}
          >
            {renderCardContent()}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isFlipped && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ff6b6b' }]}
            onPress={() => handleResponse(1)}
          >
            <Text style={styles.buttonText}>Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ffd93d' }]}
            onPress={() => handleResponse(2)}
          >
            <Text style={styles.buttonText}>Hard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#6c5ce7' }]}
            onPress={() => handleResponse(3)}
          >
            <Text style={styles.buttonText}>Good</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#51cf66' }]}
            onPress={() => handleResponse(4)}
          >
            <Text style={styles.buttonText}>Easy</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isFlipped && (
        <View style={styles.hint}>
          <Ionicons name="finger-print-outline" size={24} color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.hintText, { color: isDark ? '#fff' : '#000' }]}>
            Tap to reveal answer
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
  },
  streak: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width - 48,
    height: height * 0.45,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  clozeContainer: {
    backgroundColor: '#00000008',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
  },
  highlightedCloze: {
    backgroundColor: '#6c5ce720',
    color: '#6c5ce7',
    fontWeight: '600',
    padding: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  clozeBlank: {
    color: '#666',
    fontWeight: '500',
    backgroundColor: '#00000010',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  hintText: {
    fontSize: 16,
  },
});