import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useBookList } from '../viewmodels/useBookList';
import { READING_STATUSES } from '../models/Book';

const getStatusColor = (status) => {
  switch (status) {
    case 'Want to Read': return '#ff9800';
    case 'Currently Reading': return '#4caf50';
    case 'Finished': return '#2196f3';
    case 'DNF': return '#f44336';
    default: return '#888';
  }
};

export function StatsScreen({ navigation }) {
  const { books } = useBookList();

  const stats = useMemo(() => {
    // Basic stats
    const totalBooks = books.length;

    // Average rating
    const ratedBooks = books.filter((b) => b.score !== null);
    const avgRating = ratedBooks.length > 0
      ? (ratedBooks.reduce((sum, b) => sum + b.score, 0) / ratedBooks.length)
      : 0;

    // Most common genre
    const genreCount = {};
    books.forEach((b) => {
      if (b.genre) {
        genreCount[b.genre] = (genreCount[b.genre] || 0) + 1;
      }
    });
    let mostCommonGenre = 'None';
    let maxCount = 0;
    Object.entries(genreCount).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonGenre = genre;
      }
    });

    // Reading status breakdown
    const statusCount = {};
    READING_STATUSES.forEach((status) => {
      statusCount[status] = 0;
    });
    books.forEach((b) => {
      if (b.readingStatus && statusCount.hasOwnProperty(b.readingStatus)) {
        statusCount[b.readingStatus] = (statusCount[b.readingStatus] || 0) + 1;
      }
    });

    // Books read in the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const booksLastYear = books.filter((b) => {
      if (!b.dateRead) return false;
      const readDate = new Date(b.dateRead);
      return readDate >= oneYearAgo;
    });

    // Books by score range
    const highRated = books.filter((b) => b.score !== null && b.score >= 8).length;
    const midRated = books.filter((b) => b.score !== null && b.score >= 5 && b.score < 8).length;
    const lowRated = books.filter((b) => b.score !== null && b.score < 5).length;
    const unrated = books.filter((b) => b.score === null).length;

    return {
      totalBooks,
      avgRating,
      mostCommonGenre,
      statusCount,
      booksLastYear: booksLastYear.length,
      highRated,
      midRated,
      lowRated,
      unrated,
    };
  }, [books]);

  // Helper to format rating
  const formatRating = (rating) => {
    if (rating === 0) return 'N/A';
    return rating.toFixed(1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      
      <View style={styles.topSpacer} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.headerBack}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Books */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalBooks}</Text>
          <Text style={styles.statLabel}>Total Books</Text>
        </View>

        {/* Average Rating */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatRating(stats.avgRating)}</Text>
          <Text style={styles.statLabel}>Average Rating</Text>
          <Text style={styles.statSubtext}>
            {stats.totalBooks > 0
              ? `Based on ${stats.totalBooks} book${stats.totalBooks > 1 ? 's' : ''}`
              : 'No books rated yet'}
          </Text>
        </View>

        {/* Most Common Genre */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.mostCommonGenre}</Text>
          <Text style={styles.statLabel}>Most Common Genre</Text>
          <Text style={styles.statSubtext}>
            {stats.mostCommonGenre !== 'None'
              ? `Found in ${Math.max(...Object.values(books.reduce((acc, b) => {
                  if (b.genre) acc[b.genre] = (acc[b.genre] || 0) + 1;
                  return acc;
                }, {})))} books`
              : 'No genres added yet'}
          </Text>
        </View>

        {/* Books Read This Year */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.booksLastYear}</Text>
          <Text style={styles.statLabel}>Books Read in Last Year</Text>
        </View>

        {/* Score Distribution */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Score Distribution</Text>
          <View style={styles.distributionRow}>
            <View style={styles.distributionItem}>
              <Text style={styles.distributionValue}>{stats.highRated}</Text>
              <Text style={styles.distributionLabel}>High (8-10)</Text>
            </View>
            <View style={styles.distributionItem}>
              <Text style={styles.distributionValue}>{stats.midRated}</Text>
              <Text style={styles.distributionLabel}>Medium (5-7)</Text>
            </View>
            <View style={styles.distributionItem}>
              <Text style={styles.distributionValue}>{stats.lowRated}</Text>
              <Text style={styles.distributionLabel}>Low (1-4)</Text>
            </View>
            <View style={styles.distributionItem}>
              <Text style={styles.distributionValue}>{stats.unrated}</Text>
              <Text style={styles.distributionLabel}>Unrated</Text>
            </View>
          </View>
        </View>

        {/* Reading Status Breakdown */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Reading Status</Text>
          <View style={styles.statusGrid}>
            {READING_STATUSES.map((status) => (
              <View key={status} style={styles.statusItem}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(status) },
                  ]}
                />
                <Text style={styles.statusName}>{status}</Text>
                <Text style={styles.statusCount}>{stats.statusCount[status] || 0}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#13131f',
  },
  topSpacer: {
    height: 30,
    backgroundColor: '#13131f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  headerBack: {
    color: '#b388ff',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#f0f0f0',
    fontSize: 17,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  statCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  statValue: {
    color: '#f0f0f0',
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statSubtext: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  distributionItem: {
    alignItems: 'center',
  },
  distributionValue: {
    color: '#f0f0f0',
    fontSize: 20,
    fontWeight: '700',
  },
  distributionLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  statusGrid: {
    marginTop: 12,
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusName: {
    color: '#f0f0f0',
    fontSize: 14,
    flex: 1,
  },
  statusCount: {
    color: '#b388ff',
    fontSize: 16,
    fontWeight: '700',
  },
});