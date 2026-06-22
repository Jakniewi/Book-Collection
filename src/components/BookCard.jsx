import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';

const SCORE_COLOR = (score) => {
  if (score === null) return '#888';
  if (score >= 8) return '#4caf50';
  if (score >= 5) return '#ff9800';
  return '#f44336';
};

export function BookCard({ book, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}${book.score ? `, rated ${book.score} out of 10` : ''}`}
      accessibilityHint="Opens book details"
    >
      {/* Cover */}
      <View style={styles.coverWrapper} accessibilityElementsHidden>
        {book.coverImage ? (
          <Image source={{ uri: book.coverImage }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderText}>📖</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>

        <View style={styles.meta}>
          {book.genre ? (
            <View style={styles.genrePill}>
              <Text style={styles.genreText}>{book.genre}</Text>
            </View>
          ) : null}

          {book.dateRead ? (
            <Text style={styles.date}>
              {new Date(book.dateRead).getFullYear()}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Score badge */}
      <View
        style={[styles.scoreBadge, { backgroundColor: SCORE_COLOR(book.score) }]}
        accessibilityElementsHidden
      >
        <Text style={styles.scoreText}>
          {book.score !== null ? book.score : '–'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  coverWrapper: {
    marginRight: 12,
  },
  cover: {
    width: 56,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#2a2a3e',
  },
  coverPlaceholder: {
    width: 56,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#f0f0f0',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  author: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  genrePill: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  genreText: {
    color: '#b388ff',
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    color: '#888',
    fontSize: 12,
  },
  scoreBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
