import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { BookVolume } from '../types/library';

const TONE_CLASSES: Record<BookVolume['coverTone'], string> = {
  slate: 'from-slate-800 via-slate-900 to-slate-950 text-slate-100',
  lapis: 'from-[#1E3A8A] via-[#172554] to-[#0F172A] text-slate-100',
  forest: 'from-[#14532D] via-[#0F3D21] to-[#071F11] text-stone-100',
  burgundy: 'from-[#6B1D2F] via-[#4C1220] to-[#2B0912] text-stone-100',
  bronze: 'from-[#78491C] via-[#573413] to-[#321D09] text-amber-50',
  charcoal: 'from-[#27272A] via-[#18181B] to-[#09090B] text-zinc-100',
};

interface BookCoverProps {
  book: Pick<BookVolume, 'title' | 'author' | 'callNumber' | 'coverImage' | 'coverTone' | 'year'>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookCover({ book, className = '', size = 'md' }: BookCoverProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (book.coverImage && !imgFailed) {
    return (
      <div
        className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 ${className}`}
      >
        <img
          src={book.coverImage}
          alt={`Cover artwork for ${book.title}`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ${TONE_CLASSES[book.coverTone]} border border-black/15 dark:border-white/10 ${
        size === 'sm' ? 'p-2.5' : size === 'lg' ? 'p-6' : 'p-4'
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 via-white/10 to-transparent"
      />
      <div className="relative flex items-center justify-between gap-2 border-b border-white/15 pb-2">
        <span className="font-mono text-[10px] tracking-wider opacity-75 truncate tabular-nums">
          {book.callNumber}
        </span>
        {size !== 'sm' && <BookOpen className="h-3.5 w-3.5 opacity-60 shrink-0" />}
      </div>
      <div className="relative my-auto py-2">
        <p
          style={{ fontFamily: 'var(--font-display)' }}
          className={`font-semibold leading-tight text-balance ${
            size === 'sm' ? 'text-xs line-clamp-3' : size === 'lg' ? 'text-xl' : 'text-sm line-clamp-3'
          }`}
        >
          {book.title}
        </p>
      </div>
      <div className="relative flex items-center justify-between gap-2 border-t border-white/15 pt-2 text-[10px] opacity-80">
        <span className="truncate">{book.author}</span>
        <span className="font-mono tabular-nums shrink-0">{book.year}</span>
      </div>
    </div>
  );
}
