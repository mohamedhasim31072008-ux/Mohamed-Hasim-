import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  Highlighter,
  MessageSquarePlus,
  PanelLeft,
  PanelRight,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { AnnotationColor } from '../types/library';
import { BookCover } from './BookCover';

type ReaderSurface = 'paper' | 'crisp' | 'night';
type ReaderFontSize = 'sm' | 'md' | 'lg';

const SURFACE_CLASSES: Record<ReaderSurface, string> = {
  paper: 'bg-[#FBF8F1] text-stone-900 border-stone-200',
  crisp: 'bg-white text-slate-900 border-slate-200',
  night: 'bg-[#14171D] text-slate-200 border-slate-800',
};

const FONT_SIZE_CLASSES: Record<ReaderFontSize, string> = {
  sm: 'text-[15px] leading-[1.75]',
  md: 'text-[17px] leading-[1.8]',
  lg: 'text-[19px] leading-[1.85]',
};

const HIGHLIGHT_CLASSES: Record<AnnotationColor, string> = {
  lapis: 'bg-blue-500/10 ring-1 ring-blue-500/25',
  amber: 'bg-amber-500/12 ring-1 ring-amber-500/30',
  forest: 'bg-emerald-500/10 ring-1 ring-emerald-500/25',
};

export function ReaderView() {
  const {
    books,
    activeReaderBookId,
    openInReader,
    annotations,
    addAnnotation,
    deleteAnnotation,
    progress,
    updateReadingProgress,
    toggleBookmark,
  } = useLibrary();

  const book = books.find((b) => b.id === activeReaderBookId) ?? books[0];
  const bookProgress = progress[book.id];

  const [chapterIdx, setChapterIdx] = useState<number>(bookProgress?.chapterIndex ?? 0);
  const [surface, setSurface] = useState<ReaderSurface>('paper');
  const [fontSize, setFontSize] = useState<ReaderFontSize>('md');
  const [showToc, setShowToc] = useState(true);
  const [showNotes, setShowNotes] = useState(true);

  const [annotatingParagraph, setAnnotatingParagraph] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteColor, setNoteColor] = useState<AnnotationColor>('lapis');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState<number>(bookProgress?.scrollPercent ?? 0);

  // Sync chapter index when switching books
  useEffect(() => {
    const saved = progress[book.id];
    const safeIdx =
      saved && saved.chapterIndex < book.chapters.length ? saved.chapterIndex : 0;
    setChapterIdx(safeIdx);
    setScrollPercent(saved?.scrollPercent ?? 0);
    setAnnotatingParagraph(null);
    setNoteText('');
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [book.id]);

  const chapter = book.chapters[chapterIdx] ?? book.chapters[0];
  const bookAnnotations = annotations.filter((a) => a.bookId === book.id);
  const chapterAnnotations = bookAnnotations.filter((a) => a.chapterId === chapter.id);
  const bookmarkedChapters = bookProgress?.bookmarkedChapters ?? [];
  const isBookmarked = bookmarkedChapters.includes(chapterIdx);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const pct = maxScroll > 0 ? Math.round((el.scrollTop / maxScroll) * 100) : 100;
    setScrollPercent(pct);
    updateReadingProgress(book.id, chapterIdx, pct);
  };

  const goToChapter = (idx: number) => {
    const bounded = Math.max(0, Math.min(book.chapters.length - 1, idx));
    setChapterIdx(bounded);
    setAnnotatingParagraph(null);
    setNoteText('');
    updateReadingProgress(book.id, bounded, 0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleSaveAnnotation = (pIndex: number) => {
    if (!noteText.trim()) return;
    const rawParagraph = chapter.paragraphs[pIndex] ?? '';
    const snippet =
      rawParagraph.length > 140 ? `${rawParagraph.slice(0, 140).trim()}...` : rawParagraph;
    addAnnotation(book.id, chapter.id, pIndex, snippet, noteText, noteColor);
    setNoteText('');
    setAnnotatingParagraph(null);
  };

  const handleExportNotes = () => {
    const lines = [
      `# ${book.title} — Margin Notes`,
      `Author: ${book.author} (${book.year})`,
      `Call Number: ${book.callNumber}`,
      '',
      ...bookAnnotations.map((a, idx) => {
        const ch = book.chapters.find((c) => c.id === a.chapterId);
        return [
          `## ${idx + 1}. Chapter ${ch?.number ?? ''}: ${ch?.title ?? ''}`,
          `> "${a.quote}"`,
          '',
          a.note,
          '',
        ].join('\n');
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.id}-notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isNight = surface === 'night';

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[600px] bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
      {/* Reader Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setShowToc((prev) => !prev)}
            title="Toggle Table of Contents"
            aria-label="Toggle Table of Contents"
            className={`p-1.5 rounded-md border text-xs transition-colors ${
              showToc
                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <select
            value={book.id}
            onChange={(e) => openInReader(e.target.value)}
            aria-label="Select monograph to read"
            className="max-w-[240px] sm:max-w-xs truncate px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} — {b.author}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Font Size */}
          <div
            role="group"
            aria-label="Reading text size"
            className="flex items-center gap-0.5 p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-md"
          >
            {(['sm', 'md', 'lg'] as ReaderFontSize[]).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz)}
                className={`px-2 py-1 text-[11px] font-medium rounded-sm uppercase transition-colors ${
                  fontSize === sz
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Paper Surface */}
          <div
            role="group"
            aria-label="Reader paper tone"
            className="flex items-center gap-0.5 p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-md"
          >
            {(
              [
                ['paper', 'Paper'],
                ['crisp', 'White'],
                ['night', 'Night'],
              ] as Array<[ReaderSurface, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSurface(key)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                  surface === key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => toggleBookmark(book.id, chapterIdx)}
            aria-label="Bookmark current chapter"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
              isBookmarked
                ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNotes((prev) => !prev)}
            title="Toggle Margin Notes"
            aria-label="Toggle Margin Notes"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              showNotes
                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PanelRight className="h-3.5 w-3.5" />
            <span className="tabular-nums">{bookAnnotations.length}</span>
          </button>
        </div>
      </div>

      {/* Reading Depth Progress Line */}
      <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-[#1E40AF] dark:bg-blue-500 transition-all duration-150"
          style={{
            width: `${Math.round(
              ((chapterIdx + scrollPercent / 100) / Math.max(1, book.chapters.length)) * 100
            )}%`,
          }}
        />
      </div>

      {/* 3-Pane Reader Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left TOC Rail */}
        {showToc && (
          <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-y-auto p-4 space-y-5">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <div className="w-12 aspect-[3/4] shrink-0 rounded overflow-hidden">
                <BookCover book={book} size="sm" className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <p
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2"
                >
                  {book.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                  {book.author}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-400 tabular-nums">
                  {book.callNumber}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Chapters
              </p>
              <nav className="space-y-1">
                {book.chapters.map((ch, idx) => {
                  const active = idx === chapterIdx;
                  const marked = bookmarkedChapters.includes(idx);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => goToChapter(idx)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-start justify-between gap-2 ${
                        active
                          ? 'bg-white dark:bg-slate-800 text-[#1E40AF] dark:text-blue-400 font-semibold border border-slate-200 dark:border-slate-700'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="leading-snug">
                        <span className="font-mono text-[11px] opacity-60 mr-1.5 tabular-nums">
                          {String(ch.number).padStart(2, '0')}
                        </span>
                        {ch.title}
                      </span>
                      {marked && <Bookmark className="h-3 w-3 shrink-0 mt-0.5 fill-current" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Center Reading Column */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto px-6 sm:px-12 py-10 transition-colors duration-150 ${SURFACE_CLASSES[surface]}`}
        >
          <article className="max-w-prose mx-auto">
            <header
              className={`pb-6 mb-8 border-b ${
                isNight ? 'border-slate-800' : 'border-stone-300/70'
              }`}
            >
              <p
                className={`text-xs font-mono tracking-wider uppercase tabular-nums ${
                  isNight ? 'text-slate-400' : 'text-stone-500'
                }`}
              >
                Chapter {String(chapter.number).padStart(2, '0')} · {chapter.durationMinutes} min read ·{' '}
                {book.subject}
              </p>
              <h1
                style={{ fontFamily: 'var(--font-display)' }}
                className="mt-3 text-3xl sm:text-4xl font-medium tracking-tight leading-tight text-balance"
              >
                {chapter.title}
              </h1>
              <p
                className={`mt-2 text-xs ${
                  isNight ? 'text-slate-400' : 'text-stone-500'
                }`}
              >
                From {book.title} by {book.author} ({book.year})
              </p>
            </header>

            <div className="space-y-6">
              {chapter.paragraphs.map((paragraph, pIdx) => {
                const existingNotes = chapterAnnotations.filter(
                  (a) => a.paragraphIndex === pIdx
                );
                const highlightTone = existingNotes[0]?.color;
                const isComposing = annotatingParagraph === pIdx;

                return (
                  <div key={`${chapter.id}-p-${pIdx}`} className="group relative">
                    <div
                      className={`rounded-md px-2 -mx-2 py-1 transition-colors ${
                        highlightTone ? HIGHLIGHT_CLASSES[highlightTone] : ''
                      }`}
                    >
                      <p
                        className={`${FONT_SIZE_CLASSES[fontSize]} ${
                          pIdx === 0
                            ? 'first-letter:text-5xl first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none'
                            : ''
                        }`}
                        style={
                          pIdx === 0
                            ? { fontFamily: 'var(--font-sans)' }
                            : undefined
                        }
                      >
                        {paragraph}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        {existingNotes.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E40AF] dark:text-blue-400">
                            <Highlighter className="h-3 w-3" />
                            {existingNotes.length} margin{' '}
                            {existingNotes.length === 1 ? 'note' : 'notes'}
                          </span>
                        ) : (
                          <span />
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setAnnotatingParagraph(isComposing ? null : pIdx);
                            setNoteText('');
                          }}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium transition-opacity ${
                            isComposing
                              ? 'opacity-100 text-[#1E40AF] dark:text-blue-400'
                              : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <MessageSquarePlus className="h-3.5 w-3.5" />
                          {isComposing ? 'Close Note' : 'Annotate'}
                        </button>
                      </div>
                    </div>

                    {isComposing && (
                      <div
                        className={`mt-2 p-3.5 rounded-md border text-xs space-y-3 ${
                          isNight
                            ? 'bg-slate-900 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                        }`}
                      >
                        <textarea
                          rows={2}
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Write a margin annotation or citation note..."
                          className={`w-full px-3 py-2 rounded border text-xs focus:outline-none focus:border-[#1E40AF] ${
                            isNight
                              ? 'bg-slate-950 border-slate-700 text-slate-100'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] opacity-70 mr-1">Ink:</span>
                            {(['lapis', 'amber', 'forest'] as AnnotationColor[]).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setNoteColor(c)}
                                className={`px-2 py-1 rounded text-[11px] font-medium capitalize border transition-colors ${
                                  noteColor === c
                                    ? 'border-slate-900 dark:border-slate-100 font-semibold'
                                    : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAnnotatingParagraph(null)}
                              className="px-2.5 py-1 text-[11px] opacity-75 hover:opacity-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveAnnotation(pIdx)}
                              className="px-3 py-1 text-[11px] font-medium text-white bg-[#1E40AF] rounded hover:bg-[#1E3A8A]"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Editorial Pull Quote after paragraph 1 */}
                    {pIdx === 0 && chapter.pullQuote && (
                      <blockquote
                        style={{ fontFamily: 'var(--font-display)' }}
                        className={`my-8 py-6 border-y text-xl sm:text-2xl italic leading-relaxed text-center ${
                          isNight
                            ? 'border-slate-800 text-slate-200'
                            : 'border-stone-300/80 text-stone-800'
                        }`}
                      >
                        “{chapter.pullQuote}”
                      </blockquote>
                    )}
                  </div>
                );
              })}
            </div>

            {chapter.figureCaption && (
              <p
                style={{ fontFamily: 'var(--font-display)' }}
                className={`mt-8 pt-4 border-t text-xs italic ${
                  isNight
                    ? 'border-slate-800 text-slate-400'
                    : 'border-stone-200 text-stone-500'
                }`}
              >
                {chapter.figureCaption}
              </p>
            )}

            {/* Chapter Pagination */}
            <footer
              className={`mt-12 pt-6 border-t flex items-center justify-between gap-4 ${
                isNight ? 'border-slate-800' : 'border-stone-300/70'
              }`}
            >
              <button
                type="button"
                disabled={chapterIdx === 0}
                onClick={() => goToChapter(chapterIdx - 1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-current/20 disabled:opacity-35 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Chapter
              </button>

              <span className="font-mono text-xs opacity-60 tabular-nums">
                {chapterIdx + 1} / {book.chapters.length}
              </span>

              <button
                type="button"
                disabled={chapterIdx >= book.chapters.length - 1}
                onClick={() => goToChapter(chapterIdx + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-current/20 disabled:opacity-35 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Next Chapter
                <ChevronRight className="h-4 w-4" />
              </button>
            </footer>
          </article>
        </div>

        {/* Right Margin Notes Rail */}
        {showNotes && (
          <aside className="hidden xl:flex w-80 shrink-0 flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-y-auto p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Margin Notes
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {bookAnnotations.length} saved in this volume
                </p>
              </div>
              {bookAnnotations.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportNotes}
                  title="Export notes as Markdown"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Export
                </button>
              )}
            </div>

            {bookAnnotations.length === 0 ? (
              <div className="my-auto py-8 text-center px-3">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  No margin notes yet
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Hover over any paragraph in the reading column and select Annotate to record a note.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {bookAnnotations.map((ann) => {
                  const chIdx = book.chapters.findIndex((c) => c.id === ann.chapterId);
                  const chTitle = chIdx >= 0 ? book.chapters[chIdx].title : 'Chapter';
                  return (
                    <li
                      key={ann.id}
                      className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-md p-3 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => chIdx >= 0 && goToChapter(chIdx)}
                          className="text-[11px] font-medium text-[#1E40AF] dark:text-blue-400 hover:underline truncate"
                        >
                          Ch. {chIdx + 1}: {chTitle}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAnnotation(ann.id)}
                          aria-label="Delete annotation"
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] italic text-slate-500 dark:text-slate-400 line-clamp-2">
                        “{ann.quote}”
                      </p>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {ann.note}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
