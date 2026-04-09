'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { DateRange, RANGE_COLORS, HOLIDAY_REASONS } from '@/lib/calendarTypes';

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOLIDAY_PIN_BY_DAY: Record<number, string> = {
  1: '/pin-1.svg',
  15: '/pin-2.svg',
  26: '/pin-3.svg',
};

type CalendarGridProps = {
  displayDate: Date;
  onNavigateMonth: (dir: 1 | -1) => void;
  cellsAnimKey: number;
  ranges: DateRange[];
  draftStartDay: number | null;
  hoverPreviewDay: number | null;
  activeRangeId: string | null;
  hoveredRangeId: string | null;
  onDayClick: (day: number, rangeIdAtDay: string | null) => void;
  onDayHover: (day: number | null) => void;
  onRangeHover: (rangeId: string | null) => void;
  onRangeColorChange: (rangeId: string, color: string) => void;
  onEditRangeNotes: (rangeId: string) => void;
};

export default function CalendarGrid({
  displayDate,
  onNavigateMonth,
  cellsAnimKey,
  ranges,
  draftStartDay,
  hoverPreviewDay,
  activeRangeId,
  hoveredRangeId,
  onDayClick,
  onDayHover,
  onRangeHover,
  onRangeColorChange,
  onEditRangeNotes,
}: CalendarGridProps) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredHolidayDay, setHoveredHolidayDay] = useState<number | null>(null);
  const [holidayTooltipPos, setHolidayTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const tooltipHideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const monthLabel = displayDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayMonIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const prevMonthDaysCount = new Date(year, month, 0).getDate();

  const CURRENT_MONTH_DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const EMPTY_START_DAYS = Array.from({ length: firstDayMonIndex }, (_, i) => prevMonthDaysCount - firstDayMonIndex + i + 1);
  const trailingDays = (7 - ((EMPTY_START_DAYS.length + CURRENT_MONTH_DAYS.length) % 7)) % 7;
  const EMPTY_END_DAYS = Array.from({ length: trailingDays }, (_, i) => i + 1);

  useEffect(() => {
    // Initial mount animation
    gsap.fromTo('.day-cell', 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power2.out', delay: 0.5 }
    );
  }, []);

  const hoveredRange = ranges.find(range => range.id === hoveredRangeId) ?? null;

  const handleDayMouseEnter = (e: React.MouseEvent, day: number, rangeAtDay: DateRange | null) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const nextTooltipPos = { x: rect.left + rect.width / 2, y: rect.top - 8 };
    if (tooltipHideTimeoutRef.current) {
      clearTimeout(tooltipHideTimeoutRef.current);
      tooltipHideTimeoutRef.current = null;
    }
    setTooltipPos(nextTooltipPos);
    onDayHover(day);
    onRangeHover(rangeAtDay?.id ?? null);
  };

  const handleDayMouseLeave = () => {
    tooltipHideTimeoutRef.current = setTimeout(() => {
      setTooltipPos(null);
      onRangeHover(null);
      tooltipHideTimeoutRef.current = null;
    }, 120);
    onDayHover(null);
  };

  const getRangeAtDay = (day: number) => {
    for (let i = ranges.length - 1; i >= 0; i -= 1) {
      const range = ranges[i];
      if (day >= range.start && day <= range.end) {
        return range;
      }
    }

    return null;
  };

  const getPreviewState = (day: number) => {
    if (draftStartDay === null || hoverPreviewDay === null) return false;

    const previewStart = Math.min(draftStartDay, hoverPreviewDay);
    const previewEnd = Math.max(draftStartDay, hoverPreviewDay);
    return day >= previewStart && day <= previewEnd;
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          className="nav-btn w-9 h-9 flex items-center justify-center"
          style={{ color: 'var(--theme-primary)' }}
          onClick={() => onNavigateMonth(-1)}
          aria-label="Previous month"
        >
          {'‹'}
        </button>
        <h3 className="text-lg md:text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {monthLabel} <span style={{ color: 'var(--text-secondary)' }}>{year}</span>
        </h3>
        <button
          type="button"
          className="nav-btn w-9 h-9 flex items-center justify-center"
          style={{ color: 'var(--theme-primary)' }}
          onClick={() => onNavigateMonth(1)}
          aria-label="Next month"
        >
          {'›'}
        </button>
      </div>

      {isMounted && hoveredRange && tooltipPos
        ? createPortal(
            <div
              className="range-tooltip fixed w-fit flex items-center justify-between gap-3 z-50 pointer-events-auto"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              onMouseEnter={() => {
                if (tooltipHideTimeoutRef.current) {
                  clearTimeout(tooltipHideTimeoutRef.current);
                  tooltipHideTimeoutRef.current = null;
                }
              }}
              onMouseLeave={() => {
                setTooltipPos(null);
                onRangeHover(null);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Color:</span>
                {RANGE_COLORS.map(color => (
                  <button
                    key={`${hoveredRange.id}-${color}`}
                    type="button"
                    aria-label={`Use ${color}`}
                    className={`h-5 w-5 rounded-full border transition-all ${hoveredRange.color === color ? 'ring-2 ring-offset-1' : 'border-[#d2e3fc]'}`}
                    style={{
                      backgroundColor: color,
                      boxShadow: hoveredRange.color === color ? '0 0 0 2px var(--theme-primary)' : undefined,
                    }}
                    onClick={() => onRangeColorChange(hoveredRange.id, color)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                style={{ backgroundColor: 'var(--theme-primary)', color: '#000000' }}
                onClick={() => onEditRangeNotes(hoveredRange.id)}
              >
                Edit notes
              </button>
            </div>,
            document.body,
          )
        : null}

      {isMounted && hoveredHolidayDay && HOLIDAY_REASONS[hoveredHolidayDay] && holidayTooltipPos
        ? createPortal(
            <div
              className="holiday-tooltip fixed text-xs rounded-md px-2 py-1 z-50 pointer-events-none whitespace-nowrap"
              style={{
                left: `${holidayTooltipPos.x}px`,
                top: `${holidayTooltipPos.y}px`,
                transform: 'translate(-50%, -100%)',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--panel-bg)',
              }}
            >
              {HOLIDAY_REASONS[hoveredHolidayDay]}
            </div>,
            document.body,
          )
        : null}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-4">
        {DAYS_OF_WEEK.map((d, i) => (
          <div
            key={d}
            className="text-xs font-semibold text-center tracking-wide"
            style={{ color: i >= 5 ? 'var(--theme-primary)' : 'var(--text-secondary)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2 relative">
        {/* Previous month empty days */}
        {EMPTY_START_DAYS.map(d => (
          <div key={`prev-${d}`} className="h-10 md:h-12 flex items-center justify-center text-[#bdc1c6] font-medium text-sm">
            {d}
          </div>
        ))}

        {/* Current month days */}
        {CURRENT_MONTH_DAYS.map((d, index) => {
          const rangeAtDay = getRangeAtDay(d);
          const isInRange = Boolean(rangeAtDay);
          const isStart = rangeAtDay ? d === rangeAtDay.start : false;
          const isEnd = rangeAtDay ? d === rangeAtDay.end : false;
          const isSingleDay = rangeAtDay ? rangeAtDay.start === rangeAtDay.end : false;
          const isBetween = rangeAtDay ? d > rangeAtDay.start && d < rangeAtDay.end : false;
          const isActiveRange = rangeAtDay ? rangeAtDay.id === activeRangeId : false;
          const isPreview = !rangeAtDay && getPreviewState(d);
          const colIndex = (EMPTY_START_DAYS.length + index) % 7;
          const pinSrc = HOLIDAY_PIN_BY_DAY[d];

          let inBetweenRounded = 'rounded-none';
          if (isBetween) {
            if (colIndex === 0) inBetweenRounded = 'rounded-l-full';
            if (colIndex === 6) inBetweenRounded = 'rounded-r-full';
          }

          let edgeRounded = 'rounded-full';
          if (!isSingleDay) {
            if (isStart) edgeRounded = 'rounded-l-full rounded-r-none';
            if (isEnd) edgeRounded = 'rounded-r-full rounded-l-none';
          }
          
          return (
            <div 
              key={`${cellsAnimKey}-${d}`} 
              className="relative h-10 md:h-12 flex items-center justify-center day-cell group cursor-pointer"
              onClick={() => onDayClick(d, rangeAtDay?.id ?? null)}
              onMouseEnter={(e) => handleDayMouseEnter(e, d, rangeAtDay)}
              onMouseLeave={() => handleDayMouseLeave()}
              style={{ animationDelay: `${index * 18}ms` }}
            >
              {/* Range Background */}
              {isInRange && rangeAtDay && (
                 <div
                   className={`absolute inset-0 transition-all duration-300 ${isBetween ? `${inBetweenRounded} opacity-25` : `${edgeRounded} opacity-90`}`}
                   style={{ backgroundColor: rangeAtDay.color }}
                 />
              )}

              {isPreview && (
                <div className="absolute inset-0 rounded-full border border-dashed" style={{ backgroundColor: 'var(--theme-light)', borderColor: 'var(--theme-primary)' }} />
              )}

              {pinSrc && (
                <img
                  src={pinSrc}
                  alt="Holiday pin"
                  className="absolute top-0.5 right-0.5 w-6 h-6 cursor-help"
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setHolidayTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                    setHoveredHolidayDay(d);
                  }}
                  onMouseLeave={() => {
                    setHoveredHolidayDay(null);
                    setHolidayTooltipPos(null);
                  }}
                />
              )}
              
              {/* Number */}
              <span className={`relative z-10 transition-colors duration-300 text-sm md:text-base font-semibold ${isInRange ? 'text-white' : ''}`} style={!isInRange ? { color: 'var(--text-primary)' } : undefined}>
                {d}
              </span>
            </div>
          );
        })}

        {/* Next month empty days */}
        {EMPTY_END_DAYS.map(d => (
          <div key={`next-${d}`} className="h-10 md:h-12 flex items-center justify-center text-[#bdc1c6] font-medium text-sm">
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
