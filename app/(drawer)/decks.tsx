import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, useColorScheme, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getDecks, Deck } from '../../services/deck.service';
import { getDeckCards } from '../../services/card.service';
import Colors from '../../constants/Colors';
import { formatDate } from '../../utils/date';

interface DeckWithNextReview extends Deck {
  nextReviewInfo?: {
    timeMessage: string;
    cardsCount: number;
  };
}

export default function DecksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [decks, setDecks] = useState<DeckWithNextReview[]>([]);

  // Helper function to get color based on retention percentage
  const getRetentionColor = (retention: number) => {
    if (retention >= 90) return '#4CAF50'; // Green for excellent
    if (retention >= 70) return '#8BC34A'; // Light green for good
    if (retention >= 50) return '#FFC107'; // Amber for okay
    if (retention >= 30) return '#FF9800'; // Orange for needs work
    return '#F44336'; // Red for poor
  };

  const getNextReviewInfo = async (deck: Deck): Promise<DeckWithNextReview> => {
    try {
      const cards = await getDeckCards(deck._id);
      if (!cards || cards.length === 0) {
        return {
          ...deck,
          totalCards: 0,
          dueCards: 0,
          retention: 0,
          category: deck.category
        };
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Get recently reviewed cards (last 30 days)
      const recentlyReviewedCards = cards.filter(card => 
        card.lastReviewed && new Date(card.lastReviewed) >= thirtyDaysAgo
      );

      // Get retained cards from recently reviewed ones
      const retainedCards = recentlyReviewedCards.filter(card => 
        card.status === 'review' &&
        card.interval > 1 &&
        card.easeFactor >= 2.5 &&
        new Date(card.nextReview) > now
      );

      // Calculate retention percentage
      const retention = recentlyReviewedCards.length > 0
        ? (retainedCards.length / recentlyReviewedCards.length) * 100
        : 0;

      // Get due and upcoming cards
      const dueCards = cards.filter(card => 
        new Date(card.nextReview) <= now
      );

      const upcomingCards = cards.filter(card => {
        const reviewDate = new Date(card.nextReview);
        return reviewDate > now;
      }).sort((a, b) => 
        new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
      );

      // If there are due cards, they should be reviewed immediately
      if (dueCards.length > 0) {
        return {
          ...deck,
          category: deck.category,
          totalCards: cards.length,
          dueCards: dueCards.length,
          retention: Math.round(retention),
          nextReviewInfo: {
            timeMessage: 'now',
            cardsCount: dueCards.length
          }
        };
      }

      // If no cards are due now but there are upcoming cards
      if (upcomingCards.length > 0) {
        const earliestReview = new Date(upcomingCards[0].nextReview);
        const nextBatchCards = upcomingCards.filter(card => {
          const reviewDate = new Date(card.nextReview);
          const hoursDiff = (reviewDate.getTime() - earliestReview.getTime()) / (1000 * 60 * 60);
          return hoursDiff <= 24;
        });

        // Calculate time until next review
        const hoursUntilReview = Math.max(0, Math.round((earliestReview.getTime() - now.getTime()) / (1000 * 60 * 60)));
        const daysUntilReview = Math.floor(hoursUntilReview / 24);
        const remainingHours = hoursUntilReview % 24;

        // Format the time message
        let timeMessage;
        if (daysUntilReview > 0) {
          timeMessage = `${daysUntilReview}d`;
          if (remainingHours > 0) {
            timeMessage += ` ${remainingHours}h`;
          }
        } else {
          timeMessage = `${remainingHours}h`;
        }

        return {
          ...deck,
          category: deck.category,
          totalCards: cards.length,
          dueCards: dueCards.length,
          retention: Math.round(retention),
          nextReviewInfo: {
            timeMessage,
            cardsCount: nextBatchCards.length
          }
        };
      }

      // No cards due or upcoming
      return {
        ...deck,
        category: deck.category,
        totalCards: cards.length,
        dueCards: 0,
        retention: Math.round(retention)
      };

    } catch (error) {
      console.error('Error getting next review info:', error);
      return {
        ...deck,
        category: deck.category
      };
    }
  };

  const loadDecks = async () => {
    try {
      const data = await getDecks();
      console.log('Raw decks data:', JSON.stringify(data, null, 2));
      // Get next review info for each deck
      const decksWithReviews = await Promise.all(
        data.map(deck => getNextReviewInfo(deck))
      );
      console.log('Decks with reviews:', JSON.stringify(decksWithReviews, null, 2));
      setDecks(decksWithReviews);
    } catch (error) {
      Alert.alert('Error', 'Failed to load decks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDecks();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDecks();
  };

  const renderDeckCard = ({ item }: { item: DeckWithNextReview }) => {
    console.log('Deck data:', JSON.stringify(item, null, 2)); // Debug log
    
    return (
      <TouchableOpacity
        style={[styles.deckCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}
        onPress={() => router.push(`/deck/${item._id}`)}
      >
        <View style={styles.deckHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.categoryIcon}>{item.category?.icon || '📚'}</Text>
            <Text style={[styles.deckTitle, { color: isDark ? '#fff' : '#000' }]}>{item.title}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={isDark ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>
        
        {item.description && (
          <Text style={[styles.deckDescription, { color: isDark ? '#aaa' : '#666' }]}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.deckStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>
              {item.totalCards}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>
              {item.dueCards}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Due</Text>
          </View>

          <View style={styles.statItem}>
            <Text 
              style={[
                styles.statNumber, 
                { color: getRetentionColor(item.retention || 0) }
              ]}
            >
              {Math.round(item.retention || 0)}%
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Retention</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.nextReviewContainer}>
              <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>
                {item.nextReviewInfo ? 'Next review' : 'Last studied'}
              </Text>
              {item.nextReviewInfo ? (
                <>
                  <Text style={[styles.nextReviewTime, { color: Colors.primary }]}>
                    in {item.nextReviewInfo.timeMessage}
                  </Text>
                  <Text style={[styles.nextReviewCards, { color: isDark ? '#aaa' : '#666' }]}>
                    ({item.nextReviewInfo.cardsCount} card{item.nextReviewInfo.cardsCount !== 1 ? 's' : ''})
                  </Text>
                </>
              ) : (
                <Text style={[styles.lastStudied, { color: isDark ? '#fff' : '#000' }]}>
                  {item.lastStudied 
                    ? formatDate(new Date(item.lastStudied))
                    : 'Not studied yet'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <FlatList
        data={decks}
        renderItem={renderDeckCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
              No decks yet
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#aaa' : '#666' }]}>
              Create your first deck to get started
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary }]}
        onPress={() => router.push('/deck/new')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  deckCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deckDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  deckStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  lastStudied: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  nextReviewContainer: {
    alignItems: 'center',
  },
  nextReviewTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextReviewCards: {
    fontSize: 12,
    marginTop: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
}); 