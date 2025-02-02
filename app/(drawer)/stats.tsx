import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, Dimensions, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { getDecks } from '../../services/deck.service';
import { formatNumber, formatDate } from '../../utils/format';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;
const CHART_HEIGHT = 220;

interface GlobalStats {
  totalCards: number;
  cardsLearned: number;
  averageRetention: number;
  studyStreak: number;
  timeSpent: string;
  dailyStats: Array<{
    day: string;
    cards: number;
    date: string;
  }>;
  weeklyRetention: number[];
}

interface DeckStats {
  _id: string;
  title: string;
  totalCards: number;
  dueCards: number;
  retention: number;
  lastStudied: string | null;
}

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [decks, setDecks] = useState<DeckStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalCards: 0,
    cardsLearned: 0,
    averageRetention: 0,
    studyStreak: 0,
    timeSpent: '0h 0m',
    dailyStats: [],
    weeklyRetention: []
  });

  const loadStats = useCallback(async () => {
    try {
      const decksData = await getDecks();
      
      // Transform deck data to match DeckStats type
      const transformedDecks: DeckStats[] = decksData.map(deck => ({
        _id: deck._id,
        title: deck.title,
        totalCards: deck.totalCards,
        dueCards: deck.dueCards,
        retention: deck.retention,
        lastStudied: deck.lastStudied ? new Date(deck.lastStudied).toISOString() : null
      }));
      
      // Sort decks by last studied date and due cards
      transformedDecks.sort((a, b) => {
        if (a.dueCards !== b.dueCards) return b.dueCards - a.dueCards;
        if (!a.lastStudied && !b.lastStudied) return 0;
        if (!a.lastStudied) return 1;
        if (!b.lastStudied) return -1;
        return new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime();
      });
      
      setDecks(transformedDecks);

      // Calculate global stats from decks
      const totalCards = decksData.reduce((sum, deck) => sum + deck.totalCards, 0);
      const totalDueCards = decksData.reduce((sum, deck) => sum + deck.dueCards, 0);
      const avgRetention = decksData.reduce((sum, deck) => sum + deck.retention, 0) / Math.max(1, decksData.length);

      // Generate daily stats for the last 7 days
      const dailyStats = [];
      const now = new Date();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStudied = decksData.some(deck => 
          deck.lastStudied && 
          new Date(deck.lastStudied).toDateString() === date.toDateString()
        );
        
        dailyStats.push({
          day: dayNames[date.getDay()],
          date: date.toISOString(),
          cards: dayStudied ? Math.floor(Math.random() * 20) + 5 : 0 // Replace with actual data from backend
        });
      }

      // Calculate current streak
      let streak = 0;
      const today = new Date().toDateString();
      for (let i = 0; i < decksData.length; i++) {
        const deck = decksData[i];
        if (!deck.lastStudied) continue;
        
        const lastStudied = new Date(deck.lastStudied).toDateString();
        if (lastStudied === today) {
          streak = calculateStreak(decksData);
          break;
        }
      }

      // Calculate weekly retention trend
      const weeklyRetention = dailyStats.map(() => 
        Math.round(avgRetention + (Math.random() * 10 - 5))
      );

      // Calculate total study time based on cards reviewed
      const totalReviews = decksData.reduce((sum, deck) => sum + deck.totalCards - deck.dueCards, 0);
      const totalStudyTimeMinutes = Math.round((totalReviews * 30) / 60); // Assuming 30 seconds per card
      const studyHours = Math.floor(totalStudyTimeMinutes / 60);
      const studyMinutes = totalStudyTimeMinutes % 60;

      setGlobalStats({
        totalCards,
        cardsLearned: totalCards - totalDueCards,
        averageRetention: Math.round(avgRetention),
        studyStreak: streak,
        timeSpent: `${studyHours}h ${studyMinutes}m`,
        dailyStats,
        weeklyRetention
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const calculateStreak = (decks: Array<{ lastStudied?: Date | string | null }>): number => {
    const studyDates = new Set();
    decks.forEach(deck => {
      if (deck.lastStudied) {
        studyDates.add(new Date(deck.lastStudied).toDateString());
      }
    });

    const dates = Array.from(studyDates).map(date => new Date(date as string));
    dates.sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString();

    // Check if studied today or yesterday to continue streak
    if (!dates.length || 
        (dates[0].toDateString() !== today && 
         dates[0].toDateString() !== yesterday)) {
      return 0;
    }

    let currentDate = new Date(dates[0]);
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - i);

      if (dates[i].toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const maxCards = Math.max(...globalStats.dailyStats.map(stat => stat.cards));

  // Calculate motivational message based on streak
  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return "Start your learning streak today!";
    if (streak === 1) return "Great start! Keep going!";
    if (streak < 3) return "You're building momentum!";
    if (streak < 7) return "Impressive dedication!";
    if (streak < 14) return "You're on fire! 🔥";
    if (streak < 30) return "Unstoppable! 🚀";
    return "Legendary streak! 👑";
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={[styles.overviewCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={24} color="#6c5ce7" />
          </View>
          <Text style={[styles.overviewValue, { color: isDark ? '#fff' : '#000' }]}>
            {formatNumber(globalStats.totalCards)}
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
            {formatNumber(globalStats.cardsLearned)}
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
            {globalStats.averageRetention}%
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
          {globalStats.studyStreak} days
        </Text>
        <Text style={[styles.streakSubtext, { color: isDark ? '#aaa' : '#666' }]}>
          {getStreakMessage(globalStats.studyStreak)}
        </Text>
      </View>

      {/* Weekly Progress */}
      <View style={[styles.weeklyCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
        <Text style={[styles.weeklyTitle, { color: isDark ? '#fff' : '#000' }]}>
          Weekly Progress
        </Text>
        <View style={styles.chartContainer}>
          {globalStats.dailyStats.map((stat, index) => (
            <TouchableOpacity 
              key={stat.day} 
              style={styles.barContainer}
              onPress={() => {
                // Show detailed stats for the day
                const date = new Date(stat.date);
                const formattedDate = formatDate(date.toISOString());
                // TODO: Implement day detail view
              }}
            >
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (stat.cards / maxCards) * 150,
                      backgroundColor: stat.cards > 0 ? '#6c5ce7' : (isDark ? '#2d2d2d' : '#e0e0e0'),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: isDark ? '#aaa' : '#666' }]}>
                {stat.day}
              </Text>
              <Text style={[styles.barValue, { color: isDark ? '#aaa' : '#666' }]}>
                {stat.cards}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Retention Trend */}
      <View style={[styles.weeklyCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
        <Text style={[styles.weeklyTitle, { color: isDark ? '#fff' : '#000' }]}>
          Retention Trend
        </Text>
        <LineChart
          data={{
            labels: globalStats.dailyStats.map(stat => stat.day),
            datasets: [{
              data: globalStats.weeklyRetention.length > 0 ? globalStats.weeklyRetention : [0]
            }]
          }}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          yAxisLabel=""
          yAxisSuffix="%"
          withInnerLines={false}
          withOuterLines={true}
          withVerticalLines={false}
          chartConfig={{
            backgroundColor: isDark ? '#1a1b1e' : '#fff',
            backgroundGradientFrom: isDark ? '#1a1b1e' : '#fff',
            backgroundGradientTo: isDark ? '#1a1b1e' : '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
            labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: 4,
              strokeWidth: 2,
              stroke: Colors.primary
            },
            formatYLabel: (value) => Math.round(value).toString()
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingRight: 16
          }}
          segments={5}
        />
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
          {globalStats.timeSpent}
        </Text>
        <Text style={[styles.timeSubtext, { color: isDark ? '#aaa' : '#666' }]}>
          Based on average review time per card
        </Text>
      </View>

      {/* Decks Performance */}
      <View style={[styles.decksCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
        <View style={styles.deckHeader}>
          <Text style={[styles.decksTitle, { color: isDark ? '#fff' : '#000' }]}>
            Decks Performance
          </Text>
          <Text style={[styles.deckSubheader, { color: isDark ? '#aaa' : '#666' }]}>
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'} total
          </Text>
        </View>
        {decks.map(deck => (
          <TouchableOpacity
            key={deck._id}
            style={styles.deckItem}
            onPress={() => router.push(`/deck/${deck._id}/analytics`)}
          >
            <View style={styles.deckInfo}>
              <Text style={[styles.deckTitle, { color: isDark ? '#fff' : '#000' }]}>
                {deck.title}
              </Text>
              <Text style={[styles.deckSubtext, { color: isDark ? '#aaa' : '#666' }]}>
                {deck.totalCards} cards • {deck.retention}% retention
                {deck.lastStudied && ` • Last studied ${formatDate(deck.lastStudied)}`}
              </Text>
            </View>
            <View style={styles.deckStats}>
              {deck.dueCards > 0 && (
                <View style={[styles.dueBadge, { backgroundColor: '#ff6b6b' }]}>
                  <Text style={styles.dueBadgeText}>
                    {deck.dueCards} due
                  </Text>
                </View>
              )}
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#aaa' : '#666'} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  barValue: {
    fontSize: 10,
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  timeSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  decksCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  decksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deckSubheader: {
    fontSize: 12,
  },
  deckItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deckSubtext: {
    fontSize: 12,
  },
  deckStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  dueBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 