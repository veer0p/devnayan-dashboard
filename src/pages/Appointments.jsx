import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  MapPin,
  Stethoscope,
  List,
  WhatsappLogo,
} from '@phosphor-icons/react';
import { useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, endOfWeek, addDays, addMonths, getDay, isToday, isTomorrow, isYesterday } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AppLayout from '../components/layout/AppLayout';
import { mockAppointments } from '../data/appointments';
import { mockDoctors } from '../data/doctors';
import BookingModal from '../components/appointments/BookingModal';
import AppointmentPanel from '../components/appointments/AppointmentPanel';
import ConflictDialog from '../components/appointments/ConflictDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Select from '../components/ui/Select';
import { useLocalStorage } from '../lib/useLocalStorage';
import { useAppointmentReminders } from '../lib/useAppointmentReminders';
import { mockPatientsList } from '../data/patients';
import { sendWhatsAppMessage } from '../lib/openwa';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// One source of truth per doctor: base hue with derived pastel + accent shades.
// On dark canvas: low-alpha fill for chip body, stronger left bar for identity,
// brighter accent for time/initials so type stays readable.
const DOCTOR_PALETTE = {
  'bg-primary':     { base: '#C8902B', soft: 'rgba(200, 144, 43, 0.14)', border: 'rgba(200, 144, 43, 0.32)', accent: '#E8B26B' },
  'bg-blue-500':    { base: '#3B82F6', soft: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.32)', accent: '#7FAFFA' },
  'bg-emerald-500': { base: '#10B981', soft: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.32)', accent: '#5FD9B0' },
  'bg-purple-500':  { base: '#A855F7', soft: 'rgba(168, 85, 247, 0.14)', border: 'rgba(168, 85, 247, 0.32)', accent: '#C896FA' },
  'bg-rose-500':    { base: '#F43F5E', soft: 'rgba(244, 63, 94, 0.14)', border: 'rgba(244, 63, 94, 0.32)', accent: '#FA8095' },
  'bg-amber-500':   { base: '#F59E0B', soft: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.32)', accent: '#FBC061' },
};
const DEFAULT_PALETTE = DOCTOR_PALETTE['bg-primary'];

const paletteFromDoctor = (doctor) => DOCTOR_PALETTE[doctor?.color] || DEFAULT_PALETTE;

const statusTone = {
  Confirmed: { dot: '#34D399', text: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  Completed: { dot: '#60A5FA', text: 'text-blue-300',    bg: 'bg-blue-500/10' },
  Pending:   { dot: '#FBBF24', text: 'text-amber-300',   bg: 'bg-amber-500/10' },
  Cancelled: { dot: '#9CA3AF', text: 'text-zinc-400',    bg: 'bg-zinc-500/10' },
};

// --- Hover tooltip (rich, portaled, no browser title) ----------------------
const HoverPopover = ({ event, doctor, palette, anchorRect }) => {
  if (!anchorRect) return null;

  const startStr = format(event.start, 'h:mm a');
  const endStr = format(event.end, 'h:mm a');
  const dateStr = format(event.start, 'EEE, d MMM');
  const durationMins = Math.max(0, (event.end - event.start) / 60000);

  // Position: prefer right of event, fall back to left, vertically aligned to event top
  const POP_W = 280;
  const POP_H_EST = 200;
  const gap = 8;
  let left = anchorRect.right + gap;
  let top = anchorRect.top;
  if (left + POP_W > window.innerWidth - 8) {
    left = anchorRect.left - POP_W - gap;
  }
  if (left < 8) left = 8;
  if (top + POP_H_EST > window.innerHeight - 8) {
    top = Math.max(8, window.innerHeight - POP_H_EST - 8);
  }

  const statusToneMap = {
    Confirmed: 'text-emerald-500',
    Completed: 'text-sky-500',
    Pending:   'text-amber-500',
    Cancelled: 'text-rose-500',
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.12 }}
      style={{ left, top, width: POP_W }}
      className="fixed z-[200] bg-bg-card border border-border-color rounded-xl shadow-2xl pointer-events-none overflow-hidden"
    >
      {/* Header band in doctor color */}
      <div
        className="px-4 py-2 border-b border-border-color flex items-center justify-between"
        style={{ background: palette.soft, borderLeft: `3px solid ${palette.base}` }}
      >
        <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: palette.base }}>
          {event.treatmentName}
        </div>
        <div className={`text-[10px] font-semibold ${statusToneMap[event.status] || 'text-text-muted'}`}>
          {event.status}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Patient */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted/80 font-medium mb-1">Patient</div>
          <div className="text-[14px] font-semibold text-text-main truncate">{event.patientName}</div>
        </div>

        {/* Time + Date */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-color">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted/80 font-medium mb-1">When</div>
            <div className="text-[13px] font-medium text-text-main tabular-nums">{startStr}</div>
            <div className="text-[11px] text-text-muted tabular-nums">to {endStr}</div>
            <div className="text-[10px] text-text-muted mt-0.5">{dateStr} · {durationMins} min</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted/80 font-medium mb-1">Where</div>
            <div className="text-[13px] font-medium text-text-main">{event.chair}</div>
            {doctor && (
              <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: palette.base }}
                />
                {doctor.name}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {event.notes && (
          <div className="pt-3 border-t border-border-color">
            <div className="text-[10px] uppercase tracking-wider text-text-muted/80 font-medium mb-1">Notes</div>
            <div className="text-[11px] text-text-muted leading-relaxed line-clamp-3">{event.notes}</div>
          </div>
        )}

        <div className="pt-2 text-[10px] text-text-muted/70">Click to open</div>
      </div>
    </motion.div>,
    document.body
  );
};

