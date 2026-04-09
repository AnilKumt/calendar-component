export type DateRange = {
  id: string;
  start: number;
  end: number;
  color: string;
  notes: string;
};

export type StickyNote = {
  id: string;
  kind: 'general' | 'range';
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
};

export const RANGE_COLORS = ['#0667F9', '#84B179', '#D83F31', '#FF2A00'];

export const STICKY_NOTE_COLORS = ['#FEF08A', '#FDE68A', '#BFDBFE', '#BBF7D0', '#FBCFE8'];

export const HOLIDAY_REASONS: Record<number, string> = {
  1: 'New Year\'s Day',
  15: 'Mid-month Festival',
  26: 'Foundation Day',
};
