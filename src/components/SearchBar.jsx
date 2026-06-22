import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export function SearchBar({ value, onChange, onClear }) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        placeholder="Search by title, author, or genre…"
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel="Search books"
        accessibilityHint="Filter by title, author, or genre"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          style={styles.clearBtn}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#f0f0f0',
    fontSize: 14,
    paddingVertical: 10,
  },
  clearBtn: {
    padding: 6,
  },
  clearText: {
    color: '#888',
    fontSize: 14,
  },
});
