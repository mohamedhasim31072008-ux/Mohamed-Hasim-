import { BookOpen, BookmarkCheck, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { BookCover } from './BookCover';

export function BookDetailModal() {
  const {
    books,
    patrons,
    holds,
    loans,
    selectedBookId,
    setSelectedBookId,
    openInReader,
    checkoutBook,
    placeHold,
    deleteBook,
  } = useLibrary();

  const [selectedPatronId, setSelectedPatronId] = useState(patrons[0]?.id ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const book = books.find((b) => b.id === selectedBookId);
  if (!book) return null;

  const activeLoansForBook = loans.filter(
    (l) => l.bookId === book.id && l.status !== 'Returned'
  );
  const openHoldsForBook = holds.filter(
    (h) => h.bookId === book.id && h.status !== 'Fulfilled'
  );

  const handleAction = () => {
    if (!selectedPatronId) return;
    if (book.availableCopies > 0) {
      checkoutBook(book.id, selectedPatronId);
    } else {
      placeHold(book.id, selectedPatronId);
    }
  };

  const handleDelete = () => {
    const ok = deleteBook(book.id);
    if (ok) {
      setConfirmDelete(false);
      setSelectedBookId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-4"
      onClick={() => {
        setConfirmDelete(false);
        setSelectedBookId(null);
      }}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Accession Record · {book.callNumber}
          </span>
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(false);
              setSelectedBookId(null);
            }}
            aria-label="Close accession dialog"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-4">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-md">
              <BookCover book={book} size="lg" className="h-full w-full rounded-md" />
            </div>

            <button
              type="button"
              onClick={() => openInReader(book.id)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1E40AF] dark:bg-blue-600 rounded-md hover:bg-[#1E3A8A] dark:hover:bg-blue-500 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Open in Reader
            </button>
          </div>

          <div className="md:col-span-8 space-y-5">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {book.subject} · {book.format} · {book.year}
              </p>
              <h2
                id="book-detail-title"
                style={{ fontFamily: 'var(--font-display)' }}
                className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-tight text-balance"
              >
                {book.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {book.subtitle}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                By {book.author}
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {book.description}
            </p>

            {/* Accession Metadata Grid */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">ISBN</dt>
                <dd className="mt-0.5 font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {book.isbn}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Publisher</dt>
                <dd className="mt-0.5 text-slate-900 dark:text-slate-100">{book.publisher}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Extent & Language</dt>
                <dd className="mt-0.5 text-slate-900 dark:text-slate-100 tabular-nums">
                  {book.pages} pages · {book.language}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Circulation History</dt>
                <dd className="mt-0.5 text-slate-900 dark:text-slate-100 tabular-nums">
                  {book.borrowCount} loans · {book.digitalReads} digital reads
                </dd>
              </div>
            </dl>

            {/* Circulation & Hold Desk */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span
                  className={`font-medium tabular-nums ${
                    book.availableCopies > 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {book.availableCopies} of {book.totalCopies} copies available
                </span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                  {activeLoansForBook.length} active loans · {openHoldsForBook.length} in hold queue
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <select
                  value={selectedPatronId}
                  onChange={(e) => setSelectedPatronId(e.target.value)}
                  aria-label="Select patron for checkout or hold"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
                >
                  {patrons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.cardNumber}) — {p.status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAction}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                >
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  {book.availableCopies > 0 ? 'Check Out (14d)' : 'Place Hold'}
                </button>
              </div>
            </div>

            {/* Chapters Preview & Remove */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {book.chapters.length} digitized {book.chapters.length === 1 ? 'chapter' : 'chapters'} indexed
              </span>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Withdraw Volume
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-red-600 dark:text-red-400">Confirm withdrawal?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-2.5 py-1 font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Withdraw
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
