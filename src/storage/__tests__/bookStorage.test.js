import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  loadBooks, 
  saveBooks, 
  addBook, 
  updateBook, 
  deleteBook 
} from '../../storage/bookStorage';
import { createBook } from '../../models/Book';

// Remove: import { renderHook, act } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('Book Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadBooks', () => {
    test('should return empty array when no data exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const books = await loadBooks();
      expect(books).toEqual([]);
    });

    test('should load and parse stored books', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', author: 'Author 1' },
        { id: '2', title: 'Book 2', author: 'Author 2' }
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBooks));
      const books = await loadBooks();
      expect(books).toHaveLength(2);
      expect(books[0]).toHaveProperty('id');
      expect(books[0]).toHaveProperty('title');
    });

    test('should handle JSON parse errors gracefully', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid json');
      const books = await loadBooks();
      expect(books).toEqual([]);
    });
  });

  describe('saveBooks', () => {
    test('should save books to AsyncStorage', async () => {
      const books = [
        createBook({ title: 'Test Book', author: 'Test Author' })
      ];
      await saveBooks(books);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@bookshelf:books',
        JSON.stringify(books)
      );
    });

    test('should handle non-array data gracefully', async () => {
      await saveBooks(null);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@bookshelf:books',
        JSON.stringify([])
      );
    });
  });

  describe('addBook', () => {
    test('should add a book to existing list', async () => {
      const existingBooks = [
        createBook({ id: '1', title: 'Old Book' })
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBooks));
      
      const newBook = createBook({ id: '2', title: 'New Book' });
      const result = await addBook(newBook);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(newBook);
      expect(result[1].title).toBe('Old Book');
    });
  });

  describe('updateBook', () => {
    test('should update an existing book', async () => {
      const existingBooks = [
        createBook({ id: '1', title: 'Old Title', author: 'Old Author' })
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBooks));
      
      const updatedBook = { ...existingBooks[0], title: 'New Title' };
      const result = await updateBook(updatedBook);
      
      expect(result[0].title).toBe('New Title');
    });

    test('should not modify other books', async () => {
      const existingBooks = [
        createBook({ id: '1', title: 'Book 1' }),
        createBook({ id: '2', title: 'Book 2' })
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBooks));
      
      const updatedBook = { ...existingBooks[0], title: 'Updated Book 1' };
      const result = await updateBook(updatedBook);
      
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Updated Book 1');
      expect(result[1].title).toBe('Book 2');
    });
  });

  describe('deleteBook', () => {
    test('should delete a book by id', async () => {
      const existingBooks = [
        createBook({ id: '1', title: 'Book 1' }),
        createBook({ id: '2', title: 'Book 2' })
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBooks));
      
      const result = await deleteBook('1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    test('should handle deletion of non-existent id', async () => {
      const existingBooks = [
        createBook({ id: '1', title: 'Book 1' })
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBooks));
      
      const result = await deleteBook('999');
      expect(result).toHaveLength(1);
    });
  });
});