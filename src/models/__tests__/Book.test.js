import { createBook, validateBook, GENRES, SORT_OPTIONS } from '../Book';

// Remove: import { renderHook, act } from '@testing-library/react-native';

describe('Book Model', () => {
  describe('createBook', () => {
    test('should create a book with default values', () => {
      const book = createBook();
      expect(book).toHaveProperty('id');
      expect(book.title).toBe('');
      expect(book.author).toBe('');
      expect(book.genre).toBe('');
      expect(book.dateRead).toBeNull();
      expect(book.score).toBeNull();
      expect(book.coverImage).toBeNull();
      expect(book.notes).toBe('');
      expect(book).toHaveProperty('createdAt');
    });

    test('should create a book with provided values', () => {
      const book = createBook({
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fantasy',
        score: 8
      });
      expect(book.title).toBe('Test Book');
      expect(book.author).toBe('Test Author');
      expect(book.genre).toBe('Fantasy');
      expect(book.score).toBe(8);
    });

    test('should preserve provided ID', () => {
      const book = createBook({ id: 'custom-id-123' });
      expect(book.id).toBe('custom-id-123');
    });
  });

  describe('validateBook', () => {
    test('should return errors for empty title and author', () => {
      const book = createBook({ title: '', author: '' });
      const errors = validateBook(book);
      expect(errors.title).toBe('Title is required.');
      expect(errors.author).toBe('Author is required.');
    });

    test('should return error for score out of range', () => {
      const book = createBook({ title: 'Test', author: 'Author', score: 11 });
      const errors = validateBook(book);
      expect(errors.score).toBe('Score must be between 1 and 10.');
    });

    test('should return empty object for valid book', () => {
      const book = createBook({ title: 'Test', author: 'Author', score: 8 });
      const errors = validateBook(book);
      expect(errors).toEqual({});
    });

    test('should trim whitespace before validation', () => {
      const book = createBook({ title: '  ', author: '  ' });
      const errors = validateBook(book);
      expect(errors.title).toBeDefined();
      expect(errors.author).toBeDefined();
    });

    test('should validate score 0 as invalid', () => {
      const book = createBook({ title: 'Test', author: 'Author', score: 0 });
      const errors = validateBook(book);
      expect(errors.score).toBe('Score must be between 1 and 10.');
    });
  });

  describe('GENRES', () => {
    test('should contain all expected genres', () => {
      const expectedGenres = [
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
        'Other'
      ];
      expect(GENRES).toEqual(expectedGenres);
    });
  });

  describe('SORT_OPTIONS', () => {
    test('should have correct sort options structure', () => {
      SORT_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('key');
        expect(option).toHaveProperty('dir');
        expect(['asc', 'desc']).toContain(option.dir);
      });
    });
  });
});