import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Card {
  id: string;
  front: string;
  back: string;
  dueDate: string;
  interval: number;
}

const sampleCards: Card[] = [
  {
    id: '1',
    front: 'What is Typography?',
    back: 'Typography is the art and technique of arranging type...',
    dueDate: '2024-02-02',
    interval: 1,
  },
  {
    id: '2',
    front: 'What is kerning?',
    back: 'Kerning is the process of adjusting the spacing...',
    dueDate: '2024-02-03',
    interval: 2,
  },
];

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      {/* Header Stats */}
      <View style={[styles.statsContainer, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>15</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Total Cards</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>5</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Due Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>85%</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Mastery</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6c5ce7' }]}
          onPress={() => router.push('/index')}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Study Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}
          onPress={() => router.push('/(deck)/new-card')}
        >
          <Ionicons name="add" size={20} color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.actionButtonText, { color: isDark ? '#fff' : '#000' }]}>
            Add Card
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cards List */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Cards</Text>
      <ScrollView style={styles.cardsList}>
        {sampleCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.cardItem, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}
            onPress={() => router.push({ pathname: '/(deck)/edit-card', params: { id: card.id } })}
          >
            <View>
              <Text style={[styles.cardFront, { color: isDark ? '#fff' : '#000' }]}>
                {card.front}
              </Text>
              <Text style={[styles.cardBack, { color: isDark ? '#aaa' : '#666' }]}>
                {card.back}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardsList: {
    flex: 1,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardFront: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardBack: {
    fontSize: 14,
  },
}); 