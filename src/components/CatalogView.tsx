import { BookOpen, LayoutGrid, List, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { BookFormat, BookSubject } from '../types/library';
import { BookCover } from './BookCover';

const FORMATS: Array<'All' | BookFormat> = ['All', 'EPUB', 'PDF', 'Archival Folio', 'Audiobook'];

interface CatalogViewProps {
  initialSubjectFilter: 'All' | BookSubject;
  onClearInitialSubject: () => void;
}

export function CatalogView({
  initialSubjectFilter,
  onClearInitialSubject,
}: CatalogViewProps) {
  const { books, setSelectedBookId, openInReader, setIsCatalogModalOpen } = useLibrary();

  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<'All' | BookSubject>(initialSubjectFilter);
  const [format, setFormat] = useState<'All' | BookFormat>('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'circulated' | 'reads' | 'newest' | 'title'>('circulated');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const subjects = useMemo(() => {
    const set = new Set<BookSubject>();
    books.forEach((b) => set.add(b.subject));
    return Array.from(set).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books
      .filter((b) => {
        if (subject !== 'All' && b.subject !== subject) return false;
        if (format !== 'All' && b.format !== format) return false;
        if (onlyAvailable && b.availableCopies === 0) return false;
        if (!q) return true;
        return (
          b.title.toLowerCase().includes(q) ||
          b.subtitle.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.callNumber.toLowerCase().includes(q) ||
          b.subject.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'circulated') return b.borrowCount - a.borrowCount;
        if (sortBy === 'reads') return b.digitalReads - a.digitalReads;
        if (sortBy === 'newest') return b.year - a.year;
        return a.title.localeCompare(b.title);
      });
  }, [books, query, subject, format, onlyAvailable, sortBy]);

  const resetFilters = () => {
    setQuery('');
    setSubject('All');
    setFormat('All');
    setOnlyAvailable(false);
    onClearInitialSubject();
  };

  return (
    <div className="space-y-5">
      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, ISBN, or call number..."
              aria-label="Search catalog"
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as 'All' | BookSubject)}
              aria-label="Filter by subject"
              className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1E40AF]"
            >
              <option value="All">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort catalog"
              className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1E40AF]"
            >
              <option value="circulated">Sort: Most Circulated</option>
              <option value="reads">Sort: Digital Reads</option>
              <option value="newest">Sort: Publication Year</option>
              <option value="title">Sort: Title A–Z</option>
            </select>

            <div
              role="group"
              aria-label="Catalog layout mode"
              className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-md"
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-sm transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={`p-1.5 rounded-sm transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-md">
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                  format === f
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF]"
              />
              <span>Available copies only</span>
            </label>
            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'volume' : 'volumes'}
            </span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg px-6 py-16 text-center">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            No matching volumes in catalog
          </p>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try clearing active format or availability filters, or register a new monograph into the collection.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => setIsCatalogModalOpen(true)}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E40AF] dark:bg-blue-600 rounded-md hover:bg-[#1E3A8A] transition-colors"
            >
              Catalog New Volume
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map((book) => (
            <article
              key={book.id}
              className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedBookId(book.id)}
                  className="w-full text-left group focus-visible:outline-none"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-md">
                    <BookCover
                      book={book}
                      className="h-full w-full rounded-md transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="mt-3.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                    {book.subject} · {book.format} · {book.pages} pp
                  </p>
                  <h3
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                  >
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {book.author} · {book.year}
                  </p>
                </button>

                <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <span
                  className={`font-medium tabular-nums ${
                    book.availableCopies > 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {book.availableCopies > 0
                    ? `${book.availableCopies}/${book.totalCopies} available`
                    : `0/${book.totalCopies} on loan`}
                </span>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedBookId(book.id)}
                    className="font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    Inspect
                  </button>
                  <button
                    type="button"
                    onClick={() => openInReader(book.id)}
                    className="inline-flex items-center gap-1 font-medium text-[#1E40AF] dark:text-blue-400 hover:underline whitespace-nowrap"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Read
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Title & Author</th>
                  <th className="py-3 px-3">Call Number</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3 text-right">Copies</th>
                  <th className="py-3 px-3 text-right">Circulations</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-5">
                      <button
                        type="button"
                        onClick={() => setSelectedBookId(book.id)}
                        className="text-left group"
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400">
                          {book.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {book.author} · {book.year}
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap tabular-nums">
                      {book.callNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {book.subject}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {book.format}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span
                        className={
                          book.availableCopies > 0
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-amber-700 dark:text-amber-400 font-medium'
                        }
                      >
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      {book.borrowCount}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedBookId(book.id)}
                          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => openInReader(book.id)}
                          className="text-[#1E40AF] dark:text-blue-400 hover:underline font-medium"
                        >
                          Open Reader
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
