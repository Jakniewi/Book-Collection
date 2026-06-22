import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createBook, validateBook, GENRES } from '../models/Book';
import { useBookList } from '../viewmodels/useBookList';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── MOVE FIELD COMPONENT OUTSIDE THE SCREEN COMPONENT ──────────────────────
const Field = ({ label, error, children }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);

/**
 * AddBookScreen
 * Props: navigation (react-navigation)
 * Calls navigation.goBack() on save, passing the new book via route params
 * is handled by the parent — or you can wire add() from useBookList here.
 */
export function AddBookScreen({ navigation, route }) {
  const { addBook } = useBookList();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [dateRead, setDateRead] = useState('');
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Image picker ─────────────────────────────────────────────────────────────
  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const pickImage = async (source) => {
    const granted = await requestPermission(source);
    if (!granted) {
      Alert.alert(
        'Permission needed',
        source === 'camera'
          ? 'Camera access is required to take a cover photo.'
          : 'Photo library access is required to choose a cover.',
        [{ text: 'OK' }]
      );
      return;
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    };

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets?.length > 0) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Book cover', 'Choose a source', [
      { text: 'Camera', onPress: () => pickImage('camera') },
      { text: 'Photo library', onPress: () => pickImage('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const book = createBook({
      title: title.trim(),
      author: author.trim(),
      genre,
      dateRead: dateRead ? new Date(dateRead).toISOString() : null,
      score: score !== '' ? Number(score) : null,
      notes: notes.trim(),
      coverImage,
    });

    const errs = validateBook(book);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await addBook(book);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save the book. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* TOP SPACER - Adds padding above the header */}
      <View style={styles.topSpacer} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.headerBack}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add book</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save book"
        >
          {saving
            ? <ActivityIndicator size="small" color="#13131f" />
            : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always" 
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Cover image */}
            <TouchableOpacity
              style={styles.coverPicker}
              onPress={showImageOptions}
              accessibilityRole="button"
              accessibilityLabel={coverImage ? 'Change cover image' : 'Add cover image'}
            >
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverPreview} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Text style={styles.coverPlaceholderIcon}>📷</Text>
                  <Text style={styles.coverPlaceholderText}>Add cover</Text>
                </View>
              )}
            </TouchableOpacity>
            {coverImage && (
              <TouchableOpacity onPress={() => setCoverImage(null)} style={styles.removeCover}>
                <Text style={styles.removeCoverText}>Remove cover</Text>
              </TouchableOpacity>
            )}

            {/* Title */}
            <Field label="Title *" error={errors.title}>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={title}
                onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: null })); }}
                placeholder="e.g. The Name of the Wind"
                placeholderTextColor="#555"
                returnKeyType="next"
                accessibilityLabel="Book title"
              />
            </Field>

            {/* Author */}
            <Field label="Author *" error={errors.author}>
              <TextInput
                style={[styles.input, errors.author && styles.inputError]}
                value={author}
                onChangeText={(t) => { setAuthor(t); setErrors((e) => ({ ...e, author: null })); }}
                placeholder="e.g. Patrick Rothfuss"
                placeholderTextColor="#555"
                returnKeyType="next"
                accessibilityLabel="Author name"
              />
            </Field>

            {/* Genre */}
            <Field label="Genre">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreRow}>
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genreChip, genre === g && styles.genreChipActive]}
                    onPress={() => setGenre(genre === g ? '' : g)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: genre === g }}
                    accessibilityLabel={g}
                  >
                    <Text style={[styles.genreChipText, genre === g && styles.genreChipTextActive]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Field>

            {/* Score */}
            <Field label="Score (1–10)" error={errors.score}>
              <View style={styles.scoreRow}>
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.scoreBtn, Number(score) === n && styles.scoreBtnActive]}
                    onPress={() => setScore(score === String(n) ? '' : String(n))}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: Number(score) === n }}
                    accessibilityLabel={`Score ${n}`}
                  >
                    <Text style={[styles.scoreBtnText, Number(score) === n && styles.scoreBtnTextActive]}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            {/* Date read */}
            <Field label="Date read">
              <TextInput
                style={styles.input}
                value={dateRead}
                onChangeText={setDateRead}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#555"
                keyboardType="default"
                autoCapitalize="none"
                maxLength={10}
                accessibilityLabel="Date read"
              />
            </Field>

            {/* Notes */}
            <Field label="Notes">
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Thoughts, quotes, impressions…"
                placeholderTextColor="#555"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Notes"
              />
            </Field>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#13131f',
  },
  
  // TOP SPACER - Adds padding above the header
  topSpacer: {
    height: 10, // Adjust this value to control the space at the very top
    backgroundColor: '#13131f',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  headerBack: {
    color: '#888',
    fontSize: 18,
    padding: 4,
  },
  headerTitle: {
    color: '#f0f0f0',
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#b388ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#13131f',
    fontWeight: '700',
    fontSize: 14,
  },

  form: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  coverPicker: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  coverPreview: {
    width: 110,
    height: 165,
    borderRadius: 10,
    backgroundColor: '#1e1e2e',
  },
  coverPlaceholder: {
    width: 110,
    height: 165,
    borderRadius: 10,
    backgroundColor: '#1e1e2e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  coverPlaceholderText: {
    color: '#666',
    fontSize: 13,
  },
  removeCover: {
    alignSelf: 'center',
    marginBottom: 20,
    padding: 4,
  },
  removeCoverText: {
    color: '#f44336',
    fontSize: 13,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e2e',
    color: '#f0f0f0',
    fontSize: 15,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  inputError: {
    borderColor: '#f44336',
  },
  fieldError: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  genreRow: {
    flexDirection: 'row',
  },
  genreChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: '#1e1e2e',
  },
  genreChipActive: {
    backgroundColor: '#b388ff',
    borderColor: '#b388ff',
  },
  genreChipText: {
    color: '#888',
    fontSize: 13,
  },
  genreChipTextActive: {
    color: '#13131f',
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1e1e2e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBtnActive: {
    backgroundColor: '#b388ff',
    borderColor: '#b388ff',
  },
  scoreBtnText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  scoreBtnTextActive: {
    color: '#13131f',
    fontWeight: '800',
  },
});