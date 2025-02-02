import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';
import { getDeck } from '../../../services/deck.service';
import { getDeckCards, Card } from '../../../services/card.service';
import { formatDate } from '../../../utils/date';
import AddCardModal from '../../../components/AddCardModal';

type CardStatus = 'new' | 'learning' | 'review' | 'relearning';

interface StyleProps extends Record<CardStatus, object> {
  container: object;
  centered: object;
  header: object;
  deckInfo: object;
  deckTitle: object;
  deckDescription: object;
  stats: object;
  statItem: object;
  statNumber: object;
  statLabel: object;
  studyButton: object;
  studyButtonText: object;
  content: object;
  sectionHeader: object;
  sectionTitle: object;
  addButton: object;
  list: object;
  cardItem: object;
  cardContent: object;
  cardText: object;
  cardStatus: object;
  statusText: object;
  nextReview: object;
  emptyContainer: object;
  emptyText: object;
  emptySubtext: object;
}

export default function DeckScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadData = async () => {
    try {
      const [deckData, cardsData] = await Promise.all([
        getDeck(id as string),
        getDeckCards(id as string)
      ]);
      setDeck(deckData);
      setCards(cardsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStartStudy = () => {
    if (cards.length === 0) {
      Alert.alert('No Cards', 'Add some cards to start studying');
      return;
    }
    router.push(`/deck/${id}/study`);
  };

  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => router.push(`/card/${item._id}`)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardText} numberOfLines={2}>
          {item.front}
        </Text>
        <View style={styles.cardStatus}>
          <Text style={[styles.statusText, styles[item.status]]}>
            {item.status}
          </Text>
          <Text style={styles.nextReview}>
            Next: {formatDate(new Date(item.nextReview))}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.deckInfo}>
          <Text style={styles.deckTitle}>{deck?.title}</Text>
          <Text style={styles.deckDescription}>{deck?.description}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{deck?.totalCards}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{deck?.dueCards}</Text>
            <Text style={styles.statLabel}>Due</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{deck?.retention}%</Text>
            <Text style={styles.statLabel}>Retention</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.studyButton}
          onPress={handleStartStudy}
        >
          <Text style={styles.studyButtonText}>Start Studying</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cards</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={cards}
          renderItem={renderCardItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No cards yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button to add your first card
              </Text>
            </View>
          }
        />
      </View>

      <AddCardModal
        visible={isModalVisible}
        deckId={id as string}
        onClose={() => setIsModalVisible(false)}
        onSuccess={(newCard) => {
          setCards([newCard, ...cards]);
          setIsModalVisible(false);
        }}
      />
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
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  deckInfo: {
    gap: 4,
  },
  deckTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  deckDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  studyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  studyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    gap: 12,
  },
  cardContent: {
    flex: 1,
    gap: 8,
  },
  cardText: {
    fontSize: 16,
    color: Colors.text,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  new: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
  },
  learning: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
  },
  review: {
    backgroundColor: '#E8F5E9',
    color: '#388E3C',
  },
  relearning: {
    backgroundColor: '#FCE4EC',
    color: '#D81B60',
  },
  nextReview: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
}); 