import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBook } from '../models/Book';

const BOOKS_KEY = '@bookshelf:books';

/**
 * Load all books from storage.
 * @returns {Promise<Book[]>}
 */
export async function loadBooks() {
  try {
    const raw = await AsyncStorage.getItem(BOOKS_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.map((b) => createBook(b));
  } catch (error) {
    console.error('Error loading books:', error);
    return [];
  }
}

/**
 * Persist the full books array to storage.
 * @param {Book[]} books
 */
export async function saveBooks(books) {
  try {
    if (!Array.isArray(books)) {
      books = [];
    }
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch (error) {
    console.error('Error saving books:', error);
    throw error;
  }
}

/**
 * Add a single book and persist.
 * @param {Book} book new book
 * @returns {Promise<Book[]>}
 */
export async function addBook(book) {
  try {
    const current = await loadBooks();
    const currentArray = Array.isArray(current) ? current : [];
    const updated = [book, ...currentArray];
    await saveBooks(updated);
    return updated;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
}

/**
 * Update a single book by id and persist.
 * @param {Book} updated
 * @returns {Promise<Book[]>}
 */
export async function updateBook(updated) {
  try {
    const current = await loadBooks();
    const currentArray = Array.isArray(current) ? current : [];
    const next = currentArray.map((b) => (b.id === updated.id ? updated : b));
    await saveBooks(next);
    return next;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
}

/**
 * Delete a book by id and persist.
 * @param {string} id
 * @returns {Promise<Book[]>}
 */
export async function deleteBook(id) {
  try {
    const current = await loadBooks();
    const currentArray = Array.isArray(current) ? current : [];
    const next = currentArray.filter((b) => b.id !== id);
    await saveBooks(next);
    return next;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
}

/**
 * Reset storage (for debugging purposes)
 */
export async function resetStorage() {
  try {
    await AsyncStorage.removeItem(BOOKS_KEY);
    return [];
  } catch (error) {
    console.error('Error resetting storage:', error);
    throw error;
  }
}