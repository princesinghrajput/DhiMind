import { View, Text, ScrollView, TouchableOpacity, useColorScheme, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categories = [
    { id: 1, title: 'Mathematics', count: 15, icon: '📐' },
    { id: 2, title: 'Science', count: 20, icon: '🔬' },
    { id: 3, title: 'Languages', count: 25, icon: '🗣️' },
    { id: 4, title: 'History', count: 18, icon: '📚' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      {/* Welcome Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: isDark ? '#fff' : '#000' }]}>
            Hello, Welcome 👋
          </Text>
          <Text style={[styles.nameText, { color: isDark ? '#fff' : '#000' }]}>
            Ready to learn?
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: 'https://ui-avatars.com/api/?name=User' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>12</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Due Today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>85%</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Retention</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>45</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Total Cards</Text>
        </View>
      </View>

      {/* Categories Grid */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Categories</Text>
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}
            onPress={() => router.push('/decks')}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[styles.categoryTitle, { color: isDark ? '#fff' : '#000' }]}>
              {category.title}
            </Text>
            <Text style={[styles.categoryCount, { color: isDark ? '#aaa' : '#666' }]}>
              {category.count} cards
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        style={[styles.studyButton, { backgroundColor: '#6c5ce7' }]}
        onPress={() => router.push('/decks')}
      >
        <Text style={styles.studyButtonText}>Start Studying</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
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
  welcomeText: {
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
}); 