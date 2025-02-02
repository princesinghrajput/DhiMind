import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Colors from '../../../../constants/Colors';
import { getDeckAnalytics } from '../../../../services/deck.service';
import { formatDate, formatNumber } from '../../../../utils/format';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;
const CHART_HEIGHT = 220;

type TimeRange = 'week' | 'month' | 'year' | 'all';

interface Analytics {
  overview: {
    totalCards: number;
    dueCards: number;
    retention: number;
    currentStreak: number;
    longestStreak: number;
    learningPace: number;
  };
  cardDistribution: {
    new: number;
    learning: number;
    review: number;
    relearning: number;
  };
  performance: {
    avgEaseFactor: number;
    retentionHistory: {
      date: string;
      retention: number;
      totalReviews: number;
    }[];
  };
  nextReview: {
    nextReview: string;
    cardsCount: number;
  } | null;
}

export default function AnalyticsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await getDeckAnalytics(id as string, timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timeRangeButtons: { label: string; value: TimeRange }[] = [
    { label: '1W', value: 'week' },
    { label: '1M', value: 'month' },
    { label: '1Y', value: 'year' },
    { label: 'All', value: 'all' },
  ];

  const retentionData = {
    labels: analytics.performance.retentionHistory.map(h => formatDate(h.date)),
    datasets: [{
      data: analytics.performance.retentionHistory.map(h => h.retention)
    }]
  };

  const distributionData = [
    {
      name: 'New',
      count: analytics.cardDistribution.new,
      color: '#4CAF50',
      legendFontColor: Colors.text,
    },
    {
      name: 'Learning',
      count: analytics.cardDistribution.learning,
      color: '#2196F3',
      legendFontColor: Colors.text,
    },
    {
      name: 'Review',
      count: analytics.cardDistribution.review,
      color: '#9C27B0',
      legendFontColor: Colors.text,
    },
    {
      name: 'Relearning',
      count: analytics.cardDistribution.relearning,
      color: '#F44336',
      legendFontColor: Colors.text,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Overview Cards */}
      <View style={styles.overviewGrid}>
        <View style={[styles.overviewCard, styles.elevation]}>
          <Text style={styles.overviewLabel}>Total Cards</Text>
          <Text style={styles.overviewValue}>{formatNumber(analytics.overview.totalCards)}</Text>
        </View>
        <View style={[styles.overviewCard, styles.elevation]}>
          <Text style={styles.overviewLabel}>Due Cards</Text>
          <Text style={styles.overviewValue}>{formatNumber(analytics.overview.dueCards)}</Text>
        </View>
        <View style={[styles.overviewCard, styles.elevation]}>
          <Text style={styles.overviewLabel}>Retention</Text>
          <Text style={styles.overviewValue}>{analytics.overview.retention}%</Text>
        </View>
        <View style={[styles.overviewCard, styles.elevation]}>
          <Text style={styles.overviewLabel}>Current Streak</Text>
          <Text style={styles.overviewValue}>{analytics.overview.currentStreak} days</Text>
        </View>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {timeRangeButtons.map(button => (
          <TouchableOpacity
            key={button.value}
            style={[
              styles.timeRangeButton,
              timeRange === button.value && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange(button.value)}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === button.value && styles.timeRangeButtonTextActive
              ]}
            >
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Retention Chart */}
      <View style={[styles.chartContainer, styles.elevation]}>
        <Text style={styles.chartTitle}>Retention Rate</Text>
        {analytics.performance.retentionHistory.length > 0 ? (
          <LineChart
            data={{
              labels: analytics.performance.retentionHistory.map(h => formatDate(h.date)),
              datasets: [{
                data: analytics.performance.retentionHistory.map(h => Math.max(0, h.retention || 0))
              }]
            }}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            yAxisLabel=""
            yAxisSuffix="%"
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withVerticalLines={false}
            chartConfig={{
              backgroundColor: Colors.white,
              backgroundGradientFrom: Colors.white,
              backgroundGradientTo: Colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(81, 45, 168, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: 4,
                strokeWidth: 2,
                stroke: Colors.primary
              },
              formatYLabel: (value) => Math.round(Number(value)).toString()
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
              paddingRight: 16
            }}
            segments={5}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No retention data available yet</Text>
          </View>
        )}
      </View>

      {/* Card Distribution */}
      <View style={[styles.chartContainer, styles.elevation]}>
        <Text style={styles.chartTitle}>Card Distribution</Text>
        {Object.values(analytics.cardDistribution).some(value => value > 0) ? (
          <PieChart
            data={distributionData}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No cards in this deck yet</Text>
          </View>
        )}
      </View>

      {/* Performance Stats */}
      <View style={[styles.statsContainer, styles.elevation]}>
        <Text style={styles.statsTitle}>Performance Stats</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Average Ease</Text>
            <Text style={styles.statValue}>{analytics.performance.avgEaseFactor.toFixed(2)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Learning Pace</Text>
            <Text style={styles.statValue}>{analytics.overview.learningPace}/day</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statValue}>{analytics.overview.longestStreak} days</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Next Review</Text>
            <Text style={styles.statValue}>
              {analytics.nextReview
                ? `${analytics.nextReview.cardsCount} cards`
                : 'None'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  overviewCard: {
    flex: 1,
    minWidth: (width - 40) / 2,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  timeRangeButtonTextActive: {
    color: Colors.white,
  },
  chartContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
}); 