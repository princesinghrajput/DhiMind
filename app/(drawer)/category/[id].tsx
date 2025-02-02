import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';
import { getDecks, Deck, createDeck } from '../../../services/deck.service';
import { getCategory } from '../../../services/category.service';
import Colors from '../../../constants/Colors';
import { formatDate } from '../../../utils/date';
import AddDeckModal from '../../../components/AddDeckModal';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<any>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadData = async () => {
    try {
      const [categoryData, decksData] = await Promise.all([
        getCategory(id as string),
        getDecks(id as string)
      ]);
      setCategory(categoryData);
      setDecks(decksData);
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

  const handleAddDeck = async (title: string, description: string) => {
    try {
      const newDeck = await createDeck({
        title,
        description,
        category: id as string
      });
      setDecks([newDeck, ...decks]);
      setIsModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create deck');
    }
  };

  const renderDeckItem = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      style={styles.deckCard}
      onPress={() => router.push(`/deck/${item._id}`)}
    >
      <View style={styles.deckHeader}>
        <Text style={styles.deckTitle}>{item.title}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>{item.totalCards} cards</Text>
          <Text style={styles.statsText}>{item.dueCards} due</Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.deckFooter}>
        <Text style={styles.lastStudied}>
          {item.lastStudied 
            ? `Last studied ${formatDate(new Date(item.lastStudied))}` 
            : 'Not studied yet'}
        </Text>
        <Text style={styles.retention}>
          {item.retention}% retention
        </Text>
      </View>
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
        <View style={styles.categoryInfo}>
          <Ionicons name={category?.icon || 'folder'} size={24} color={Colors.primary} />
          <Text style={styles.categoryTitle}>{category?.title}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={decks}
        renderItem={renderDeckItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No decks yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first deck</Text>
          </View>
        }
      />

      <AddDeckModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddDeck}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  deckCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  deckFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  lastStudied: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  retention: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
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