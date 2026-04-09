'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ImageHero from '../ui/ImageHero';
import CalendarGrid from '../ui/CalendarGrid';
import { HeaderDivider } from '../ui/HeaderDivider';
import { ThemeControls } from '../ui/ThemeControls';
import NotesSection from '../ui/NotesSection';
import { useLenis } from '@/hooks/useLenis';
import { DateRange, RANGE_COLORS, STICKY_NOTE_COLORS, StickyNote } from '@/lib/calendarTypes';

const RANGES_STORAGE_KEY = 'calendar_ranges_v1';
const STICKY_NOTES_STORAGE_KEY = 'calendar_sticky_notes_v1';
const LEGACY_NOTES_STORAGE_KEY = 'calendar_notes_v1';

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`;

const getNotePosition = (index: number) => {
  const column = index % 2;
  const row = Math.floor(index / 2);

  return {
    x: 24 + column * 220,
    y: 24 + row * 180,
  };
};

const getNoteRotation = (index: number) => (index % 2 === 0 ? -2 : 1.75);

const formatRangeNoteTitle = (displayDate: Date, range: DateRange) => {
  const monthName = displayDate.toLocaleString('en-US', { month: 'short' });
  const year = displayDate.getFullYear();
  const dayLabel = range.end !== range.start ? `${range.start}-${range.end}` : `${range.start}`;
  return `Range ${dayLabel} ${monthName} ${year}`;
};

const buildRangeStickyNote = (displayDate: Date, range: DateRange, index: number): StickyNote => {
  const label = formatRangeNoteTitle(displayDate, range);
  const position = getNotePosition(index);

  return {
    id: range.id,
    kind: 'range',
    title: label,
    content: range.notes,
    color: STICKY_NOTE_COLORS[index % STICKY_NOTE_COLORS.length],
    x: position.x,
    y: position.y,
    rotation: getNoteRotation(index),
  };
};

const buildGeneralStickyNote = (
  monthKey: string,
  index: number,
  content = '',
  customPosition?: { x: number; y: number },
  title = 'Sticky note'
): StickyNote => {
  const basePosition = getNotePosition(index);

  return {
    id: `${monthKey}-note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: 'general',
    title,
    content,
    color: STICKY_NOTE_COLORS[index % STICKY_NOTE_COLORS.length],
    x: customPosition?.x ?? basePosition.x,
    y: customPosition?.y ?? basePosition.y,
    rotation: getNoteRotation(index),
  };
};

