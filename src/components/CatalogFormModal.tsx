import { X } from 'lucide-react';
import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { BookFormat, BookSubject, BookVolume } from '../types/library';

const SUBJECTS: BookSubject[] = [
  'Architecture',
  'Botany & Natural History',
  'Physics & Optics',
  'Cartography',
  'Urban Studies',
  'Acoustic Ecology',
  'Computer Science',
  'Philosophy & Rhetoric',
];

const FORMATS: BookFormat[] = ['EPUB', 'PDF', 'Archival Folio', 'Audiobook'];

const TONES: BookVolume['coverTone'][] = [
  'lapis',
  'slate',
  'forest',
  'burgundy',
  'bronze',
  'charcoal',
];

export function CatalogFormModal() {
  const { isCatalogModalOpen, setIsCatalogModalOpen, addBook, openInReader } = useLibrary();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(2026);
  const [isbn, setIsbn] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [subject, setSubject] = useState<BookSubject>('Computer Science');
  const [format, setFormat] = useState<BookFormat>('EPUB');
  const [pages, setPages] = useState(320);
  const [publisher, setPublisher] = useState('Athenaeum Digital Press');
  const [totalCopies, setTotalCopies] = useState(3);
  const [coverTone, setCoverTone] = useState<BookVolume['coverTone']>('lapis');
  const [description, setDescription] = useState('');
  const [chapterTitle, setChapterTitle] = useState('Introduction');
  const [chapterText, setChapterText] = useState('');
  const [openReaderAfter, setOpenReaderAfter] = useState(true);

  if (!isCatalogModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const created = addBook({
      title,
      subtitle,
      author,
      year,
      isbn,
      callNumber,
      subject,
      format,
      pages,
      publisher,
      description,
      totalCopies,
      coverTone,
      chapterTitle,
      chapterText,
    });

    setTitle('');
    setSubtitle('');
    setAuthor('');
    setIsbn('');
    setCallNumber('');
    setDescription('');
    setChapterText('');
    setIsCatalogModalOpen(false);

    if (openReaderAfter) {
      openInReader(created.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-4"
      onClick={() => setIsCatalogModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 id="catalog-modal-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Catalog New Volume
          </h2>
          <button
            type="button"
            onClick={() => setIsCatalogModalOpen(false)}
            aria-label="Close catalog modal"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Volume Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Principles of Archival Indexing"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Optional monograph subtitle"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Author
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Full author name"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject Classification
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as BookSubject)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Digital Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BookFormat)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Publication Year
              </label>
              <input
                type="number"
                min={1450}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || 2026)}
                className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pages
                </label>
                <input
                  type="number"
                  min={1}
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value) || 200)}
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Copies
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                ISBN (Optional)
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Auto-assigned if blank"
                className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Call Number (Optional)
              </label>
              <input
                type="text"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                placeholder="Auto-assigned if blank"
                className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Binding Cloth Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setCoverTone(tone)}
                    className={`px-3 py-1.5 rounded-md border capitalize transition-colors ${
                      coverTone === tone
                        ? 'border-[#1E40AF] bg-[#1E40AF]/10 text-[#1E40AF] dark:text-blue-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Catalog Synopsis
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief editorial summary for the catalog record..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Opening Chapter Title (for Reader)
                </label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Opening Chapter Text (separate paragraphs with blank lines)
                </label>
                <textarea
                  rows={4}
                  value={chapterText}
                  onChange={(e) => setChapterText(e.target.value)}
                  placeholder="Paste monograph paragraphs here so this edition can be read and annotated immediately..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E40AF]"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={openReaderAfter}
                onChange={(e) => setOpenReaderAfter(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-[#1E40AF]"
              />
              <span>Open in Monograph Reader after saving</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-[#1E40AF] dark:bg-blue-600 rounded-md hover:bg-[#1E3A8A]"
              >
                Save to Catalog
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
