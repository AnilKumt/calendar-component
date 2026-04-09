'use client';

import React, { useEffect, useRef, useState } from 'react';
import { StickyNote } from '@/lib/calendarTypes';

interface NotesSectionProps {
  activeRange: any;
  ranges: any[];
  stickyNotes: StickyNote[];
  activeStickyNoteId: string | null;
  onSelectRange: (id: string | null) => void;
  onAddStickyNote: (position?: { x: number; y: number }) => void;
  onUpdateStickyNote: (noteId: string, content: string) => void;
  onUpdateStickyNoteTitle: (noteId: string, title: string) => void;
  onMoveStickyNote: (noteId: string, x: number, y: number) => void;
  onDeleteStickyNote: (noteId: string) => void;
  onDeleteRange: (rangeId: string) => void;
}

const PAPER_SIZE = 170;

type PaperProps = {
  size?: number;
  color?: string;
  roll?: boolean;
};

const Paper = ({ size = PAPER_SIZE, color = '#FFBDF2', roll = false }: PaperProps) => {
  const id = useRef(Math.random());
  const maskRef = useRef<SVGPathElement>(null);
  const rollRef = useRef<SVGPathElement>(null);
  const shadowRef = useRef<SVGPathElement>(null);
  const rollLightRef = useRef<SVGPathElement>(null);

  const maskId = `mask-${id.current}`;
  const gradientId = `gradient-${id.current}`;
  const blurId = `blur-${id.current}`;

  useEffect(() => {
    const distance = getDistance(size, roll);

    if (maskRef.current) maskRef.current.setAttribute('d', getMaskD(distance, size));
    if (rollRef.current) rollRef.current.setAttribute('d', getRollD(distance, size));
    if (rollLightRef.current) rollLightRef.current.setAttribute('d', getRollD(distance, size));
    if (shadowRef.current) shadowRef.current.setAttribute('d', getShadowD(distance, size));
  }, [roll, size]);

  return (
    <svg
      className="paper"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ filter: 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.15))' }}
    >
      <g mask={`url(#${maskId})`}>
        <rect width={size} height={size} fill={color} />
        <path ref={shadowRef} fill="black" fillOpacity="0.28" filter={`url(#${blurId})`} />
        <path fill={color} ref={rollRef} />
        <path fill={`url(#${gradientId})`} ref={rollLightRef} />
      </g>

      <mask id={maskId}>
        <path ref={maskRef} fill="white" />
      </mask>

      <defs>
        <linearGradient id={gradientId} x1="0.48" x2="0.6" y1="0.45" y2="0.6">
          <stop offset="0%" stopColor="#ffffff60" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>

        <filter id={blurId} x="-58" y="-45.9995" width={size} height={size} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation={size / 10} result="effect1_foregroundBlur"></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
};

type PapersInlineProps = {
  size: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onCreate: (position: { x: number; y: number }) => void;
};

const PapersInline = ({ size, canvasRef, onCreate }: PapersInlineProps) => {
  const [dragging, setDragging] = useState(false);
  const [out, setOut] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [colors, setColors] = useState(new Array(4).fill(0).map(getRandomPaperColor));

  const dockRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const dockRectRef = useRef<DOMRect | null>(null);
  const currentPos = useRef({ x: 0, y: 0 });

  const dragStart = (x: number, y: number) => {
    setDragging(true);
    startPos.current = { x, y };
    currentPos.current = { x, y };
    dockRectRef.current = dockRef.current?.getBoundingClientRect() ?? null;
  };

  const onDrag = (x: number, y: number) => {
    if (!dragging || !dockRectRef.current) return;

    currentPos.current = { x, y };
    setOffset({ x: x - startPos.current.x, y: y - startPos.current.y });

    const isOut = y < dockRectRef.current.top || x < dockRectRef.current.left || x > dockRectRef.current.right;
    setOut(isOut);
  };

  const onEnd = () => {
    if (!dragging) return;

    setDragging(false);
    setOffset({ x: 0, y: 0 });

    if (out && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const relativeX = Math.max(8, Math.min(canvasRect.width - size - 8, currentPos.current.x - canvasRect.left));
      const relativeY = Math.max(8, Math.min(canvasRect.height - size - 8, currentPos.current.y - canvasRect.top));
      onCreate({ x: relativeX, y: relativeY });
      setColors([getRandomPaperColor(), ...colors.slice(0, 3)]);
    }

    setOut(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onDrag(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => onDrag(e.touches[0].clientX, e.touches[0].clientY);

    window.addEventListener('mouseup', onEnd);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [dragging, out, colors]);

  return (
    <div className="dock-wrapper" style={{ '--w': '300px', '--h': '120px', '--br': '24px' } as React.CSSProperties}>
      <div className="dock-clip">
        <div ref={dockRef} className={`dock ${dragging ? 'dragging' : ''} ${out ? 'out' : ''}`}>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div className="paper-wrapper" key={i}>
                <Paper size={size} roll={i === 2 && out && dragging} color={colors[i]} />
              </div>
            ))}
          <div
            style={{ '--x': `${offset.x}px`, '--y': `${offset.y}px` } as React.CSSProperties}
            className="paper-wrapper"
            onMouseDown={(e) => dragStart(e.clientX, e.clientY)}
            onTouchStart={(e) => dragStart(e.touches[0].clientX, e.touches[0].clientY)}
          >
            <Paper size={size} color={colors[3]} roll={!dragging} />
          </div>
        </div>
      </div>
    </div>
  );
};

