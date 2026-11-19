import {
  ArrowLeftRight,
  BookOpen,
  LayoutDashboard,
  Library,
  Menu,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { BookSubject, WorkspaceView } from '../types/library';
import { BookDetailModal } from './BookDetailModal';
import { CatalogFormModal } from './CatalogFormModal';
import { CatalogView } from './CatalogView';
import { CirculationView } from './CirculationView';
import { DashboardView } from './DashboardView';
import { PatronsView } from './PatronsView';
import { ReaderView } from './ReaderView';

const NAV_ITEMS: Array<{
  id: WorkspaceView;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Catalog', icon: Library },
  { id: 'reader', label: 'Monograph Reader', icon: BookOpen },
  { id: 'circulation', label: 'Circulation Desk', icon: ArrowLeftRight },
  { id: 'patrons', label: 'Patrons', icon: Users },
];

const VIEW_TITLES: Record<WorkspaceView, string> = {
  dashboard: 'Operations Dashboard',
  catalog: 'Archival & Digital Catalog',
  reader: 'Monograph Reader',
  circulation: 'Circulation Desk & Holds',
  patrons: 'Patron Directory',
};

export function LibraryShell() {
  const {
    activeView,
    setActiveView,
    setIsCatalogModalOpen,
    theme,
    toggleTheme,
    loans,
    books,
    toasts,
    dismissToast,
    resetDemoData,
  } = useLibrary();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalogSubjectFilter, setCatalogSubjectFilter] = useState<'All' | BookSubject>('All');

  const overdueCount = loans.filter((l) => l.status === 'Overdue').length;

  const handleSelectNav = (view: WorkspaceView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const handleJumpToCatalogSubject = (subject: BookSubject) => {
    setCatalogSubjectFilter(subject);
    setActiveView('catalog');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => handleSelectNav('dashboard')}
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
        >
          Athenaeum
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
          className="lg:hidden p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav aria-label="Primary workspace navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectNav(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#1E40AF]/10 dark:bg-blue-500/15 text-[#1E40AF] dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="inline-flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </span>
              {item.id === 'catalog' && (
                <span className="font-mono text-[11px] opacity-65 tabular-nums">
                  {books.length}
                </span>
              )}
              {item.id === 'circulation' && overdueCount > 0 && (
                <span className="font-mono text-[11px] text-red-600 dark:text-red-400 tabular-nums">
                  {overdueCount} due
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <span className="inline-flex items-center gap-2.5">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>{theme === 'light' ? 'Dark Workspace' : 'Light Workspace'}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={resetDemoData}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Seed Dataset</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] dark:bg-[#0E1116] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-[#151921] border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/50 backdrop-blur-[1px]"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-64 h-full bg-white dark:bg-[#151921] border-r border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary CTA on right */}
        <header className="h-14 px-4 sm:px-6 bg-white dark:bg-[#151921] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 -ml-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
                Athenaeum
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {VIEW_TITLES[activeView]}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCatalogModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1E40AF] dark:bg-blue-600 rounded-md hover:bg-[#1E3A8A] dark:hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Catalog Volume</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-[1360px] w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView onSelectSubjectFilter={handleJumpToCatalogSubject} />
          )}
          {activeView === 'catalog' && (
            <CatalogView
              key={catalogSubjectFilter}
              initialSubjectFilter={catalogSubjectFilter}
              onClearInitialSubject={() => setCatalogSubjectFilter('All')}
            />
          )}
          {activeView === 'reader' && <ReaderView />}
          {activeView === 'circulation' && <CirculationView />}
          {activeView === 'patrons' && <PatronsView />}
        </main>
      </div>

      {/* Modals */}
      <BookDetailModal />
      <CatalogFormModal />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A202B] shadow-lg text-xs text-slate-900 dark:text-slate-100"
            >
              <span
                className={`font-medium ${
                  toast.tone === 'warning'
                    ? 'text-amber-700 dark:text-amber-400'
                    : toast.tone === 'success'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {toast.text}
              </span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
