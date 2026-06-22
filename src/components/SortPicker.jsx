import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Pressable,
} from 'react-native';
import { SORT_OPTIONS } from '../models/Book';

export function SortPicker({ sortIndex, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Sort by: ${SORT_OPTIONS[sortIndex].label}`}
        accessibilityHint="Opens sort options"
      >
        <Text style={styles.triggerText}>⇅ {SORT_OPTIONS[sortIndex].label}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Sort by</Text>
            <FlatList
              data={SORT_OPTIONS}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.option, index === sortIndex && styles.optionActive]}
                  onPress={() => { onChange(index); setOpen(false); }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: index === sortIndex }}
                  accessibilityLabel={item.label}
                >
                  <Text style={[styles.optionText, index === sortIndex && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {index === sortIndex && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: '#1e1e2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 10,
  },
  triggerText: {
    color: '#b388ff',
    fontSize: 13,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1e1e2e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  sheetTitle: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionActive: {
    backgroundColor: '#2a2a3e',
  },
  optionText: {
    color: '#ccc',
    fontSize: 15,
  },
  optionTextActive: {
    color: '#b388ff',
    fontWeight: '700',
  },
  check: {
    color: '#b388ff',
    fontSize: 16,
  },
});
