import { ArrowRight, BookOpen, Check, Clock, RotateCcw } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import type { BookSubject } from '../types/library';
import { BookCover } from './BookCover';
import { CirculationChart } from './CirculationChart';

interface DashboardViewProps {
  onSelectSubjectFilter: (subject: BookSubject) => void;
}

export function DashboardView({ onSelectSubjectFilter }: DashboardViewProps) {
  const {
    books,
    loans,
    holds,
    patrons,
    activities,
    monthlyCirculation,
    setActiveView,
    setSelectedBookId,
    openInReader,
    returnLoan,
    renewLoan,
    checkoutBook,
  } = useLibrary();

  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const checkedOutCopies = totalCopies - availableCopies;
  const utilizationPct = totalCopies > 0 ? Math.round((checkedOutCopies / totalCopies) * 100) : 0;

  const activeLoans = loans.filter((l) => l.status !== 'Returned');
  const overdueLoans = loans.filter((l) => l.status === 'Overdue');
  const dueSoonLoans = loans.filter((l) => l.status === 'Due Soon');
  const openHolds = holds.filter((h) => h.status !== 'Fulfilled');
  const totalDigitalReads = books.reduce((sum, b) => sum + b.digitalReads, 0);

  // Subject holdings breakdown
  const subjectMap = new Map<BookSubject, { titles: number; total: number; available: number }>();
  for (const book of books) {
    const prev = subjectMap.get(book.subject) ?? { titles: 0, total: 0, available: 0 };
    subjectMap.set(book.subject, {
      titles: prev.titles + 1,
      total: prev.total + book.totalCopies,
      available: prev.available + book.availableCopies,
    });
  }
  const subjectRows = Array.from(subjectMap.entries()).sort((a, b) => b[1].total - a[1].total);

  const urgentLoans = [...overdueLoans, ...dueSoonLoans, ...activeLoans.filter((l) => l.status === 'Active')].slice(0, 5);
  const featuredBooks = books.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 4-Column KPI Strip */}
      <section aria-label="Library overview metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Catalog Holdings</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {books.length} titles
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {availableCopies} of {totalCopies} copies available
          </p>
        </div>

        <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Circulation</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {activeLoans.length} loans
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {utilizationPct}% collection utilization across {patrons.length} patrons
          </p>
        </div>

        <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Digital Reader Sessions</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {totalDigitalReads.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
            +14.2% vs prior 30 days
          </p>
        </div>

        <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Circulation Exceptions</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {overdueLoans.length} overdue
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {dueSoonLoans.length} due within 48h · {openHolds.length} open holds
          </p>
        </div>
      </section>

      {/* Main Analytics Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <CirculationChart data={monthlyCirculation} />
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Holdings by Subject
            </h2>
            <button
              type="button"
              onClick={() => setActiveView('catalog')}
              className="text-xs font-medium text-[#1E40AF] dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
            >
              Browse All
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {subjectRows.map(([subject, stats]) => {
              const pct = Math.round((stats.available / stats.total) * 100);
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => onSelectSubjectFilter(subject)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors truncate pr-2">
                      {subject}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      {stats.available}/{stats.total} avail
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E40AF] dark:bg-blue-500 rounded-full transition-all duration-200"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Circulation Desk Watchlist + Activity Ledger */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Active Circulation Watchlist
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Overdue items, approaching due dates, and immediate return actions
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('circulation')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E40AF] dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
            >
              Circulation Desk
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {urgentLoans.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              All circulating volumes are currently returned.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-5">Volume</th>
                    <th className="py-2.5 px-3">Patron</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Due Date</th>
                    <th className="py-2.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {urgentLoans.map((loan) => {
                    const book = books.find((b) => b.id === loan.bookId);
                    const patron = patrons.find((p) => p.id === loan.patronId);
                    return (
                      <tr
                        key={loan.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-5 font-medium text-slate-900 dark:text-slate-100 max-w-[220px] truncate">
                          <button
                            type="button"
                            onClick={() => book && setSelectedBookId(book.id)}
                            className="hover:text-[#1E40AF] dark:hover:text-blue-400 text-left truncate w-full"
                          >
                            {book?.title ?? 'Unknown Volume'}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {patron?.name ?? 'Unknown Patron'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {loan.status === 'Overdue' ? (
                            <span className="font-medium text-red-700 dark:text-red-400">
                              Overdue
                            </span>
                          ) : loan.status === 'Due Soon' ? (
                            <span className="font-medium text-amber-700 dark:text-amber-400">
                              Due Soon
                            </span>
                          ) : (
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                          {loan.dueDate}
                        </td>
                        <td className="py-2.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => renewLoan(loan.id)}
                              title="Renew +14 days"
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Renew
                            </button>
                            <button
                              type="button"
                              onClick={() => returnLoan(loan.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-[#1E40AF] dark:bg-blue-600 rounded hover:bg-[#1E3A8A] dark:hover:bg-blue-500 transition-colors"
                            >
                              <Check className="h-3 w-3" />
                              Return
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {openHolds.some((h) => h.status === 'Ready for Pickup') && (
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {openHolds
                .filter((h) => h.status === 'Ready for Pickup')
                .slice(0, 1)
                .map((hold) => {
                  const book = books.find((b) => b.id === hold.bookId);
                  const patron = patrons.find((p) => p.id === hold.patronId);
                  return (
                    <div key={hold.id} className="flex flex-wrap items-center justify-between gap-3 w-full text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        Hold ready for pickup: <strong className="font-semibold">{book?.title}</strong> for{' '}
                        {patron?.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => book && patron && checkoutBook(book.id, patron.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                      >
                        Fulfill Checkout
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Recent Ledger */}
        <div className="lg:col-span-4 bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent Operations Log
            </h2>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <ul className="mt-4 space-y-4">
            {activities.slice(0, 5).map((act) => (
              <li key={act.id} className="text-xs border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  {act.summary}
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {act.actor} · {act.timestamp}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured Monographs Shelf */}
      <section className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Featured Digital Editions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Open directly in the Athenaeum Monograph Reader or inspect accession records
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="text-xs font-medium text-[#1E40AF] dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
          >
            Full Catalog
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredBooks.map((book) => (
            <div key={book.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => setSelectedBookId(book.id)}
                className="group text-left focus-visible:outline-none"
              >
                <div className="aspect-[3/4] w-full overflow-hidden rounded-md transition-transform duration-200 group-hover:-translate-y-0.5">
                  <BookCover book={book} className="h-full w-full rounded-md" />
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">
                  {book.subject} · {book.format}
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
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <span
                  className={`font-medium tabular-nums ${
                    book.availableCopies > 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {book.availableCopies > 0
                    ? `${book.availableCopies} avail`
                    : 'All loaned'}
                </span>
                <button
                  type="button"
                  onClick={() => openInReader(book.id)}
                  className="inline-flex items-center gap-1 font-medium text-[#1E40AF] dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