// --- Event block (flat, clean, no chip, time on hover only) ----------------
const EventChip = ({ event, doctors, view }) => {
  const doctor = doctors.find(d => d.id === event.doctorId);
  const palette = paletteFromDoctor(doctor);
  const durationMins = Math.max(0, (event.end - event.start) / 60000);
  const overlap = event.__overlapCount || 1;
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [rect, setRect] = useState(null);
  const timerRef = useRef(null);

  const handleEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
        setHovered(true);
      }
    }, 250);
  };
  const handleLeave = () => {
    clearTimeout(timerRef.current);
    setHovered(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Month view = single-line label, no time
  if (view === 'month') {
    return (
      <>
        <div
          ref={ref}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className="flex items-center h-full text-[11px] truncate px-2"
          style={{
            background: palette.soft,
            borderLeft: `3px solid ${palette.base}`,
            color: '#F9FAFB',
          }}
        >
          <span className="font-medium truncate">{event.patientName}</span>
        </div>
        <AnimatePresence>
          {hovered && <HoverPopover event={event} doctor={doctor} palette={palette} anchorRect={rect} />}
        </AnimatePresence>
      </>
    );
  }

  const isShort = durationMins <= 30;

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="relative h-full w-full overflow-hidden"
        style={{
          background: palette.soft,
          borderLeft: `3px solid ${palette.base}`,
        }}
      >
        <div className={`h-full w-full px-2.5 py-1.5 flex flex-col justify-center ${isShort ? 'gap-0' : 'gap-0.5'}`}>
          <span className="text-[12px] font-semibold text-text-main truncate leading-tight">
            {event.patientName}
          </span>
          {!isShort && (
            <span className="text-[11px] text-text-muted truncate leading-tight">
              {event.treatmentName}
            </span>
          )}
        </div>

        {overlap > 1 && (
          <span className="absolute top-1 right-1 px-1 h-4 rounded text-[9px] font-semibold flex items-center justify-center bg-bg-card border border-border-color text-text-muted">
            +{overlap - 1}
          </span>
        )}
      </div>
      <AnimatePresence>
        {hovered && <HoverPopover event={event} doctor={doctor} palette={palette} anchorRect={rect} />}
      </AnimatePresence>
    </>
  );
};

// --- Compute toolbar label from view + date --------------------------------
const computeLabel = (view, date) => {
  if (view === 'day')   return format(date, 'EEEE, d MMM yyyy');
  if (view === 'month') return format(date, 'MMMM yyyy');
  if (view === 'week') {
    const start = startOfWeek(date, { locale: enUS });
    const end = endOfWeek(date, { locale: enUS });
    if (start.getFullYear() !== end.getFullYear()) {
      return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
    }
    if (start.getMonth() !== end.getMonth()) {
      return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
    }
    return `${format(start, 'd')} – ${format(end, 'd MMM yyyy')}`;
  }
  return ''; // agenda handled separately
};

