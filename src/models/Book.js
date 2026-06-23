import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Add this constant for reading statuses
export const READING_STATUSES = [
  'Want to Read',
  'Currently Reading',
  'Finished',
  'Dropped', // Did Not Finish
];

/**
 * Creates a new Book object with defaults.
 * @param {Partial<Book>} fields
 * @returns {Book}
 */
export function createBook(fields = {}) {
  return {
    id: fields.id ?? uuidv4(),
    title: fields.title ?? '',
    author: fields.author ?? '',
    genre: fields.genre ?? '',
    readingStatus: fields.readingStatus ?? 'Want to Read', // New field
    dateRead: fields.dateRead ?? null,       // ISO string or null
    score: fields.score ?? null,             // 1–10 or null
    coverImage: fields.coverImage ?? null,   // local file URI or null
    notes: fields.notes ?? '',
    createdAt: fields.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Validates a book object. Returns an object of field → error string.
 * Empty object means valid.
 * @param {Book} book
 * @returns {Record<string, string>}
 */
export function validateBook(book) {
  const errors = {};
  if (!book.title || book.title.trim().length === 0) {
    errors.title = 'Title is required.';
  }
  if (!book.author || book.author.trim().length === 0) {
    errors.author = 'Author is required.';
  }
  if (book.score !== null && (book.score < 1 || book.score > 10)) {
    errors.score = 'Score must be between 1 and 10.';
  }
  return errors;
}

export const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Historical Fiction',
  'Non-Fiction',
  'Biography',
  'Horror',
  'Literary Fiction',
  'Other',
];

export const SORT_OPTIONS = [
  { label: 'Title (A–Z)',          key: 'title',         dir: 'asc'  },
  { label: 'Title (Z–A)',          key: 'title',         dir: 'desc' },
  { label: 'Score (high)',         key: 'score',         dir: 'desc' },
  { label: 'Score (low)',          key: 'score',         dir: 'asc'  },
  { label: 'Genre (A–Z)',          key: 'genre',         dir: 'asc'  },
  { label: 'Genre (Z–A)',          key: 'genre',         dir: 'desc' },
  { label: 'Reading Status',       key: 'readingStatus', dir: 'asc'  }, // New
  { label: 'Date (newest)',        key: 'dateRead',      dir: 'desc' },
  { label: 'Date (oldest)',        key: 'dateRead',      dir: 'asc'  },
  { label: 'Recently added',       key: 'createdAt',     dir: 'desc' },
];