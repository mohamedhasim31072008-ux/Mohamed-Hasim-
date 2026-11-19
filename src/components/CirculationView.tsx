import { Check, Plus, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';

type CirculationTab = 'active' | 'overdue' | 'holds' | 'returned';

export function CirculationView() {
  const {
    books,
    patrons,
    loans,
    holds,
    checkoutBook,
    returnLoan,
    renewLoan,
    cancelHold,
    setSelectedBookId,
  } = useLibrary();

  const [tab, setTab] = useState<CirculationTab>('active');
  const [quickPatronId, setQuickPatronId] = useState(patrons[0]?.id ?? '');
  const [quickBookId, setQuickBookId] = useState(
    books.find((b) => b.availableCopies > 0)?.id ?? books[0]?.id ?? ''
  );

  const activeLoans = loans.filter((l) => l.status !== 'Returned');
  const overdueLoans = loans.filter((l) => l.status === 'Overdue');
  const returnedLoans = loans.filter((l) => l.status === 'Returned');
  const openHolds = holds.filter((h) => h.status !== 'Fulfilled');

  const handleQuickCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBookId || !quickPatronId) return;
    checkoutBook(quickBookId, quickPatronId);
  };

  const displayedLoans =
    tab === 'active'
      ? activeLoans
      : tab === 'overdue'
        ? overdueLoans
        : tab === 'returned'
          ? returnedLoans
          : [];

  return (
    <div className="space-y-6">
      {/* Quick Circulation Desk Bar */}
      <form
        onSubmit={handleQuickCheckout}
        className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <label
              htmlFor="quick-patron"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Patron Cardholder
            </label>
            <select
              id="quick-patron"
              value={quickPatronId}
              onChange={(e) => setQuickPatronId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
            >
              {patrons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.cardNumber}) · {p.tier}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="quick-book"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Catalog Volume
            </label>
            <select
              id="quick-book"
              value={quickBookId}
              onChange={(e) => setQuickBookId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.availableCopies}/{b.totalCopies} avail)
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E40AF] dark:bg-blue-600 rounded-md hover:bg-[#1E3A8A] dark:hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Issue 14-Day Loan
          </button>
        </div>
      </form>

      {/* Circulation Ledger Tabs + Table */}
      <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Circulation views"
            className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-md"
          >
            {(
              [
                ['active', `Active Loans (${activeLoans.length})`],
                ['overdue', `Overdue (${overdueLoans.length})`],
                ['holds', `Holds Queue (${openHolds.length})`],
                ['returned', `Returned (${returnedLoans.length})`],
              ] as Array<[CirculationTab, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  tab === key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'holds' ? (
          openHolds.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No active hold requests in the reservation queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-5">Queue</th>
                    <th className="py-3 px-3">Volume</th>
                    <th className="py-3 px-3">Patron</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Requested</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {openHolds.map((hold) => {
                    const book = books.find((b) => b.id === hold.bookId);
                    const patron = patrons.find((p) => p.id === hold.patronId);
                    return (
                      <tr key={hold.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-5 font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                          #{hold.queuePosition}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100">
                          <button
                            type="button"
                            onClick={() => book && setSelectedBookId(book.id)}
                            className="hover:text-[#1E40AF] dark:hover:text-blue-400 text-left"
                          >
                            {book?.title ?? 'Unknown Volume'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {patron?.name ?? 'Unknown Patron'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-medium ${
                              hold.status === 'Ready for Pickup'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {hold.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500 tabular-nums">
                          {hold.requestedAt}
                        </td>
                        <td className="py-3 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {book && book.availableCopies > 0 && patron && (
                              <button
                                type="button"
                                onClick={() => checkoutBook(book.id, patron.id)}
                                className="px-2.5 py-1 text-[11px] font-medium text-white bg-[#1E40AF] dark:bg-blue-600 rounded hover:bg-[#1E3A8A]"
                              >
                                Checkout
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => cancelHold(hold.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : displayedLoans.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No circulation records match this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Volume</th>
                  <th className="py-3 px-3">Patron</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Checked Out</th>
                  <th className="py-3 px-3 text-right">
                    {tab === 'returned' ? 'Returned' : 'Due Date'}
                  </th>
                  <th className="py-3 px-3 text-right">Renewals</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {displayedLoans.map((loan) => {
                  const book = books.find((b) => b.id === loan.bookId);
                  const patron = patrons.find((p) => p.id === loan.patronId);
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-5 font-medium text-slate-900 dark:text-slate-100">
                        <button
                          type="button"
                          onClick={() => book && setSelectedBookId(book.id)}
                          className="hover:text-[#1E40AF] dark:hover:text-blue-400 text-left"
                        >
                          {book?.title ?? 'Unknown Volume'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <div>{patron?.name ?? 'Unknown Patron'}</div>
                        <div className="font-mono text-[10px] text-slate-400 tabular-nums">
                          {patron?.cardNumber}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            loan.status === 'Overdue'
                              ? 'text-red-700 dark:text-red-400'
                              : loan.status === 'Due Soon'
                                ? 'text-amber-700 dark:text-amber-400'
                                : loan.status === 'Active'
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500 tabular-nums whitespace-nowrap">
                        {loan.checkoutDate}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {tab === 'returned' ? loan.returnedDate : loan.dueDate}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500 tabular-nums">
                        {loan.renewals}/2
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        {loan.status !== 'Returned' ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => renewLoan(loan.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Renew
                            </button>
                            <button
                              type="button"
                              onClick={() => returnLoan(loan.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-[#1E40AF] dark:bg-blue-600 rounded hover:bg-[#1E3A8A]"
                            >
                              <Check className="h-3 w-3" />
                              Return
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
