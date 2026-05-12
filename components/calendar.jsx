"use client";

import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const period = i < 12 ? "AM" : "PM";
  return { label: `${hour}:00 ${period}`, value: i };
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});

  const { year, month } = viewDate;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setViewDate(v =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }
    );
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setViewDate(v =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }
    );
    setSelectedDate(null);
  };

  const handleDayClick = (day) => {
    const key = `${year}-${month}-${day}`;
    setSelectedDate(selectedDate === key ? null : key);
  };

  const toggleSlot = (hour) => {
    if (!selectedDate) return;
    setBookedSlots(prev => {
      const slots = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: slots.includes(hour)
          ? slots.filter(h => h !== hour)
          : [...slots, hour],
      };
    });
  };

  const selectedKey = selectedDate;
  const selectedSlots = (selectedKey && bookedSlots[selectedKey]) || [];

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const hasBooking = (day) => {
    const key = `${year}-${month}-${day}`;
    return bookedSlots[key] && bookedSlots[key].length > 0;
  };

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

        .cal-root {
          display: flex;
          gap: 0;
          max-width: 860px;
          width: 100%;
          margin: 0 auto;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          font-family: 'DM Mono', monospace;
        }

        .cal-left {
          flex: 0 0 360px;
          background: var(--color-surface);
          padding: 2rem;
          border-right: 1px solid var(--color-border);
        }

        .cal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .cal-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.4rem;
          color: var(--color-text);
          letter-spacing: 0.01em;
        }

        .cal-title span {
          color: var(--color-primary);
          font-style: italic;
        }

        .cal-nav {
          display: flex;
          gap: 0.5rem;
        }

        .cal-nav button {
          background: none;
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          font-family: 'DM Mono', monospace;
        }

        .cal-nav button:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .cal-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 0.5rem;
        }

        .cal-days-header span {
          text-align: center;
          font-size: 0.6rem;
          color: var(--color-text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.4rem 0;
        }

        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .cal-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          color: var(--color-text);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          gap: 3px;
        }

        .cal-cell:hover {
          background: var(--sr-mist);
          color: var(--color-primary);
        }

        .cal-cell.today {
          color: var(--color-primary);
          font-weight: 600;
        }

        .cal-cell.today::before {
          content: '';
          position: absolute;
          inset: 3px;
          border: 1px solid var(--color-primary);
          border-radius: var(--radius-sm);
          opacity: 0.35;
        }

        .cal-cell.selected {
          background: var(--color-primary);
          color: var(--color-primary-contrast);
        }

        .cal-cell.selected:hover {
          background: var(--color-primary-hover);
          color: var(--color-primary-contrast);
        }

        .cal-cell .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--color-accent);
        }

        .cal-cell.selected .dot {
          background: var(--color-primary-contrast);
        }

        .cal-cell.empty {
          cursor: default;
        }

        .cal-right {
          flex: 1;
          background: var(--color-surface-alt);
          display: flex;
          flex-direction: column;
        }

        .slots-header {
          padding: 1.5rem 1.75rem 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .slots-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1rem;
          color: var(--color-text);
        }

        .slots-subtitle {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 0.25rem;
        }

        .slots-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem 1.25rem;
          scrollbar-width: thin;
          scrollbar-color: var(--color-border) transparent;
        }

        .slots-list::-webkit-scrollbar { width: 4px; }
        .slots-list::-webkit-scrollbar-track { background: transparent; }
        .slots-list::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 2px;
        }

        .slot-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.6rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.12s;
          margin-bottom: 2px;
          border: 1px solid transparent;
        }

        .slot-row:hover {
          background: var(--color-surface);
          border-color: var(--color-border);
        }

        .slot-row.booked {
          background: var(--sr-mist);
          border-color: var(--color-primary);
        }

        .slot-row.booked:hover {
          background: var(--color-surface);
          border-color: var(--color-primary-hover);
        }

        .slot-time {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          width: 68px;
          flex-shrink: 0;
          letter-spacing: 0.05em;
        }

        .slot-row.booked .slot-time {
          color: var(--color-primary);
          font-weight: 600;
        }

        .slot-line {
          flex: 1;
          height: 1px;
          background: var(--color-border);
          transition: background 0.12s;
        }

        .slot-row:hover .slot-line {
          background: var(--color-primary);
          opacity: 0.4;
        }

        .slot-row.booked .slot-line {
          background: var(--color-primary);
          opacity: 0.4;
        }

        .slot-check {
          width: 16px;
          height: 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.12s;
          font-size: 0.6rem;
          color: transparent;
        }

        .slot-row.booked .slot-check {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: var(--color-primary-contrast);
        }

        .slots-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 0.75rem;
          color: var(--color-text-muted);
          padding: 3rem;
          text-align: center;
        }

        .slots-empty-icon {
          font-size: 2.5rem;
          opacity: 0.4;
          color: var(--color-primary);
        }

        .slots-empty-text {
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem;
          color: var(--color-text);
        }

        .slots-empty-sub {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .slots-footer {
          padding: 0.75rem 1.75rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .slots-count {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .slots-count span {
          color: var(--color-primary);
          font-weight: 600;
        }

        .clear-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          background: none;
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: all 0.15s;
        }

        .clear-btn:hover {
          border-color: var(--color-danger);
          color: var(--color-danger);
        }
      `}</style>

      <div className="cal-root">
        {/* LEFT: Month Calendar */}
        <div className="cal-left">
          <div className="cal-header">
            <div className="cal-title">
              <span>{MONTHS[month]}</span> {year}
            </div>
            <div className="cal-nav">
              <button onClick={prevMonth}>‹</button>
              <button onClick={nextMonth}>›</button>
            </div>
          </div>

          <div className="cal-days-header">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="cal-grid">
            {cells.map((day, i) =>
              day === null ? (
                <div key={`empty-${i}`} className="cal-cell empty" />
              ) : (
                <div
                  key={day}
                  className={[
                    "cal-cell",
                    isToday(day) ? "today" : "",
                    selectedDate === `${year}-${month}-${day}` ? "selected" : "",
                  ].join(" ")}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                  {hasBooking(day) && <div className="dot" />}
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT: Time Slots */}
        <div className="cal-right">
          {selectedDate ? (
            <>
              <div className="slots-header">
                <div className="slots-title">
                  {(() => {
                    const [y, m, d] = selectedDate.split("-");
                    return `${MONTHS[parseInt(m)]} ${d}, ${y}`;
                  })()}
                </div>
                <div className="slots-subtitle">Select time slots</div>
              </div>

              <div className="slots-list">
                {HOURS.map(({ label, value }) => {
                  const booked = selectedSlots.includes(value);
                  return (
                    <div
                      key={value}
                      className={`slot-row ${booked ? "booked" : ""}`}
                      onClick={() => toggleSlot(value)}
                    >
                      <span className="slot-time">{label}</span>
                      <div className="slot-line" />
                      <div className="slot-check">{booked ? "✓" : ""}</div>
                    </div>
                  );
                })}
              </div>

              <div className="slots-footer">
                <div className="slots-count">
                  <span>{selectedSlots.length}</span> slot{selectedSlots.length !== 1 ? "s" : ""} selected
                </div>
                {selectedSlots.length > 0 && (
                  <button
                    className="clear-btn"
                    onClick={() =>
                      setBookedSlots(prev => ({ ...prev, [selectedDate]: [] }))
                    }
                  >
                    Clear
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="slots-empty">
              <div className="slots-empty-icon">◫</div>
              <div className="slots-empty-text">No day selected</div>
              <div className="slots-empty-sub">Click a date to view time slots</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