type DragState = {
  noteId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
  boardWidth: number;
  boardHeight: number;
};

export default function NotesSection({
  stickyNotes,
  activeStickyNoteId,
  onSelectRange,
  onAddStickyNote,
  onUpdateStickyNote,
  onUpdateStickyNoteTitle,
  onMoveStickyNote,
  onDeleteStickyNote,
}: NotesSectionProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const sortedNotes = [...stickyNotes].sort((a, b) => (a.kind === 'range' && b.kind !== 'range' ? -1 : 1));

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || event.pointerId !== dragState.pointerId) return;

      event.preventDefault();
      const deltaX = event.clientX - dragState.startClientX;
      const deltaY = event.clientY - dragState.startClientY;

      const nextX = Math.max(8, Math.min(dragState.boardWidth - PAPER_SIZE - 8, dragState.originX + deltaX));
      const nextY = Math.max(8, Math.min(dragState.boardHeight - PAPER_SIZE - 8, dragState.originY + deltaY));

      onMoveStickyNote(dragState.noteId, nextX, nextY);
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [onMoveStickyNote]);

  const startDrag = (note: StickyNote, event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const boardRect = canvasRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    dragStateRef.current = {
      noteId: note.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: note.x,
      originY: note.y,
      boardWidth: boardRect.width,
      boardHeight: boardRect.height,
    };
  };

  return (
    <div id="notes-section" className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Notes</h2>
        <button
          type="button"
          onClick={() => onAddStickyNote()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border"
          style={{
            borderColor: 'var(--panel-border)',
            backgroundColor: 'var(--panel-bg)',
            color: 'var(--theme-primary)',
          }}
          aria-label="Add sticky note"
        >
          <span className="text-lg leading-none">+</span>
        </button>
      </div>

      <div
        ref={canvasRef}
        className="relative min-h-96 rounded-lg border overflow-auto"
        style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
      >
        {sortedNotes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <p className="text-sm">Drag papers from the dock below or use + to add notes</p>
          </div>
        )}

        {sortedNotes.map(note => {
          const isActive = activeStickyNoteId === note.id;

          return (
            <div
              key={note.id}
              className="absolute"
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                width: `${PAPER_SIZE}px`,
                height: `${PAPER_SIZE}px`,
                zIndex: isActive ? 50 : 10,
                transform: `rotate(${note.rotation}deg)`,
              }}
            >
              <Paper size={PAPER_SIZE} color={note.color} roll={false} />

              <div className="absolute inset-0 p-3 flex flex-col">
                <div
                  className="cursor-grab active:cursor-grabbing text-[11px] font-bold uppercase tracking-[0.16em] text-[#4a4a4a]"
                  onPointerDown={(event) => startDrag(note, event)}
                >
                  {note.kind === 'range' ? 'Range Note' : 'Sticky Note'}
                </div>

                <input
                  value={note.title}
                  onChange={(event) => onUpdateStickyNoteTitle(note.id, event.target.value)}
                  onFocus={() => onSelectRange(note.kind === 'range' ? note.id : null)}
                  placeholder="Heading"
                  className="mt-1 bg-transparent text-sm font-semibold text-[#222] outline-none border-none"
                />

                <textarea
                  value={note.content}
                  onChange={(event) => onUpdateStickyNote(note.id, event.target.value)}
                  onFocus={() => onSelectRange(note.kind === 'range' ? note.id : null)}
                  placeholder="Write your note..."
                  className="mt-2 flex-1 resize-none bg-transparent text-xs leading-5 text-[#222] outline-none border-none"
                  spellCheck="false"
                />

                <button
                  type="button"
                  onClick={() => onDeleteStickyNote(note.id)}
                  className="self-end text-[11px] font-semibold text-[#333]"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <PapersInline
        size={PAPER_SIZE}
        canvasRef={canvasRef}
        onCreate={(position) => {
          onAddStickyNote(position);
        }}
      />
    </div>
  );
}

function getShadowD(distance = 80, size = 500) {
  const c1 = (distance * 2 + size / 6) * (distance / getDistance(size, true));
  return `M 0,0 L 0,${c1} L ${c1},0 Z`;
}

function getDistance(size: number, roll = false) {
  return roll ? size / 6 : 0;
}

function getMaskD(distance = 80, size = 500) {
  const c1 = distance * 2 + size / 10;
  return `M 0,${c1} Q 0,${distance * 2} ${distance},${distance} Q ${distance * 2},0 ${c1},0 L ${size},0 L ${size},${size} L 0,${size} Z`;
}

function getRollD(distance = 80, size = 500) {
  const c1 = distance / 1;
  const pointer = [distance * 1.5, distance * 1.3];
  return `M ${pointer[0]},${pointer[1]} Q ${pointer[0]},${pointer[1]} ${distance - c1 / 2 - 2},${distance + c1 / 2 - 2} Q ${distance - c1 / 2 - 2},${distance + c1 / 2 - 2} ${distance - c1 - 2},${distance + c1 - 2} L ${distance + c1},${distance - c1} Q ${distance + c1 / 2 - 2},${distance - c1 / 2 - 2} ${pointer[0]},${pointer[1]} Q ${pointer[0]},${pointer[1]} ${pointer[0]},${pointer[1]} Z`;
}

function getRandomPaperColor() {
  const colors = ['#9A73EF', '#F6A89B', '#64D183', '#66A9ED', '#F3CD6F', '#D4C8C5', '#F8C89D'];
  return colors[Math.floor(Math.random() * colors.length)];
}
