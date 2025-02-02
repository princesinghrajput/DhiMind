import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, useColorScheme, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getDecks, Deck } from '../../services/deck.service';
import Colors from '../../constants/Colors';
import { formatDate } from '../../utils/date';

export default function DecksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);

  const loadDecks = async () => {
    try {
      const data = await getDecks();
      setDecks(data);
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

  const renderDeckCard = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      style={[styles.deckCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}
      onPress={() => router.push(`/deck/${item._id}`)}
    >
      <View style={styles.deckHeader}>
        <Text style={[styles.deckTitle, { color: isDark ? '#fff' : '#000' }]}>{item.title}</Text>
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
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Last studied
          </Text>
          <Text style={[styles.lastStudied, { color: isDark ? '#fff' : '#000' }]}>
            {item.lastStudied 
              ? formatDate(new Date(item.lastStudied))
              : 'Not studied yet'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
}); 