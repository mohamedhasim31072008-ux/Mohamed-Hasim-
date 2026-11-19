export type BookFormat = 'EPUB' | 'PDF' | 'Archival Folio' | 'Audiobook';

export type BookSubject =
  | 'Architecture'
  | 'Botany & Natural History'
  | 'Physics & Optics'
  | 'Cartography'
  | 'Urban Studies'
  | 'Acoustic Ecology'
  | 'Computer Science'
  | 'Philosophy & Rhetoric';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  durationMinutes: number;
  paragraphs: string[];
  pullQuote?: string;
  figureCaption?: string;
}

export interface BookVolume {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  year: number;
  isbn: string;
  callNumber: string;
  subject: BookSubject;
  format: BookFormat;
  pages: number;
  language: string;
  publisher: string;
  description: string;
  coverImage?: string;
  coverTone: 'slate' | 'lapis' | 'forest' | 'burgundy' | 'bronze' | 'charcoal';
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  digitalReads: number;
  featured?: boolean;
  addedAt: string;
  chapters: Chapter[];
}

export type PatronTier = 'Faculty' | 'Graduate' | 'Public Member' | 'Visiting Fellow';

export interface Patron {
  id: string;
  name: string;
  email: string;
  cardNumber: string;
  tier: PatronTier;
  department: string;
  joinedAt: string;
  status: 'Active' | 'Restricted';
}

export type LoanStatus = 'Active' | 'Due Soon' | 'Overdue' | 'Returned';

export interface LoanRecord {
  id: string;
  bookId: string;
  patronId: string;
  checkoutDate: string;
  dueDate: string;
  returnedDate?: string;
  renewals: number;
  status: LoanStatus;
}

export interface HoldRequest {
  id: string;
  bookId: string;
  patronId: string;
  requestedAt: string;
  queuePosition: number;
  status: 'Waiting' | 'Ready for Pickup' | 'Fulfilled';
}

export type AnnotationColor = 'lapis' | 'amber' | 'forest';

export interface Annotation {
  id: string;
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  quote: string;
  note: string;
  color: AnnotationColor;
  createdAt: string;
}

export interface ReadingProgressItem {
  chapterIndex: number;
  scrollPercent: number;
  lastReadAt: string;
  bookmarkedChapters: number[];
}

export interface ActivityEvent {
  id: string;
  type: 'checkout' | 'return' | 'hold' | 'catalog' | 'annotation' | 'patron';
  summary: string;
  actor: string;
  timestamp: string;
}

export interface MonthlyCirculation {
  month: string;
  checkouts: number;
  returns: number;
  digitalReads: number;
}

export type WorkspaceView = 'dashboard' | 'catalog' | 'reader' | 'circulation' | 'patrons';
