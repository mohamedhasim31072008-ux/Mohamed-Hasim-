import { Search, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { PatronTier } from '../types/library';

const TIERS: PatronTier[] = ['Faculty', 'Graduate', 'Public Member', 'Visiting Fellow'];

export function PatronsView() {
  const { patrons, loans, holds, addPatron, togglePatronStatus } = useLibrary();

  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | PatronTier>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<PatronTier>('Public Member');
  const [department, setDepartment] = useState('');

  const filteredPatrons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patrons.filter((p) => {
      if (tierFilter !== 'All' && p.tier !== tierFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.cardNumber.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q)
      );
    });
  }, [patrons, query, tierFilter]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    addPatron({ name, email, tier, department });
    setName('');
    setEmail('');
    setDepartment('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patrons, card numbers, or departments..."
              aria-label="Search patrons"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1E40AF]"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as 'All' | PatronTier)}
            aria-label="Filter patrons by tier"
            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1E40AF]"
          >
            <option value="All">All Tiers</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          {showAddForm ? <X className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
          {showAddForm ? 'Close Form' : 'Register Patron'}
        </button>
      </div>

      {/* Inline Registration Panel */}
      {showAddForm && (
        <form
          onSubmit={handleRegister}
          className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            New Library Cardholder
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Claire Beaumont"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="c.beaumont@athenaeum.edu"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Membership Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as PatronTier)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Department / Affiliation
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Comparative Literature"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E40AF] dark:bg-blue-600 rounded-md hover:bg-[#1E3A8A]"
            >
              Issue Library Card
            </button>
          </div>
        </form>
      )}

      {/* Patron Directory Table */}
      <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {filteredPatrons.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No matching patron cardholders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Cardholder</th>
                  <th className="py-3 px-3">Card Number</th>
                  <th className="py-3 px-3">Tier & Affiliation</th>
                  <th className="py-3 px-3 text-right">Active Loans</th>
                  <th className="py-3 px-3 text-right">Holds</th>
                  <th className="py-3 px-3">Privileges</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredPatrons.map((patron) => {
                  const patronActiveLoans = loans.filter(
                    (l) => l.patronId === patron.id && l.status !== 'Returned'
                  ).length;
                  const patronHolds = holds.filter(
                    (h) => h.patronId === patron.id && h.status !== 'Fulfilled'
                  ).length;

                  return (
                    <tr key={patron.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {patron.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {patron.email}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {patron.cardNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <div>{patron.tier}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {patron.department}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {patronActiveLoans}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {patronHolds}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            patron.status === 'Active'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}
                        >
                          {patron.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => togglePatronStatus(patron.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {patron.status === 'Active' ? 'Restrict' : 'Restore'}
                        </button>
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
