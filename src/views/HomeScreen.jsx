import React, { useEffect, useCallback } from 'react';
import {
  View, FlatList, Text, TouchableOpacity,
  ActivityIndicator, StyleSheet, SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useBookList } from '../viewmodels/useBookList';
import { BookCard } from '../components/BookCard';
import { SearchBar } from '../components/SearchBar';
import { SortPicker } from '../components/SortPicker';
import { loadBooks, addBook as storeAddBook } from '../storage/bookStorage';
import { resetStorage } from '../storage/bookStorage';
import { READING_STATUSES } from '../models/Book';

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Want to Read': return '#ff9800';
    case 'Currently Reading': return '#4caf50';
    case 'Finished': return '#2196f3';
    case 'Dropped': return '#f44336';
    default: return '#888';
  }
};

export function HomeScreen({ navigation }) {
  const {
    filteredBooks,
    loading,
    error,
    query,
    setQuery,
    sortIndex,
    setSortIndex,
    setBooks,
    refreshBooks,
  } = useBookList();

  // Load books from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await loadBooks();
        setBooks(stored);
      } catch (e) {
        console.log(e);
        Alert.alert('Error', 'Failed to load books.');
      }
    })();
  }, []);

  // Refresh books whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshBooks();
    }, [refreshBooks])
  );

  // Real add book function (persistent + UI update)
  const handleAddBook = useCallback(async (book) => {
    try {
      const updated = await storeAddBook(book);
      setBooks(updated);
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Could not save book.');
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b388ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const currentlyReadingBooks = filteredBooks.filter(
    book => book.readingStatus === 'Currently Reading'
  );

  // Add this function inside your component
  const handleResetStorage = async () => {
    Alert.alert(
      'Reset Storage',
      'This will delete all your books. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetStorage();
              setBooks([]);
              Alert.alert('Success', 'Storage has been reset.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset storage.');
            }
          },
        },
      ]
    );
  };

  // Custom render function for BookCard with status
  const renderBookItem = ({ item }) => (
    <View>
      <BookCard
        book={item}
        onPress={() =>
          navigation.navigate('BookDetail', { book: item })
        }
      />
      {item.readingStatus && (
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.readingStatus) }]}>
          <Text style={styles.statusPillText}>{item.readingStatus}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>My Bookshelf</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Refresh button */}
          {/* <TouchableOpacity
            style={styles.addBtn}
            onPress={refreshBooks}
            accessibilityLabel="Refresh books"
          >
            <Text style={styles.addBtnText}>⟳</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#f44336' }]}
            onPress={handleResetStorage}
            accessibilityLabel="Reset storage"
          >
            <Text style={styles.addBtnText}>Reset</Text>
          </TouchableOpacity>

          {/* Add button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              navigation.navigate('AddBook')
            }
            accessibilityLabel="Add a new book"
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <SearchBar
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
      />

      {/* Sort and Stats row */}
      <View style={styles.actionRow}>
        <SortPicker
          sortIndex={sortIndex}
          onChange={setSortIndex}
        />
        <TouchableOpacity
          style={styles.statsBtn}
          onPress={() => navigation.navigate('Stats')}
          accessibilityLabel="View statistics"
          accessibilityHint="Opens statistics screen with reading insights"
        >
          <Text style={styles.statsBtnText}>📊 Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Count */}
      <Text style={styles.count}>
        {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
      </Text>

      {/* Currently Reading Section */}
      {currentlyReadingBooks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Currently Reading</Text>
          <FlatList
            data={currentlyReadingBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onPress={() =>
                  navigation.navigate('BookDetail', { book: item })
                }
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        contentContainerStyle={
          filteredBooks.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>
              {query ? 'No books match your search.' : 'Your shelf is empty.'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {query ? 'Try a different term.' : 'Tap "+ Add" to log your first book.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#13131f',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#13131f',
  },
  errorText: {
    color: '#f44336',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  heading: {
    color: '#f0f0f0',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addBtn: {
    backgroundColor: '#b388ff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#13131f',
    fontWeight: '700',
    fontSize: 14,
  },
  // Action row for Sort and Stats buttons
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  statsBtn: {
    backgroundColor: '#1e1e2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  statsBtnText: {
    color: '#b388ff',
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    color: '#666',
    fontSize: 12,
    marginLeft: 16,
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#f0f0f0',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    color: '#f0f0f0',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
    marginBottom: 8,
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  // Status Pill for BookCard
  statusPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#888',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});