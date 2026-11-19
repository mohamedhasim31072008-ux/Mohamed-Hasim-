import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  MONTHLY_CIRCULATION,
  SEED_ACTIVITIES,
  SEED_ANNOTATIONS,
  SEED_BOOKS,
  SEED_HOLDS,
  SEED_LOANS,
  SEED_PATRONS,
  SEED_PROGRESS,
} from '../data/seedLibrary';
import type {
  ActivityEvent,
  Annotation,
  AnnotationColor,
  BookFormat,
  BookSubject,
  BookVolume,
  HoldRequest,
  LoanRecord,
  MonthlyCirculation,
  Patron,
  PatronTier,
  ReadingProgressItem,
  WorkspaceView,
} from '../types/library';

const STORAGE_KEY = 'athenaeum_library_state_v1';

interface PersistedState {
  books: BookVolume[];
  patrons: Patron[];
  loans: LoanRecord[];
  holds: HoldRequest[];
  annotations: Annotation[];
  progress: Record<string, ReadingProgressItem>;
  activities: ActivityEvent[];
  monthlyCirculation: MonthlyCirculation[];
}

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'warning';
}

export interface NewBookInput {
  title: string;
  subtitle: string;
  author: string;
  year: number;
  isbn: string;
  callNumber: string;
  subject: BookSubject;
  format: BookFormat;
  pages: number;
  publisher: string;
  description: string;
  totalCopies: number;
  coverTone: BookVolume['coverTone'];
  chapterTitle: string;
  chapterText: string;
}

export interface NewPatronInput {
  name: string;
  email: string;
  tier: PatronTier;
  department: string;
}

