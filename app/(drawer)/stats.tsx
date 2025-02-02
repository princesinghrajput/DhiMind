import { View, Text, ScrollView, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const sampleData = {
  totalCards: 78,
  cardsLearned: 65,
  averageRetention: 85,
  studyStreak: 7,
  timeSpent: '12h 30m',
  dailyStats: [
    { day: 'Mon', cards: 15 },
    { day: 'Tue', cards: 20 },
    { day: 'Wed', cards: 12 },
    { day: 'Thu', cards: 18 },
    { day: 'Fri', cards: 25 },
    { day: 'Sat', cards: 8 },
    { day: 'Sun', cards: 10 },
  ],
};

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const maxCards = Math.max(...sampleData.dailyStats.map(stat => stat.cards));

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={[styles.overviewCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={24} color="#6c5ce7" />
          </View>
          <Text style={[styles.overviewValue, { color: isDark ? '#fff' : '#000' }]}>
            {sampleData.totalCards}
          </Text>
          <Text style={[styles.overviewLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Total Cards
          </Text>
        </View>

        <View style={[styles.overviewCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#51cf66" />
          </View>
          <Text style={[styles.overviewValue, { color: isDark ? '#fff' : '#000' }]}>
            {sampleData.cardsLearned}
          </Text>
          <Text style={[styles.overviewLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Learned
          </Text>
        </View>

        <View style={[styles.overviewCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="trending-up" size={24} color="#ffd93d" />
          </View>
          <Text style={[styles.overviewValue, { color: isDark ? '#fff' : '#000' }]}>
            {sampleData.averageRetention}%
          </Text>
          <Text style={[styles.overviewLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Retention
          </Text>
        </View>
      </View>

      {/* Streak Section */}
      <View style={[styles.streakCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={24} color="#ff6b6b" />
          <Text style={[styles.streakTitle, { color: isDark ? '#fff' : '#000' }]}>
            Study Streak
          </Text>
        </View>
        <Text style={[styles.streakValue, { color: isDark ? '#fff' : '#000' }]}>
          {sampleData.studyStreak} days
        </Text>
        <Text style={[styles.streakSubtext, { color: isDark ? '#aaa' : '#666' }]}>
          Keep it up! You're doing great!
        </Text>
      </View>

      {/* Weekly Progress */}
      <View style={[styles.weeklyCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
        <Text style={[styles.weeklyTitle, { color: isDark ? '#fff' : '#000' }]}>
          Weekly Progress
        </Text>
        <View style={styles.chartContainer}>
          {sampleData.dailyStats.map((stat, index) => (
            <View key={stat.day} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (stat.cards / maxCards) * 150,
                      backgroundColor: '#6c5ce7',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: isDark ? '#aaa' : '#666' }]}>
                {stat.day}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Time Spent */}
      <View style={[styles.timeCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
        <View style={styles.timeHeader}>
          <Ionicons name="time" size={24} color="#6c5ce7" />
          <Text style={[styles.timeTitle, { color: isDark ? '#fff' : '#000' }]}>
            Total Study Time
          </Text>
        </View>
        <Text style={[styles.timeValue, { color: isDark ? '#fff' : '#000' }]}>
          {sampleData.timeSpent}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
  },
  streakCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  streakSubtext: {
    fontSize: 14,
  },
  weeklyCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },
  barContainer: {
    alignItems: 'center',
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
  },
  timeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 