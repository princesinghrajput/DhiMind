import { View, Text, FlatList, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Deck {
  id: string;
  title: string;
  description: string;
  totalCards: number;
  dueCards: number;
  lastStudied: string;
}

const sampleDecks: Deck[] = [
  {
    id: '1',
    title: '3D Illustration Basics',
    description: 'Learn the fundamentals of 3D illustration',
    totalCards: 12,
    dueCards: 3,
    lastStudied: '2 days ago',
  },
  {
    id: '2',
    title: 'Typography Fundamentals',
    description: 'Master the basics of typography and font design',
    totalCards: 15,
    dueCards: 5,
    lastStudied: '1 day ago',
  },
  {
    id: '3',
    title: 'Color Theory',
    description: 'Understanding color relationships and meanings',
    totalCards: 20,
    dueCards: 8,
    lastStudied: '3 days ago',
  },
];

export default function DecksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderDeckCard = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      style={[styles.deckCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}
      onPress={() => router.push({ pathname: '/(deck)/[id]', params: { id: item.id } })}
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
      
      <Text style={[styles.deckDescription, { color: isDark ? '#aaa' : '#666' }]}>
        {item.description}
      </Text>
      
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
            {item.lastStudied}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <FlatList
        data={sampleDecks}
        renderItem={renderDeckCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(deck)/new')}
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
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
}); 