export default function WallCalendar() {
  useLenis(); // enable smooth scroll
  const [displayDate, setDisplayDate] = useState(new Date(2026, 0, 1));
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<1 | -1>(1);
  const [imgAnimKey, setImgAnimKey] = useState(0);
  const [cellsAnimKey, setCellsAnimKey] = useState(0);
  const [rangesByMonth, setRangesByMonth] = useState<Record<string, DateRange[]>>({});
  const [stickyNotesByMonth, setStickyNotesByMonth] = useState<Record<string, StickyNote[]>>({});
  const [draftStartDay, setDraftStartDay] = useState<number | null>(null);
  const [hoverPreviewDay, setHoverPreviewDay] = useState<number | null>(null);
  const [activeRangeId, setActiveRangeId] = useState<string | null>(null);
  const [hoveredRangeId, setHoveredRangeId] = useState<string | null>(null);
  const [activeStickyNoteId, setActiveStickyNoteId] = useState<string | null>(null);
  const [isCreatingNewRange, setIsCreatingNewRange] = useState(false);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const monthKey = getMonthKey(displayDate);
  const rangesForMonth = rangesByMonth[monthKey] ?? [];
  const stickyNotesForMonth = stickyNotesByMonth[monthKey] ?? [];
  const activeRange = rangesForMonth.find(range => range.id === activeRangeId) ?? null;



  useEffect(() => {
    const rawRanges = localStorage.getItem(RANGES_STORAGE_KEY);
    if (rawRanges) {
      try {
        const parsed = JSON.parse(rawRanges) as Record<string, DateRange[]>;
        setRangesByMonth(parsed);
      } catch {
        setRangesByMonth({});
      }
    }

    const rawStickyNotes = localStorage.getItem(STICKY_NOTES_STORAGE_KEY);
    if (rawStickyNotes) {
      try {
        const parsed = JSON.parse(rawStickyNotes) as Record<string, StickyNote[]>;
        setStickyNotesByMonth(parsed);
        return;
      } catch {
        setStickyNotesByMonth({});
      }
    }

    const legacyRawNotes = localStorage.getItem(LEGACY_NOTES_STORAGE_KEY);
    if (legacyRawNotes) {
      try {
        const parsed = JSON.parse(legacyRawNotes) as Record<string, string>;
        const nextStickyNotes: Record<string, StickyNote[]> = {};

        Object.entries(parsed).forEach(([month, content]) => {
          nextStickyNotes[month] = [buildGeneralStickyNote(month, 0, content)];
        });

        setStickyNotesByMonth(nextStickyNotes);
      } catch {
        setStickyNotesByMonth({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(RANGES_STORAGE_KEY, JSON.stringify(rangesByMonth));
  }, [rangesByMonth]);

  useEffect(() => {
    localStorage.setItem(STICKY_NOTES_STORAGE_KEY, JSON.stringify(stickyNotesByMonth));
  }, [stickyNotesByMonth]);

  useEffect(() => {
    setDraftStartDay(null);
    setHoverPreviewDay(null);
    setHoveredRangeId(null);

    const monthRanges = rangesByMonth[monthKey] ?? [];
    if (monthRanges.length === 0) {
      setActiveRangeId(null);
      return;
    }

    if (!monthRanges.some(range => range.id === activeRangeId)) {
      setActiveRangeId(monthRanges[0].id);
    }
  }, [monthKey, rangesByMonth, activeRangeId]);

  const handleMonthNav = useCallback((dir: 1 | -1) => {
    if (flipping) return;

    setFlipDir(dir);
    setFlipping(true);

    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
    }

    flipTimerRef.current = setTimeout(() => {
      setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
      setImgAnimKey(prev => prev + 1);
      setCellsAnimKey(prev => prev + 1);
      setFlipping(false);
    }, 420);
  }, [flipping]);

  const handleDayClick = useCallback((day: number, rangeIdAtDay: string | null) => {
    if (draftStartDay !== null) {
      const start = Math.min(draftStartDay, day);
      const end = Math.max(draftStartDay, day);
      const nextColor = RANGE_COLORS[rangesForMonth.length % RANGE_COLORS.length];
      const newRange: DateRange = {
        id: `${monthKey}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        start,
        end,
        color: nextColor,
        notes: '',
      };

      setRangesByMonth(prev => ({
        ...prev,
        [monthKey]: [...(prev[monthKey] ?? []), newRange],
      }));
      setActiveRangeId(newRange.id);
      setDraftStartDay(null);
      setHoverPreviewDay(null);
      setIsCreatingNewRange(false);
      return;
    }

    if (rangeIdAtDay && !isCreatingNewRange) {
      setActiveRangeId(rangeIdAtDay);
      return;
    }

    setDraftStartDay(day);
    setHoverPreviewDay(day);
    setIsCreatingNewRange(false);
  }, [draftStartDay, isCreatingNewRange, monthKey, rangesForMonth.length]);

  const handleHoverPreviewDay = useCallback((day: number | null) => {
    setHoverPreviewDay(day);
  }, []);

  const handleRangeHover = useCallback((rangeId: string | null) => {
    setHoveredRangeId(rangeId);
  }, []);

  const handleRangeColorChange = useCallback((rangeId: string, color: string) => {
    setRangesByMonth(prev => ({
      ...prev,
      [monthKey]: (prev[monthKey] ?? []).map(range => (range.id === rangeId ? { ...range, color } : range)),
    }));
  }, [monthKey]);

  const handleRangeDelete = useCallback((rangeId: string) => {
    setRangesByMonth(prev => {
      const nextMonthRanges = (prev[monthKey] ?? []).filter(range => range.id !== rangeId);
      return {
        ...prev,
        [monthKey]: nextMonthRanges,
      };
    });

    setStickyNotesByMonth(prev => ({
      ...prev,
      [monthKey]: (prev[monthKey] ?? []).filter(note => note.id !== rangeId),
    }));

    setHoveredRangeId(current => (current === rangeId ? null : current));
    setActiveRangeId(current => (current === rangeId ? null : current));
    setActiveStickyNoteId(current => (current === rangeId ? null : current));
  }, [monthKey]);

  const handleStickyNoteAdd = useCallback((position?: { x: number; y: number }) => {
    setStickyNotesByMonth(prev => {
      const monthStickyNotes = prev[monthKey] ?? [];
      const nextNote = buildGeneralStickyNote(monthKey, monthStickyNotes.length, '', position);

      setActiveStickyNoteId(nextNote.id);
      return {
        ...prev,
        [monthKey]: [...monthStickyNotes, nextNote],
      };
    });
  }, [monthKey]);

  const handleStickyNoteTitleUpdate = useCallback((noteId: string, title: string) => {
    setStickyNotesByMonth(prev => ({
      ...prev,
      [monthKey]: (prev[monthKey] ?? []).map(note => (note.id === noteId ? { ...note, title } : note)),
    }));
  }, [monthKey]);

  const handleStickyNoteUpdate = useCallback((noteId: string, content: string) => {
    setStickyNotesByMonth(prev => ({
      ...prev,
      [monthKey]: (prev[monthKey] ?? []).map(note => (note.id === noteId ? { ...note, content } : note)),
    }));

    setRangesByMonth(prev => {
      const monthRanges = prev[monthKey] ?? [];
      const targetIndex = monthRanges.findIndex(range => range.id === noteId);
      if (targetIndex === -1) {
        return prev;
      }

      const targetRange = monthRanges[targetIndex];
      if (targetRange.notes === content) {
        return prev;
      }

      const nextMonthRanges = [...monthRanges];
      nextMonthRanges[targetIndex] = { ...targetRange, notes: content };

      return {
        ...prev,
        [monthKey]: nextMonthRanges,
      };
    });
  }, [monthKey]);

  const handleStickyNoteMove = useCallback((noteId: string, x: number, y: number) => {
    setStickyNotesByMonth(prev => ({
      ...prev,
      [monthKey]: (prev[monthKey] ?? []).map(note => (note.id === noteId ? { ...note, x, y } : note)),
    }));
  }, [monthKey]);

  const handleStickyNoteDelete = useCallback((noteId: string) => {
    setStickyNotesByMonth(prev => ({
      ...prev,
      [monthKey]: (prev[monthKey] ?? []).filter(note => note.id !== noteId),
    }));

    setActiveStickyNoteId(current => (current === noteId ? null : current));
  }, [monthKey]);

  const handleEditRangeNotes = useCallback((rangeId: string) => {
    setActiveRangeId(rangeId);
    setActiveStickyNoteId(rangeId);

    const range = rangesForMonth.find(item => item.id === rangeId);
    if (!range) {
      return;
    }

    setStickyNotesByMonth(prev => {
      const monthStickyNotes = prev[monthKey] ?? [];

      const existingNoteIndex = monthStickyNotes.findIndex(note => note.id === rangeId);
      if (existingNoteIndex !== -1) {
        const nextMonthStickyNotes = [...monthStickyNotes];
        nextMonthStickyNotes[existingNoteIndex] = {
          ...nextMonthStickyNotes[existingNoteIndex],
          title: formatRangeNoteTitle(displayDate, range),
          content: range.notes,
          x: Math.max(8, nextMonthStickyNotes[existingNoteIndex].x),
          y: Math.max(8, nextMonthStickyNotes[existingNoteIndex].y),
        };

        return {
          ...prev,
          [monthKey]: nextMonthStickyNotes,
        };
      }

      const visibleSlot = monthStickyNotes.filter(note => note.kind === 'range').length % 3;
      const nextRangeNote = {
        ...buildRangeStickyNote(displayDate, range, monthStickyNotes.length),
        x: 16 + visibleSlot * 26,
        y: 16 + visibleSlot * 20,
      };

      return {
        ...prev,
        [monthKey]: [...monthStickyNotes, nextRangeNote],
      };
    });

    requestAnimationFrame(() => {
      const notesPanel = document.getElementById('notes-section');
      notesPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [displayDate, monthKey, rangesForMonth]);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="min-h-screen font-sans" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <header className="w-full px-4 py-4 md:px-8" style={{ backgroundColor: 'var(--panel-bg)' }}>
        <div className="mx-auto w-full max-w-6xl flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
            <p className="text-[1.5rem] leading-tight sm:text-[2rem]" style={{ color: 'var(--text-primary)' }}>
              Made by{' '}
              <a
                href="https://www.linkedin.com/in/anil-kumt/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline decoration-2 underline-offset-2"
                style={{ color: 'inherit' }}
              >
                Anil
              </a>
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <p className="text-[1.5rem] leading-tight sm:text-[2rem]" style={{ color: 'var(--text-primary)' }}>
                View my other frontend work here:
              </p>
              <div className="avatars">
                <a
                  href="https://padhletahu.netlify.app/"
                  className="avatar-link"
                  data-tooltip="Padh Leta Hu - course material website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="avatar">
                    <object type="image/svg+xml" data="/padhletahu.svg" className="avatar-image" aria-label="Padh Leta Hu" />
                  </div>
                </a>

                <a
                  href="https://gdg-iiitdmk.netlify.app/"
                  className="avatar-link"
                  data-tooltip="Google Developer Group - IIITDMK"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="avatar">
                    <object type="image/svg+xml" data="/gdg.svg" className="avatar-image" aria-label="GDG IIITDMK" />
                  </div>
                </a>
              </div>
            </div>
          </div>

          <ThemeControls />
        </div>
      </header>

      <HeaderDivider />

      <div className="w-full px-4 pb-4 md:px-8 md:pb-8">
        <div className="mx-auto w-full max-w-6xl mt-5 md:mt-6">
          <div className="relative pt-5 sm:-pt-10 md:pt-15">
            <img
              src="/spiral_transparent.png"
              alt="Calendar spiral binding"
              className="hidden lg:block pointer-events-none select-none absolute left-1/2 -top-27 z-20 h-auto w-[90%] -translate-x-1/2"
            />

            <div className="w-full md:rounded-2xl rounded-xl shadow-[0_18px_55px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row relative border" style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--panel-bg)' }}>
          <div className="w-full md:w-5/12 lg:w-1/2 relative overflow-hidden h-[42vh] sm:h-[48vh] md:h-auto md:min-h-[80vh] border-b md:border-b-0 md:border-r" style={{ borderColor: 'var(--panel-border)', backgroundColor: '#ffffff' }}>
            <ImageHero displayDate={displayDate} imgAnimKey={imgAnimKey} />
          </div>

          <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col p-6 md:p-10 lg:p-12 justify-between relative z-10" style={{ backgroundColor: 'var(--panel-bg)' }}>
            <div className="space-y-12 flex-1 flex flex-col">
              <div className="calendar-perspective">
                <div className={`calendar-card ${flipping ? (flipDir === 1 ? 'flip-forward' : 'flip-backward') : ''}`}>
                  <CalendarGrid
                    displayDate={displayDate}
                    onNavigateMonth={handleMonthNav}
                    cellsAnimKey={cellsAnimKey}
                    ranges={rangesForMonth}
                    draftStartDay={draftStartDay}
                    hoverPreviewDay={hoverPreviewDay}
                    activeRangeId={activeRangeId}
                    hoveredRangeId={hoveredRangeId}
                    onDayClick={handleDayClick}
                    onDayHover={handleHoverPreviewDay}
                    onRangeHover={handleRangeHover}
                    onRangeColorChange={handleRangeColorChange}
                    onEditRangeNotes={handleEditRangeNotes}
                  />
                </div>
              </div>

              <NotesSection
                activeRange={activeRange}
                ranges={rangesForMonth}
                stickyNotes={stickyNotesForMonth}
                activeStickyNoteId={activeStickyNoteId}
                onSelectRange={setActiveRangeId}
                onAddStickyNote={handleStickyNoteAdd}
                onUpdateStickyNote={handleStickyNoteUpdate}
                onUpdateStickyNoteTitle={handleStickyNoteTitleUpdate}
                onMoveStickyNote={handleStickyNoteMove}
                onDeleteStickyNote={handleStickyNoteDelete}
                onDeleteRange={handleRangeDelete}
              />
            </div>
          </div>
        </div>
          </div>
      </div>
      </div>
    </section>
  );
}