// --- Toolbar (parent-driven; lives outside the Calendar) -------------------
const PageToolbar = ({ view, label, onNavigate, onViewChange, hideNav }) => {
  const views = [
    { id: 'day',    label: 'Day' },
    { id: 'week',   label: 'Week' },
    { id: 'month',  label: 'Month' },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 pb-4 border-b border-border-color">
      <div className="flex items-center gap-2">
        {!hideNav && (
          <>
            <button
              onClick={() => onNavigate('TODAY')}
              className="h-9 px-3.5 text-[13px] font-medium rounded-lg border border-border-color bg-bg-body/40 hover:bg-bg-body hover:border-border-strong text-text-main transition-colors"
            >
              Today
            </button>
            <div className="flex items-center bg-bg-body/40 border border-border-color rounded-lg">
              <button
                onClick={() => onNavigate('PREV')}
                aria-label="Previous"
                className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <div className="w-px h-5 bg-border-color" />
              <button
                onClick={() => onNavigate('NEXT')}
                aria-label="Next"
                className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </>
        )}
        <h2 className="text-[17px] font-semibold text-text-main tracking-tight ml-1">
          {label}
        </h2>
      </div>

      <div className="flex items-center gap-0.5 bg-bg-body/40 p-1 rounded-lg border border-border-color self-start lg:self-auto">
        {views.map(v => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`relative px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
                active ? 'text-text-main' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="view-pill"
                  className="absolute inset-0 bg-bg-card border border-border-strong rounded-md shadow-sm pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 pointer-events-none">{v.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Desktop List view (proper table — matches Patients/Billing styling) ---
const AppointmentsTable = ({ appointments, doctors, onSelect, onRemind }) => {
  const sorted = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.start) - new Date(b.start)),
    [appointments]
  );

  if (sorted.length === 0) {
    return (
      <div className="py-20 text-center text-text-muted">
        <CalendarBlank size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-medium">No appointments</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-text-muted border-y border-border-color bg-bg-body/40">
            <th className="py-3 font-semibold pl-5">Date</th>
            <th className="py-3 font-semibold">Time</th>
            <th className="py-3 font-semibold">Patient</th>
            <th className="py-3 font-semibold">Treatment</th>
            <th className="py-3 font-semibold">Doctor</th>
            <th className="py-3 font-semibold">Chair</th>
            <th className="py-3 font-semibold">Status</th>
            <th className="py-3 font-semibold pr-5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(app => {
            const doctor = doctors.find(d => d.id === app.doctorId);
            const palette = paletteFromDoctor(doctor);
            const tone = statusTone[app.status] || statusTone.Pending;
            const start = new Date(app.start);
            const end = new Date(app.end);
            const isCurrent = isToday(start);
            return (
              <tr
                key={app.id}
                onClick={() => onSelect(app)}
                className="border-b border-border-color last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <td className="py-3 pl-5 whitespace-nowrap">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-[13px] font-medium tabular-nums ${isCurrent ? 'text-primary' : 'text-text-main'}`}>
                      {format(start, 'd MMM')}
                    </span>
                    <span className="text-[10px] text-text-muted">{format(start, 'EEE')}</span>
                  </div>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span className="font-mono text-[12px] text-text-muted tabular-nums">
                    {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                  </span>
                </td>
                <td className="py-3 font-medium text-text-main pr-4">{app.patientName}</td>
                <td className="py-3 text-text-muted pr-4">{app.treatmentName}</td>
                <td className="py-3 pr-4">
                  {doctor && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border whitespace-nowrap"
                      style={{
                        background: palette.soft,
                        borderColor: palette.border,
                        color: palette.base,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: palette.base }} />
                      {doctor.initials}
                    </span>
                  )}
                </td>
                <td className="py-3 text-text-muted text-[12px] whitespace-nowrap pr-4">{app.chair}</td>
                <td className="py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${tone.bg} ${tone.text}`}>
                    <span className="w-1 h-1 rounded-full" style={{ background: tone.dot }} />
                    {app.status}
                  </span>
                </td>
                <td className="py-2.5 pr-5 whitespace-nowrap">
                  {app.status === 'Pending' ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemind(app, e); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/25 active:scale-95 text-[11px] font-semibold transition-all"
                    >
                      <WhatsappLogo size={13} weight="fill" />
                      Send Reminder
                    </button>
                  ) : (
                    <span className="text-text-muted/30 text-[11px]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Mobile list view -------------------------------------------------------
const getDayLabel = (date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE');
};

const MobileListView = ({ appointments, onSelect, doctors, onRemind }) => {
  const grouped = appointments.reduce((acc, app) => {
    const dateKey = format(new Date(app.start), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(app);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6 pb-6">
      {sortedDates.map(dateKey => {
        const date = new Date(dateKey + 'T00:00:00');
        const dayApps = grouped[dateKey].sort((a, b) => new Date(a.start) - new Date(b.start));
        const isCurrent = isToday(date);

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-colors ${
                  isCurrent
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-bg-card border border-border-color text-text-main'
                }`}
              >
                <span className="text-[17px] font-bold leading-none">{format(date, 'd')}</span>
                <span className="text-[9px] font-semibold uppercase leading-none mt-1 opacity-80">
                  {format(date, 'MMM')}
                </span>
              </div>
              <div>
                <div className="font-semibold text-text-main text-[15px]">{getDayLabel(date)}</div>
                <div className="text-xs text-text-muted">
                  {dayApps.length} appointment{dayApps.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="space-y-2 ml-2 pl-5 border-l border-border-color/60">
              {dayApps.map(app => {
                const doctor = doctors.find(d => d.id === app.doctorId);
                const palette = paletteFromDoctor(doctor);
                const tone = statusTone[app.status] || statusTone.Pending;
                return (
                  <motion.div
                    key={app.id}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onSelect(app)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelect(app)}
                    className="relative w-full text-left bg-bg-card border border-border-color rounded-2xl p-4 hover:border-border-strong transition-colors overflow-hidden cursor-pointer"
                    style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.02), 0 2px 8px -2px rgba(0,0,0,0.3)' }}
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1"
                      style={{ background: palette.base }}
                    />

                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl font-semibold flex items-center justify-center text-[13px] shrink-0"
                          style={{
                            background: palette.soft,
                            color: palette.base,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          {app.patientName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-text-main text-[14px] truncate">{app.patientName}</div>
                          <div className="text-[12px] text-text-muted truncate">{app.treatmentName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${tone.bg} ${tone.text}`}>
                          <span className="w-1 h-1 rounded-full" style={{ background: tone.dot }} />
                          {app.status}
                        </span>
                        {app.status === 'Pending' && (
                          <button
                            onClick={(e) => onRemind(app, e)}
                            title="Send WhatsApp Reminder"
                            className="w-7 h-7 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all flex items-center justify-center shrink-0 active:scale-95"
                          >
                            <WhatsappLogo size={14} weight="fill" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-text-muted flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        <span className="font-mono">
                          {format(new Date(app.start), 'h:mm a')} – {format(new Date(app.end), 'h:mm a')}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {app.chair}
                      </span>
                      {doctor && (
                        <span className="flex items-center gap-1" style={{ color: palette.base }}>
                          <Stethoscope size={11} />
                          {doctor.initials}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {sortedDates.length === 0 && (
        <div className="py-16 text-center text-text-muted">
          <CalendarBlank size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No appointments</p>
        </div>
      )}
    </div>
  );
};

const eventsOverlap = (a, b) => {
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();
  return aStart < bEnd && bStart < aEnd;
};

export default function Appointments() {
  const [appointments, setAppointments] = useLocalStorage('appointments', mockAppointments);
  const [doctors] = useLocalStorage('doctors', mockDoctors);
  const [patients] = useLocalStorage('patients', mockPatientsList);

  useAppointmentReminders(appointments);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [defaultPatientId, setDefaultPatientId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deletingAppointment, setDeletingAppointment] = useState(null);
  const [conflictEvents, setConflictEvents] = useState(null);
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [currentView, setCurrentView] = useState('week');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useLocalStorage('appointments_view_mode', 'calendar');

  // Automatically fall back from multi-column week view to clean daily column list on mobile viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && currentView === 'week') {
        setCurrentView('day');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentView]);

  // Honor inbound "Book this patient" intent from elsewhere (e.g. Patient drawer)
  const location = useLocation();
  useEffect(() => {
    if (location.state?.bookForPatientId) {
      setDefaultPatientId(location.state.bookForPatientId);
      setEditingAppointment(null);
      setIsModalOpen(true);
      // Clear so it doesn't fire on every re-render
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const doctorOptions = useMemo(
    () => [
      { value: 'All', label: 'All Doctors' },
      ...doctors.map(d => ({ value: d.id, label: d.name })),
    ],
    [doctors]
  );

  const filteredAppointments = useMemo(() => {
    if (doctorFilter === 'All') return appointments;
    return appointments.filter(a => a.doctorId === doctorFilter);
  }, [appointments, doctorFilter]);

  const events = useMemo(() => filteredAppointments.map(app => {
    const overlapCount = filteredAppointments.filter(other =>
      other.id !== app.id && eventsOverlap(other, app)
    ).length + 1;
    return {
      ...app,
      title: app.patientName,
      start: new Date(app.start),
      end: new Date(app.end),
      __overlapCount: overlapCount,
    };
  }), [filteredAppointments]);

  const handleSelectSlot = () => {
    if (isModalOpen || selectedEvent || deletingAppointment || conflictEvents) return;
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    if (doctorFilter === 'All') {
      const overlapping = filteredAppointments.filter(a =>
        a.id !== event.id && eventsOverlap(a, event)
      );
      if (overlapping.length > 0) {
        const group = [event, ...overlapping].map(a => ({
          ...a,
          start: a.start instanceof Date ? a.start : new Date(a.start),
          end: a.end instanceof Date ? a.end : new Date(a.end),
        }));
        setConflictEvents(group);
        return;
      }
    }
    setSelectedEvent(event);
  };

  const handleQuickReminder = async (app, e) => {
    if (e) e.stopPropagation();
    const patient = patients.find(p => p.id === app.patientId);
    if (!patient?.phone) {
      toast.error('No phone number registered for this patient');
      return;
    }

    const doctor = doctors.find(d => d.id === app.doctorId);
    const startDate = new Date(app.start);
    const endDate = new Date(app.end);

    const message = [
      `Dear ${app.patientName},`,
      ``,
      `This is a reminder for your upcoming appointment at Devnayan Dental Clinic.`,
      ``,
      `Treatment    : ${app.treatmentName}`,
      `Date         : ${format(startDate, 'EEEE, d MMMM yyyy')}`,
      `Time         : ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`,
      doctor ? `Doctor       : ${doctor.name}` : '',
      app.chairId ? `Chair        : Chair ${app.chairId}` : '',
      ``,
      `Location: Lal Bahadur Shastri Rd, Rushikesh Nagar, Bardoli, Gujarat`,
      ``,
      `Please arrive 5 minutes before your scheduled time. To reschedule or for any queries, contact us at +91 84870 05334.`,
      ``,
      `We look forward to seeing you.`,
      ``,
      `Regards,`,
      `Devnayan Dental Clinic`,
    ].filter(s => s !== undefined).join('\n');

    const toastId = toast.loading(`Sending reminder to ${app.patientName}...`);
    try {
      const res = await sendWhatsAppMessage(patient.phone, message);
      if (res.success) {
        if (res.manual) {
          toast.success('Opened manual WhatsApp link', { id: toastId });
        } else {
          toast.success('Reminder sent via WhatsApp API!', { id: toastId });
        }
      } else if (res.cancelled) {
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send WhatsApp reminder', { id: toastId });
    }
  };

  const handleSubmit = (appointment, isEdit) => {
    if (isEdit) {
      setAppointments(prev => prev.map(a => a.id === appointment.id ? appointment : a));
      setSelectedEvent({ ...appointment, title: appointment.patientName });
    } else {
      setAppointments(prev => [...prev, appointment]);
    }
  };

  const openEdit = () => {
    if (!selectedEvent) return;
    setEditingAppointment(selectedEvent);
    setIsModalOpen(true);
    setSelectedEvent(null);
  };

  const openAdd = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!deletingAppointment) return;
    setAppointments(prev => prev.filter(a => a.id !== deletingAppointment.id));
    toast.success('Appointment deleted');
    setSelectedEvent(null);
    setDeletingAppointment(null);
  };

  const todayStats = useMemo(() => {
    const todays = filteredAppointments.filter(a => isToday(new Date(a.start)));
    return {
      total: todays.length,
      confirmed: todays.filter(a => a.status === 'Confirmed').length,
      pending: todays.filter(a => a.status === 'Pending').length,
    };
  }, [filteredAppointments]);

  const handleNavigate = (action) => {
    if (action === 'TODAY') { setCurrentDate(new Date()); return; }
    const factor = action === 'NEXT' ? 1 : -1;
    setCurrentDate(prev => {
      if (currentView === 'day')   return addDays(prev, factor);
      if (currentView === 'week')  return addDays(prev, factor * 7);
      if (currentView === 'month') return addMonths(prev, factor);
      return prev;
    });
  };

  const toolbarLabel = currentView === 'agenda'
    ? `All appointments · ${filteredAppointments.length}`
    : computeLabel(currentView, currentDate);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-[26px] font-semibold tracking-tight text-text-main mb-1">Appointments</h1>
          <div className="flex items-center gap-3 flex-wrap text-[13px]">
            <span className="text-text-muted">
              {filteredAppointments.length} scheduled
              {doctorFilter !== 'All' && (
                <> · {doctors.find(d => d.id === doctorFilter)?.name}</>
              )}
            </span>
            {todayStats.total > 0 && (
              <>
                <span className="text-text-muted/40">·</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  {todayStats.total} today
                </span>
                {todayStats.pending > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-semibold">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    {todayStats.pending} pending
                  </span>
                )}
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center"
        >
          <Select
            value={doctorFilter}
            onChange={setDoctorFilter}
            options={doctorOptions}
            className="w-full sm:w-52"
            size="md"
          />
          
          {/* View mode segmented switcher */}
          <div className="flex items-center gap-0.5 bg-bg-body/40 p-1 rounded-lg border border-border-color shrink-0 self-stretch sm:self-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`relative flex-1 sm:flex-initial px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                viewMode === 'calendar' ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {viewMode === 'calendar' && (
                <motion.span
                  layoutId="viewMode-pill"
                  className="absolute inset-0 bg-bg-card border border-border-strong rounded-md shadow-sm pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <CalendarBlank size={14} className="relative z-10" />
              <span className="relative z-10">Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`relative flex-1 sm:flex-initial px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                viewMode === 'list' ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {viewMode === 'list' && (
                <motion.span
                  layoutId="viewMode-pill"
                  className="absolute inset-0 bg-bg-card border border-border-strong rounded-md shadow-sm pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <List size={14} className="relative z-10" />
              <span className="relative z-10">List</span>
            </button>
          </div>

          <button
            onClick={openAdd}
            className="h-9 px-3.5 rounded-lg bg-primary text-white flex items-center justify-center gap-1.5 text-[13px] font-semibold hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={14} weight="bold" /> Book patient
          </button>
        </motion.div>
      </div>

      {/* Doctor legend — pastel chip row */}
      {doctorFilter === 'All' && doctors.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-wrap items-center gap-1.5 mb-4"
        >
          {doctors.map(d => {
            const palette = paletteFromDoctor(d);
            return (
              <div
                key={d.id}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1 rounded-full text-[11px] border"
                style={{
                  background: palette.soft,
                  borderColor: palette.border,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: palette.base }}
                />
                <span style={{ color: palette.base }} className="font-semibold">
                  {d.initials}
                </span>
                <span className="text-text-muted">{d.name.replace(/^Dr\.\s*/, '')}</span>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Mobile list view */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden"
        >
          <MobileListView appointments={filteredAppointments} onSelect={handleSelectEvent} doctors={doctors} onRemind={handleQuickReminder} />
        </motion.div>
      )}

      {/* Main Appointments Display Card (Calendar View or List View) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${viewMode === 'calendar' ? 'flex' : 'hidden md:flex'} flex-1 bg-bg-card border border-border-color rounded-2xl p-5 flex-col`}
        style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.02), 0 8px 24px -12px rgba(0,0,0,0.5)' }}
      >
        <style>{`
          /* Base */
          .rbc-calendar {
            font-family: var(--font-sans);
            min-height: 720px;
            color: var(--color-text-main);
            background: transparent;
          }

          /* Day-of-week header */
          .rbc-header {
            padding: 12px 0 10px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.08em;
            color: var(--color-text-muted);
            border-bottom: 1px solid var(--color-border-color);
            background: transparent;
          }
          .rbc-header + .rbc-header { border-left: 1px solid var(--color-border-color); }
          .rbc-header.rbc-today,
          .rbc-header.rbc-today > a > span,
          .rbc-header.rbc-today > a { color: var(--color-primary); }

          /* View containers */
          .rbc-time-view, .rbc-month-view, .rbc-agenda-view {
            border: none;
            border-top: 1px solid var(--color-border-color);
            border-radius: 0;
            overflow: hidden;
            background: transparent;
          }
          .rbc-time-header { border-bottom: 1px solid var(--color-border-color); margin-right: 0 !important; }
          .rbc-time-header-content { border-left: 1px solid var(--color-border-color); }
          .rbc-time-content { border-top: none; background: transparent; }

          /* Time gutter */
          .rbc-time-gutter .rbc-timeslot-group {
            border-bottom: none;
            border-right: 1px solid var(--color-border-color);
          }
          .rbc-label {
            padding: 0 12px 0 4px;
            font-size: 11px;
            font-weight: 500;
            color: var(--color-text-muted);
            font-variant-numeric: tabular-nums;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          }

          /* Day columns / slots */
          .rbc-timeslot-group {
            border-bottom: 1px solid var(--color-border-color);
            min-height: 88px;
          }
          .rbc-day-slot .rbc-time-slot {
            border-top: 1px dashed var(--color-border-color);
            opacity: 0.5;
          }
          .rbc-day-slot .rbc-time-slot:first-child { border-top: none; }
          .rbc-day-slot .rbc-events-container { margin-right: 10px; }

          /* Today column */
          .rbc-today {
            background: linear-gradient(180deg, rgba(200,144,43,0.06) 0%, rgba(200,144,43,0.02) 100%) !important;
          }

          /* Event reset (we paint chip ourselves) */
          .rbc-event {
            background: transparent !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
          }
          .rbc-event.rbc-selected,
          .rbc-event:focus {
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
          }
          .rbc-event-content { height: 100%; position: relative; }
          /* Hide RBC's built-in event time label — we surface time on hover instead */
          .rbc-event-label { display: none !important; }
          .rbc-event { overflow: visible !important; }

          /* Current-time indicator */
          .rbc-current-time-indicator {
            background-color: #F43F5E !important;
            height: 2px !important;
            box-shadow: 0 0 8px rgba(244,63,94,0.5);
          }
          .rbc-current-time-indicator::before {
            content: '';
            position: absolute;
            left: -4px;
            top: -3px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #F43F5E;
            box-shadow: 0 0 8px rgba(244,63,94,0.6);
          }

          /* All-day row */
          .rbc-allday-cell { background: rgba(255,255,255,0.01); min-height: 28px; }

          /* Day grid */
          .rbc-day-bg { background: transparent; transition: background 0.15s ease; }
          .rbc-day-bg + .rbc-day-bg { border-left: 1px solid var(--color-border-color); }
          .rbc-day-bg:hover { background: rgba(255,255,255,0.015); }
          .rbc-day-slot { background: transparent; }
          .rbc-time-slot { min-height: 22px; }

          /* ===== Month ===== */
          .rbc-month-view { background: transparent; }
          .rbc-month-row {
            border-top: 1px solid var(--color-border-color);
            min-height: 110px;
            overflow: visible;
          }
          .rbc-date-cell {
            padding: 8px 10px 4px;
            font-size: 11px;
            font-weight: 500;
            color: var(--color-text-muted);
            text-align: right;
          }
          .rbc-date-cell.rbc-now { color: var(--color-text-main); }
          .rbc-date-cell.rbc-now > button,
          .rbc-date-cell.rbc-now > a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--color-primary);
            color: white;
            font-weight: 700;
          }
          .rbc-off-range-bg { background: transparent !important; }
          .rbc-off-range { color: var(--color-text-muted); opacity: 0.35; }
          .rbc-row-segment { padding: 1px 4px; }
          .rbc-month-row .rbc-event { background: transparent !important; padding: 0 !important; border: none !important; }
          .rbc-month-row .rbc-event-content { font-size: 11px; height: 22px; }
          .rbc-row-content { z-index: 4; }
          .rbc-show-more {
            color: var(--color-text-muted);
            font-weight: 600;
            font-size: 10px;
            background: transparent;
            padding: 2px 6px;
            border-radius: 4px;
            transition: all 0.15s;
          }
          .rbc-show-more:hover {
            color: var(--color-primary);
            background: rgba(200, 144, 43, 0.08);
          }

          /* ===== Agenda / List ===== */
          .rbc-agenda-view { border-top: none; }
          .rbc-agenda-view table.rbc-agenda-table {
            color: var(--color-text-main);
            background: transparent;
            border-collapse: separate;
            border-spacing: 0;
          }
          .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
            padding: 10px 14px;
            background: var(--color-bg-body);
            border-bottom: 1px solid var(--color-border-color);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--color-text-muted);
            text-align: left;
          }
          .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
            padding: 14px;
            border-bottom: 1px solid var(--color-border-color);
            vertical-align: middle;
          }
          .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover > td {
            background: rgba(255,255,255,0.015);
          }
          .rbc-agenda-view table.rbc-agenda-table .rbc-agenda-time-cell {
            color: var(--color-text-muted);
            font-size: 12px;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            width: 200px;
          }
          .rbc-agenda-view table.rbc-agenda-table .rbc-agenda-date-cell {
            color: var(--color-text-main);
            font-weight: 600;
            font-size: 12px;
            width: 140px;
          }
          .rbc-agenda-empty {
            padding: 48px;
            text-align: center;
            color: var(--color-text-muted);
            background: rgba(255,255,255,0.01);
          }
        `}</style>

        {viewMode !== 'list' ? (
          <PageToolbar
            view={currentView}
            label={toolbarLabel}
            onNavigate={handleNavigate}
            onViewChange={setCurrentView}
            hideNav={currentView === 'agenda'}
          />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border-color">
            <h2 className="text-[17px] font-semibold text-text-main tracking-tight">
              All Scheduled Appointments ({filteredAppointments.length})
            </h2>
          </div>
        )}

        {viewMode === 'list' ? (
          <AppointmentsTable
            appointments={filteredAppointments}
            doctors={doctors}
            onSelect={handleSelectEvent}
            onRemind={handleQuickReminder}
          />
        ) : currentView === 'agenda' ? (
          <AppointmentsTable
            appointments={filteredAppointments}
            doctors={doctors}
            onSelect={handleSelectEvent}
            onRemind={handleQuickReminder}
          />
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            views={['day', 'week', 'month']}
            step={15}
            timeslots={4}
            min={new Date(2025, 1, 1, 8, 0)}
            max={new Date(2025, 1, 1, 20, 0)}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            popup
            formats={{
              eventTimeRangeFormat: () => '',
              eventTimeRangeStartFormat: () => '',
              eventTimeRangeEndFormat: () => '',
            }}
            components={{
              event: (props) => <EventChip {...props} doctors={doctors} view={currentView} />,
              toolbar: () => null,
            }}
            className="flex-1 min-h-0"
          />
        )}
      </motion.div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAppointment(null); setDefaultPatientId(null); }}
        onSubmit={handleSubmit}
        initialAppointment={editingAppointment}
        defaultPatientId={defaultPatientId}
      />

      <AppointmentPanel
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={openEdit}
        onDelete={() => setDeletingAppointment(selectedEvent)}
      />

      <ConflictDialog
        events={conflictEvents}
        isOpen={!!conflictEvents}
        onClose={() => setConflictEvents(null)}
        onSelect={(evt) => setSelectedEvent(evt)}
      />

      <ConfirmDialog
        isOpen={!!deletingAppointment}
        onClose={() => setDeletingAppointment(null)}
        onConfirm={handleDelete}
        title="Delete this appointment?"
        description={deletingAppointment ? `${deletingAppointment.patientName}'s ${deletingAppointment.treatmentName} on ${format(new Date(deletingAppointment.start), 'EEE d MMM, h:mm a')} will be cancelled.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </AppLayout>
  );
}