interface LibraryContextValue extends PersistedState {
  activeView: WorkspaceView;
  setActiveView: (view: WorkspaceView) => void;
  activeReaderBookId: string;
  openInReader: (bookId: string) => void;
  selectedBookId: string | null;
  setSelectedBookId: (bookId: string | null) => void;
  isCatalogModalOpen: boolean;
  setIsCatalogModalOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  checkoutBook: (bookId: string, patronId: string) => boolean;
  returnLoan: (loanId: string) => void;
  renewLoan: (loanId: string) => void;
  placeHold: (bookId: string, patronId: string) => void;
  cancelHold: (holdId: string) => void;
  addBook: (input: NewBookInput) => BookVolume;
  deleteBook: (bookId: string) => boolean;
  addPatron: (input: NewPatronInput) => Patron;
  togglePatronStatus: (patronId: string) => void;
  addAnnotation: (
    bookId: string,
    chapterId: string,
    paragraphIndex: number,
    quote: string,
    note: string,
    color: AnnotationColor
  ) => void;
  deleteAnnotation: (annotationId: string) => void;
  updateReadingProgress: (bookId: string, chapterIndex: number, scrollPercent: number) => void;
  toggleBookmark: (bookId: string, chapterIndex: number) => void;
  resetDemoData: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function getInitialPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && Array.isArray(parsed.books) && parsed.books.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fall back to seed state if storage is unavailable or corrupted
  }
  return {
    books: SEED_BOOKS,
    patrons: SEED_PATRONS,
    loans: SEED_LOANS,
    holds: SEED_HOLDS,
    annotations: SEED_ANNOTATIONS,
    progress: SEED_PROGRESS,
    activities: SEED_ACTIVITIES,
    monthlyCirculation: MONTHLY_CIRCULATION,
  };
}

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTimestamp(date: Date): string {
  const iso = date.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

function addDays(dateStr: string, days: number): string {
  const base = new Date(`${dateStr}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return formatDateIso(base);
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(getInitialPersistedState);
  const [activeView, setActiveView] = useState<WorkspaceView>('dashboard');
  const [activeReaderBookId, setActiveReaderBookId] = useState<string>('vol-01');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('athenaeum_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('athenaeum_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state]);

  const pushToast = (text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const openInReader = (bookId: string) => {
    setActiveReaderBookId(bookId);
    setSelectedBookId(null);
    setActiveView('reader');
    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) =>
        b.id === bookId ? { ...b, digitalReads: b.digitalReads + 1 } : b
      ),
    }));
  };

  const checkoutBook = (bookId: string, patronId: string): boolean => {
    const book = state.books.find((b) => b.id === bookId);
    const patron = state.patrons.find((p) => p.id === patronId);
    if (!book || !patron) return false;

    if (patron.status === 'Restricted') {
      pushToast(`${patron.name} has a restricted card and cannot check out volumes.`, 'warning');
      return false;
    }

    if (book.availableCopies <= 0) {
      pushToast(`No circulating copies available for "${book.title}". Place a hold instead.`, 'warning');
      return false;
    }

    const today = '2026-11-18';
    const dueDate = addDays(today, 14);
    const newLoan: LoanRecord = {
      id: `ln-${Date.now().toString().slice(-5)}`,
      bookId,
      patronId,
      checkoutDate: today,
      dueDate,
      renewals: 0,
      status: 'Active',
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'checkout',
      summary: `Checked out ${book.title} (Due ${dueDate})`,
      actor: patron.name,
      timestamp: formatTimestamp(new Date()),
    };

    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) =>
        b.id === bookId
          ? {
              ...b,
              availableCopies: Math.max(0, b.availableCopies - 1),
              borrowCount: b.borrowCount + 1,
            }
          : b
      ),
      loans: [newLoan, ...prev.loans],
      holds: prev.holds.map((h) =>
        h.bookId === bookId && h.patronId === patronId && h.status !== 'Fulfilled'
          ? { ...h, status: 'Fulfilled' }
          : h
      ),
      activities: [newActivity, ...prev.activities].slice(0, 24),
      monthlyCirculation: prev.monthlyCirculation.map((m, idx, arr) =>
        idx === arr.length - 1 ? { ...m, checkouts: m.checkouts + 1 } : m
      ),
    }));

    pushToast(`Checked out "${book.title}" to ${patron.name}.`, 'success');
    return true;
  };

  const returnLoan = (loanId: string) => {
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan || loan.status === 'Returned') return;

    const book = state.books.find((b) => b.id === loan.bookId);
    const patron = state.patrons.find((p) => p.id === loan.patronId);
    const today = '2026-11-18';

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'return',
      summary: `Returned ${book?.title ?? 'volume'}`,
      actor: patron?.name ?? 'Patron',
      timestamp: formatTimestamp(new Date()),
    };

    setState((prev) => {
      let promotedHold = false;
      const updatedHolds = prev.holds.map((h) => {
        if (!promotedHold && h.bookId === loan.bookId && h.status === 'Waiting') {
          promotedHold = true;
          return { ...h, status: 'Ready for Pickup' as const, queuePosition: 1 };
        }
        return h;
      });

      return {
        ...prev,
        books: prev.books.map((b) =>
          b.id === loan.bookId
            ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
            : b
        ),
        loans: prev.loans.map((l) =>
          l.id === loanId ? { ...l, status: 'Returned', returnedDate: today } : l
        ),
        holds: updatedHolds,
        activities: [newActivity, ...prev.activities].slice(0, 24),
        monthlyCirculation: prev.monthlyCirculation.map((m, idx, arr) =>
          idx === arr.length - 1 ? { ...m, returns: m.returns + 1 } : m
        ),
      };
    });

    pushToast(`Returned "${book?.title ?? 'Volume'}" to catalog.`, 'success');
  };

  const renewLoan = (loanId: string) => {
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan || loan.status === 'Returned') return;

    if (loan.renewals >= 2) {
      pushToast('Maximum renewal limit (2) reached for this loan.', 'warning');
      return;
    }

    const hasWaitingHold = state.holds.some(
      (h) => h.bookId === loan.bookId && h.status === 'Waiting'
    );
    if (hasWaitingHold) {
      pushToast('Cannot renew: another patron is waiting in the hold queue.', 'warning');
      return;
    }

    const newDueDate = addDays(loan.dueDate, 14);
    const book = state.books.find((b) => b.id === loan.bookId);

    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              dueDate: newDueDate,
              renewals: l.renewals + 1,
              status: 'Active',
            }
          : l
      ),
    }));

    pushToast(`Renewed "${book?.title ?? 'Loan'}" through ${newDueDate}.`, 'success');
  };

  const placeHold = (bookId: string, patronId: string) => {
    const book = state.books.find((b) => b.id === bookId);
    const patron = state.patrons.find((p) => p.id === patronId);
    if (!book || !patron) return;

    const existing = state.holds.find(
      (h) => h.bookId === bookId && h.patronId === patronId && h.status !== 'Fulfilled'
    );
    if (existing) {
      pushToast(`${patron.name} already holds a queue position on this title.`, 'warning');
      return;
    }

    const waitingForBook = state.holds.filter(
      (h) => h.bookId === bookId && h.status !== 'Fulfilled'
    );

    const newHold: HoldRequest = {
      id: `hd-${Date.now().toString().slice(-5)}`,
      bookId,
      patronId,
      requestedAt: '2026-11-18',
      queuePosition: waitingForBook.length + 1,
      status: book.availableCopies > 0 ? 'Ready for Pickup' : 'Waiting',
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'hold',
      summary: `Placed hold #${newHold.queuePosition} on ${book.title}`,
      actor: patron.name,
      timestamp: formatTimestamp(new Date()),
    };

    setState((prev) => ({
      ...prev,
      holds: [newHold, ...prev.holds],
      activities: [newActivity, ...prev.activities].slice(0, 24),
    }));

    pushToast(`Hold placed for ${patron.name} (Queue #${newHold.queuePosition}).`, 'info');
  };

  const cancelHold = (holdId: string) => {
    const hold = state.holds.find((h) => h.id === holdId);
    if (!hold) return;

    setState((prev) => {
      const remaining = prev.holds.filter((h) => h.id !== holdId);
      let pos = 1;
      const reindexed = remaining.map((h) => {
        if (h.bookId === hold.bookId && h.status !== 'Fulfilled') {
          return { ...h, queuePosition: pos++ };
        }
        return h;
      });
      return { ...prev, holds: reindexed };
    });

    pushToast('Hold request cancelled.', 'info');
  };

  const addBook = (input: NewBookInput): BookVolume => {
    const id = `vol-${Date.now().toString().slice(-5)}`;
    const paragraphs = input.chapterText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const newBook: BookVolume = {
      id,
      title: input.title.trim(),
      subtitle: input.subtitle.trim() || 'Monograph Edition',
      author: input.author.trim(),
      year: input.year,
      isbn: input.isbn.trim() || `978-0-8142-${Math.floor(1000 + Math.random() * 8999)}-0`,
      callNumber: input.callNumber.trim() || `Z ${Math.floor(100 + Math.random() * 899)} .A84 ${input.year}`,
      subject: input.subject,
      format: input.format,
      pages: input.pages,
      language: 'English',
      publisher: input.publisher.trim() || 'Athenaeum Digital Press',
      description: input.description.trim(),
      coverTone: input.coverTone,
      totalCopies: input.totalCopies,
      availableCopies: input.totalCopies,
      borrowCount: 0,
      digitalReads: 1,
      addedAt: '2026-11-18',
      chapters: [
        {
          id: `${id}-ch-1`,
          number: 1,
          title: input.chapterTitle.trim() || 'Opening Chapter',
          durationMinutes: Math.max(4, Math.ceil(paragraphs.join(' ').split(/\s+/).length / 180)),
          paragraphs:
            paragraphs.length > 0
              ? paragraphs
              : [
                  input.description.trim() ||
                    'Cataloged digital edition ready for archival annotation and circulation.',
                ],
        },
      ],
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'catalog',
      summary: `Cataloged new volume: ${newBook.title}`,
      actor: 'Chief Librarian',
      timestamp: formatTimestamp(new Date()),
    };

    setState((prev) => ({
      ...prev,
      books: [newBook, ...prev.books],
      activities: [newActivity, ...prev.activities].slice(0, 24),
    }));

    pushToast(`Added "${newBook.title}" to catalog.`, 'success');
    return newBook;
  };

  const deleteBook = (bookId: string): boolean => {
    const hasActiveLoan = state.loans.some(
      (l) => l.bookId === bookId && l.status !== 'Returned'
    );
    if (hasActiveLoan) {
      pushToast('Cannot remove volume while copies are actively checked out.', 'warning');
      return false;
    }

    const book = state.books.find((b) => b.id === bookId);
    setState((prev) => ({
      ...prev,
      books: prev.books.filter((b) => b.id !== bookId),
      holds: prev.holds.filter((h) => h.bookId !== bookId),
    }));

    if (activeReaderBookId === bookId && state.books.length > 1) {
      const next = state.books.find((b) => b.id !== bookId);
      if (next) setActiveReaderBookId(next.id);
    }

    pushToast(`Removed "${book?.title ?? 'Volume'}" from catalog.`, 'info');
    return true;
  };

  const addPatron = (input: NewPatronInput): Patron => {
    const newPatron: Patron = {
      id: `pat-${Date.now().toString().slice(-5)}`,
      name: input.name.trim(),
      email: input.email.trim(),
      cardNumber: `ATH-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      tier: input.tier,
      department: input.department.trim() || 'General Collection',
      joinedAt: '2026-11-18',
      status: 'Active',
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'patron',
      summary: `Registered cardholder ${newPatron.name} (${newPatron.cardNumber})`,
      actor: 'Circulation Desk',
      timestamp: formatTimestamp(new Date()),
    };

    setState((prev) => ({
      ...prev,
      patrons: [newPatron, ...prev.patrons],
      activities: [newActivity, ...prev.activities].slice(0, 24),
    }));

    pushToast(`Registered patron ${newPatron.name}.`, 'success');
    return newPatron;
  };

  const togglePatronStatus = (patronId: string) => {
    setState((prev) => ({
      ...prev,
      patrons: prev.patrons.map((p) =>
        p.id === patronId
          ? { ...p, status: p.status === 'Active' ? 'Restricted' : 'Active' }
          : p
      ),
    }));
    pushToast('Updated patron borrowing privileges.', 'info');
  };

  const addAnnotation = (
    bookId: string,
    chapterId: string,
    paragraphIndex: number,
    quote: string,
    note: string,
    color: AnnotationColor
  ) => {
    const book = state.books.find((b) => b.id === bookId);
    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      bookId,
      chapterId,
      paragraphIndex,
      quote,
      note: note.trim(),
      color,
      createdAt: new Date().toISOString(),
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'annotation',
      summary: `Added margin note in ${book?.title ?? 'volume'}`,
      actor: 'Reader Workspace',
      timestamp: formatTimestamp(new Date()),
    };

    setState((prev) => ({
      ...prev,
      annotations: [newAnnotation, ...prev.annotations],
      activities: [newActivity, ...prev.activities].slice(0, 24),
    }));
    pushToast('Saved margin annotation.', 'success');
  };

  const deleteAnnotation = (annotationId: string) => {
    setState((prev) => ({
      ...prev,
      annotations: prev.annotations.filter((a) => a.id !== annotationId),
    }));
    pushToast('Annotation removed.', 'info');
  };

  const updateReadingProgress = (bookId: string, chapterIndex: number, scrollPercent: number) => {
    setState((prev) => {
      const existing = prev.progress[bookId];
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [bookId]: {
            chapterIndex,
            scrollPercent,
            lastReadAt: new Date().toISOString(),
            bookmarkedChapters: existing?.bookmarkedChapters ?? [],
          },
        },
      };
    });
  };

  const toggleBookmark = (bookId: string, chapterIndex: number) => {
    setState((prev) => {
      const existing = prev.progress[bookId] ?? {
        chapterIndex,
        scrollPercent: 0,
        lastReadAt: new Date().toISOString(),
        bookmarkedChapters: [],
      };
      const exists = existing.bookmarkedChapters.includes(chapterIndex);
      const bookmarkedChapters = exists
        ? existing.bookmarkedChapters.filter((i) => i !== chapterIndex)
        : [...existing.bookmarkedChapters, chapterIndex];

      return {
        ...prev,
        progress: {
          ...prev.progress,
          [bookId]: {
            ...existing,
            bookmarkedChapters,
          },
        },
      };
    });
  };

  const resetDemoData = () => {
    const fresh: PersistedState = {
      books: SEED_BOOKS,
      patrons: SEED_PATRONS,
      loans: SEED_LOANS,
      holds: SEED_HOLDS,
      annotations: SEED_ANNOTATIONS,
      progress: SEED_PROGRESS,
      activities: SEED_ACTIVITIES,
      monthlyCirculation: MONTHLY_CIRCULATION,
    };
    setState(fresh);
    setActiveReaderBookId('vol-01');
    pushToast('Restored default Athenaeum archival dataset.', 'info');
  };

  return (
    <LibraryContext.Provider
      value={{
        ...state,
        activeView,
        setActiveView,
        activeReaderBookId,
        openInReader,
        selectedBookId,
        setSelectedBookId,
        isCatalogModalOpen,
        setIsCatalogModalOpen,
        theme,
        toggleTheme,
        toasts,
        dismissToast,
        checkoutBook,
        returnLoan,
        renewLoan,
        placeHold,
        cancelHold,
        addBook,
        deleteBook,
        addPatron,
        togglePatronStatus,
        addAnnotation,
        deleteAnnotation,
        updateReadingProgress,
        toggleBookmark,
        resetDemoData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return ctx;
}
