import { useState, useEffect, useCallback, useMemo } from 'react';

import { SORT_OPTIONS } from '../models/Book';
import {
  loadBooks,
  addBook,
  updateBook,
  deleteBook,
} from '../storage/bookStorage';
/**
 * ViewModel for the book list.
 * Owns all list state: raw books, search query, active sort, loading/error.
 * Views only read from here and call the returned action functions.
 */
export function useBookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState(null);   // string | null
  const [sortIndex, setSortIndex] = useState(0);           // index into SORT_OPTIONS

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = await loadBooks();
      setBooks(stored);
    } catch (e) {
      setError('Could not load your books. Please restart the app.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── CRUD actions ─────────────────────────────────────────────────────────────
  const add = useCallback(async (book) => {
    try {
      const next = await addBook(books, book);
      setBooks(next);
    } catch {
      setError('Could not save the book.');
    }
  }, [books]);

  const refreshBooks = async () => {
  const stored = await loadBooks();
  setBooks(stored);
  };

  const update = useCallback(async (book) => {
    try {
      const next = await updateBook(books, book);
      setBooks(next);
    } catch {
      setError('Could not update the book.');
    }
  }, [books]);

  const remove = useCallback(async (id) => {
    try {
      const next = await deleteBook(books, id);
      setBooks(next);
    } catch {
      setError('Could not delete the book.');
    }
  }, [books]);

  // ── Derived: filtered + sorted list ─────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    const sort = SORT_OPTIONS[sortIndex];
    const q = query.toLowerCase().trim();

    return books
      .filter((b) => {
        const matchesQuery =
          !q ||
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q);
        const matchesGenre = !genreFilter || b.genre === genreFilter;
        return matchesQuery && matchesGenre;
      })
      .sort((a, b) => {
        const valA = a[sort.key] ?? '';
        const valB = b[sort.key] ?? '';
        if (valA < valB) return sort.dir === 'asc' ? -1 : 1;
        if (valA > valB) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [books, query, genreFilter, sortIndex]);

  return {
    // state
    books,
    filteredBooks,
    loading,
    error,
    query,
    genreFilter,
    sortIndex,
    // actions
    setQuery,
    setGenreFilter,
    setSortIndex,
    add,
    update,
    remove,
    reload: load,
    setBooks,
    addBook, 
    refreshBooks,
  };
}
