'use client';

// Themed replacements for <input type="date"> / <input type="time">. The
// browser's native picker popups can't be styled (Chrome's time list is
// OS-blue), so these draw their own popovers in the site's palette. Each
// renders a named, required input carrying the same value format the native
// inputs submitted (YYYY-MM-DD / HH:MM), so server actions are unchanged.

import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDaysIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type FieldProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

type DateFieldProps = FieldProps & {
  // Earliest selectable day (YYYY-MM-DD); earlier days are shown disabled.
  min?: string;
};

// Closes the popover on outside click or Escape.
function usePopover() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);
  return { open, setOpen, rootRef };
}

// Carries the value into the form and triggers the browser's "please fill in
// this field" bubble, anchored under the visible trigger.
function HiddenValue({ name, value, required }: { name: string; value: string; required?: boolean }) {
  return (
    <input
      className="dtp-validator"
      name={name}
      value={value}
      required={required}
      onChange={() => {}}
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

// ─── Date ─────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function fromIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({ id, name, value, onChange, required, min, placeholder = 'Select a date' }: DateFieldProps) {
  const { open, setOpen, rootRef } = usePopover();
  const selected = fromIso(value);
  const [view, setView] = useState(() => selected ?? new Date());
  const [focusIso, setFocusIso] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  function openCalendar() {
    const start = selected ?? fromIso(min ?? '') ?? new Date();
    setView(start);
    setFocusIso(toIso(start));
    setOpen(true);
  }

  // Move keyboard focus to the active day whenever it changes.
  useEffect(() => {
    if (open && focusIso) {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${focusIso}"]`)?.focus();
    }
  }, [open, focusIso, view]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = toIso(new Date());
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  function shiftFocus(days: number) {
    const base = fromIso(focusIso ?? '') ?? new Date(year, month, 1);
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
    if (next.getMonth() !== month || next.getFullYear() !== year) setView(next);
    setFocusIso(toIso(next));
  }

  function onGridKey(e: React.KeyboardEvent) {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in moves) {
      e.preventDefault();
      shiftFocus(moves[e.key]);
    }
  }

  function pick(d: Date) {
    onChange(toIso(d));
    setOpen(false);
  }

  const label = selected
    ? selected.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : placeholder;

  return (
    <div
      className="dtp"
      ref={rootRef}
      onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}
    >
      <button
        type="button"
        id={id}
        className={`auth-input dtp-trigger${selected ? '' : ' dtp-trigger--empty'}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openCalendar())}
      >
        {label}
      </button>
      <CalendarDaysIcon className="auth-input-icon" />
      <HiddenValue name={name} value={value} required={required} />

      {open && (
        <div className="dtp-popover dtp-calendar" role="dialog" aria-labelledby={labelId}>
          <div className="dtp-cal-head">
            <button type="button" className="dtp-nav" aria-label="Previous month" onClick={() => setView(new Date(year, month - 1, 1))}>
              <ChevronLeftIcon />
            </button>
            <span id={labelId} className="dtp-cal-title">
              {view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button type="button" className="dtp-nav" aria-label="Next month" onClick={() => setView(new Date(year, month + 1, 1))}>
              <ChevronRightIcon />
            </button>
          </div>
          <div className="dtp-cal-grid" role="grid" ref={gridRef} onKeyDown={onGridKey}>
            {WEEKDAYS.map((d) => <span key={d} className="dtp-weekday" role="columnheader">{d}</span>)}
            {cells.map((d, i) => {
              if (!d) return <span key={`blank-${i}`} />;
              const iso = toIso(d);
              const isSelected = iso === value;
              const disabled = !!min && iso < min;
              return (
                <button
                  key={iso}
                  type="button"
                  data-iso={iso}
                  role="gridcell"
                  aria-selected={isSelected}
                  tabIndex={iso === focusIso ? 0 : -1}
                  className={`dtp-day${isSelected ? ' dtp-day--selected' : ''}${iso === todayIso ? ' dtp-day--today' : ''}`}
                  disabled={disabled}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <div className="dtp-cal-foot">
            <button type="button" className="dtp-link" onClick={() => pick(new Date())} disabled={!!min && todayIso < min}>Today</button>
            {value && <button type="button" className="dtp-link" onClick={() => { onChange(''); setOpen(false); }}>Clear</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Time ─────────────────────────────────────────────────────────

const TIME_STEP_MINUTES = 15;
const TIMES = Array.from({ length: (24 * 60) / TIME_STEP_MINUTES }, (_, i) => {
  const mins = i * TIME_STEP_MINUTES;
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
});
const DEFAULT_SCROLL_TIME = '17:00';

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${pad(m)} ${suffix}`;
}

export function TimePicker({ id, name, value, onChange, required, placeholder = 'Select a time' }: FieldProps) {
  const { open, setOpen, rootRef } = usePopover();
  const [active, setActive] = useState(value || DEFAULT_SCROLL_TIME);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  // Keep a previously saved off-step value (e.g. 16:10) selectable. Optional
  // fields get a leading '' entry so a chosen time can be removed again.
  const times = value && !TIMES.includes(value) ? [...TIMES, value].sort() : TIMES;
  const options = required ? times : ['', ...times];

  // Scrolls only the list (scrollIntoView would also scroll the page).
  function reveal(t: string, center = false) {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-time="${t}"]`);
    if (!list || !el) return;
    if (center) list.scrollTop = el.offsetTop - (list.clientHeight - el.offsetHeight) / 2;
    else if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
    }
  }

  useEffect(() => {
    if (open) reveal(active);
  }, [open, active]);

  function openList() {
    const start = value || DEFAULT_SCROLL_TIME;
    setActive(start);
    setOpen(true);
    // Center the starting time once the list has rendered.
    requestAnimationFrame(() => {
      reveal(start, true);
      listRef.current?.focus({ preventScroll: true });
    });
  }

  function pick(t: string) {
    onChange(t);
    setOpen(false);
  }

  function onListKey(e: React.KeyboardEvent) {
    const idx = options.indexOf(active);
    const jump: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 4, PageUp: -4 };
    if (e.key in jump) {
      e.preventDefault();
      setActive(options[Math.min(options.length - 1, Math.max(0, idx + jump[e.key]))]);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setActive(e.key === 'Home' ? options[0] : options[options.length - 1]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(active);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div
      className="dtp"
      ref={rootRef}
      onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}
    >
      <button
        type="button"
        id={id}
        className={`auth-input dtp-trigger${value ? '' : ' dtp-trigger--empty'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        {value ? formatTime(value) : placeholder}
      </button>
      <ClockIcon className="auth-input-icon" />
      <HiddenValue name={name} value={value} required={required} />

      {open && (
        <ul
          id={listId}
          ref={listRef}
          className="dtp-popover dtp-times"
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listId}-${active || 'none'}`}
          onKeyDown={onListKey}
        >
          {options.map((t) => (
            <li
              key={t}
              id={`${listId}-${t || 'none'}`}
              data-time={t}
              role="option"
              aria-selected={t === value}
              className={`dtp-time${t === value ? ' dtp-time--selected' : ''}${t === active ? ' dtp-time--active' : ''}${t ? '' : ' dtp-time--none'}`}
              onMouseEnter={() => setActive(t)}
              onClick={() => pick(t)}
            >
              {t ? formatTime(t) : placeholder}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
