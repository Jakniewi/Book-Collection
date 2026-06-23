import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, StyleSheet, SafeAreaView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { validateBook, GENRES, READING_STATUSES } from '../models/Book';
import { updateBook, deleteBook } from '../storage/bookStorage';

const SCORE_COLOR = (score) => {
  if (score === null) return '#888';
  if (score >= 8) return '#4caf50';
  if (score >= 5) return '#ff9800';
  return '#f44336';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Want to Read': return '#ff9800';
    case 'Currently Reading': return '#4caf50';
    case 'Finished': return '#2196f3';
    case 'Dropped': return '#f44336';
    default: return '#888';
  }
};


const Field = ({ label, error, children }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);


export function BookDetailScreen({ navigation, route }) {
  const { book: initial } = route.params;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Editable fields mirror the book shape
  const [title, setTitle] = useState(initial.title);
  const [author, setAuthor] = useState(initial.author);
  const [genre, setGenre] = useState(initial.genre);
  const [readingStatus, setReadingStatus] = useState(initial.readingStatus || 'Want to Read');
  const [dateRead, setDateRead] = useState(
    initial.dateRead ? initial.dateRead.slice(0, 10) : ''
  );
  const [score, setScore] = useState(initial.score !== null ? String(initial.score) : '');
  const [notes, setNotes] = useState(initial.notes);
  const [coverImage, setCoverImage] = useState(initial.coverImage);

  // ── Image picker ──────────────────────────────────────────────────────────────
  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const pickImage = async (source) => {
    const granted = await requestPermission(source);
    if (!granted) {
      Alert.alert('Permission needed', 'Photo access is required to change the cover.');
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

  // ── Save edits ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const updated = {
      ...initial,
      title: title.trim(),
      author: author.trim(),
      genre,
      readingStatus,
      dateRead: dateRead ? new Date(dateRead).toISOString() : null,
      score: score !== '' ? Number(score) : null,
      notes: notes.trim(),
      coverImage,
    };

    const errs = validateBook(updated);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await updateBook(updated);
      setEditing(false);
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setTitle(initial.title);
    setAuthor(initial.author);
    setGenre(initial.genre);
    setReadingStatus(initial.readingStatus || 'Want to Read');
    setDateRead(initial.dateRead ? initial.dateRead.slice(0, 10) : '');
    setScore(initial.score !== null ? String(initial.score) : '');
    setNotes(initial.notes);
    setCoverImage(initial.coverImage);
    setErrors({});
    setEditing(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert(
      'Delete book',
      `Remove "${initial.title}" from your shelf? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBook(initial.id);
              navigation.popToTop();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Could not delete the book from your local shelf.');
            }
          },
        },
      ]
    );
  };

  // ── VIEW mode ─────────────────────────────────────────────────────────────────
  const renderView = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    >
      <View style={styles.viewContent}>
        {/* Hero */}
        <View style={styles.hero}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.heroCover} />
          ) : (
            <View style={styles.heroCoverPlaceholder}>
              <Text style={{ fontSize: 48 }}>📖</Text>
            </View>
          )}

          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroAuthor}>{author}</Text>

            <View style={styles.heroMeta}>
              {genre ? (
                <View style={styles.genrePill}>
                  <Text style={styles.genrePillText}>{genre}</Text>
                </View>
              ) : null}
              {readingStatus && (
                <View style={[styles.statusPill, { backgroundColor: getStatusColor(readingStatus) }]}>
                  <Text style={styles.statusPillText}>{readingStatus}</Text>
                </View>
              )}
              {score !== '' ? (
                <View style={[styles.scoreBadge, { backgroundColor: SCORE_COLOR(Number(score)) }]}>
                  <Text style={styles.scoreBadgeText}>{score}</Text>
                  <Text style={styles.scoreBadgeSub}>/10</Text>
                </View>
              ) : null}
            </View>

            {dateRead ? (
              <Text style={styles.dateText}>
                Read {new Date(dateRead).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Notes */}
        {notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesBody}>{notes}</Text>
          </View>
        ) : (
          <View style={styles.notesCard}>
            <Text style={[styles.notesBody, { color: '#444', fontStyle: 'italic' }]}>No notes added.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // ── EDIT mode ─────────────────────────────────────────────────────────────────
  const renderEdit = () => (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Cover */}
          <TouchableOpacity style={styles.coverPicker} onPress={showImageOptions} accessibilityRole="button" accessibilityLabel="Change cover image">
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

          <Field label="Title *" error={errors.title}>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={title}
              onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: null })); }}
              placeholder="Title"
              placeholderTextColor="#555"
            />
          </Field>

          <Field label="Author *" error={errors.author}>
            <TextInput
              style={[styles.input, errors.author && styles.inputError]}
              value={author}
              onChangeText={(t) => { setAuthor(t); setErrors((e) => ({ ...e, author: null })); }}
              placeholder="Author"
              placeholderTextColor="#555"
            />
          </Field>

          <Field label="Genre">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {GENRES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genreChip, genre === g && styles.genreChipActive]}
                  onPress={() => setGenre(genre === g ? '' : g)}
                >
                  <Text style={[styles.genreChipText, genre === g && styles.genreChipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Field>

          {/* Reading Status - Now styled like score buttons */}
          <Field label="Reading Status">
            <View style={styles.statusRow}>
              {READING_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusBtn,
                    readingStatus === status && styles.statusBtnActive
                  ]}
                  onPress={() => setReadingStatus(status)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: readingStatus === status }}
                  accessibilityLabel={status}
                >
                  <Text style={[
                    styles.statusBtnText,
                    readingStatus === status && styles.statusBtnTextActive
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Score (1–10)" error={errors.score}>
            <View style={styles.scoreRow}>
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.scoreBtn, Number(score) === n && styles.scoreBtnActive]}
                  onPress={() => setScore(score === String(n) ? '' : String(n))}
                >
                  <Text style={[styles.scoreBtnText, Number(score) === n && styles.scoreBtnTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Date read">
            <TextInput
              style={styles.input}
              value={dateRead}
              onChangeText={setDateRead}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#555"
              keyboardType="numeric"
              maxLength={10}
            />
          </Field>

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
            />
          </Field>

          {/* Delete */}
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑 Delete this book</Text>
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── Root ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen}>
      {/* TOP SPACER - Adds padding above the header */}
      <View style={styles.topSpacer} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={editing ? handleCancelEdit : () => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={editing ? 'Cancel edit' : 'Go back'}
        >
          <Text style={styles.headerBack}>{editing ? 'Cancel' : '‹ Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {editing ? 'Edit book' : 'Book details'}
        </Text>

        {editing ? (
          <TouchableOpacity
            style={[styles.actionBtn, saving && styles.actionBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save changes"
          >
            {saving
              ? <ActivityIndicator size="small" color="#13131f" />
              : <Text style={styles.actionBtnText}>Save</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setEditing(true)}
            accessibilityRole="button"
            accessibilityLabel="Edit book"
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {editing ? renderEdit() : renderView()}
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  actionBtn: {
    backgroundColor: '#b388ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
    minWidth: 60,
    alignItems: 'center',
  },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: {
    color: '#13131f',
    fontWeight: '700',
    fontSize: 14,
  },

  // ── View mode ──
  viewContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  hero: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  heroCover: {
    width: 100,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#1e1e2e',
  },
  heroCoverPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#1e1e2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  heroTitle: {
    color: '#f0f0f0',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  heroAuthor: {
    color: '#aaa',
    fontSize: 14,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  genrePill: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  genrePillText: {
    color: '#b388ff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 2,
  },
  scoreBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  scoreBadgeSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  dateText: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
  },
  notesLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  notesBody: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 22,
  },

  // ── Edit mode ──
  form: {
    paddingHorizontal: 16,
    paddingBottom: 60,
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
  coverPlaceholderIcon: { fontSize: 28, marginBottom: 8 },
  coverPlaceholderText: { color: '#666', fontSize: 13 },
  removeCover: {
    alignSelf: 'center',
    marginBottom: 20,
    padding: 4,
  },
  removeCoverText: { color: '#f44336', fontSize: 13 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  fieldError: { color: '#f44336', fontSize: 12, marginTop: 4 },
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
  inputError: { borderColor: '#f44336' },
  notesInput: { minHeight: 100, paddingTop: 12 },
  genreChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: '#1e1e2e',
  },
  genreChipActive: { backgroundColor: '#b388ff', borderColor: '#b388ff' },
  genreChipText: { color: '#888', fontSize: 13 },
  genreChipTextActive: { color: '#13131f', fontWeight: '700' },
  
  // Reading Status styles - matches score button style
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 19,
    backgroundColor: '#1e1e2e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: '#b388ff',
    borderColor: '#b388ff',
  },
  statusBtnText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBtnTextActive: {
    color: '#13131f',
    fontWeight: '800',
  },
  
  // Score styles
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  scoreBtnActive: { backgroundColor: '#b388ff', borderColor: '#b388ff' },
  scoreBtnText: { color: '#888', fontSize: 13, fontWeight: '600' },
  scoreBtnTextActive: { color: '#13131f', fontWeight: '800' },
  
  deleteBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: { color: '#f44336', fontSize: 15, fontWeight: '600' },
});