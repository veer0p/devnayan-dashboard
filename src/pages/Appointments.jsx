import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, List, CalendarBlank, CaretLeft, CaretRight, Clock, User, MapPin } from '@phosphor-icons/react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isToday, isTomorrow, isYesterday } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AppLayout from '../components/layout/AppLayout';
import { mockAppointments, mockTreatments } from '../data/appointments';
import BookingModal from '../components/appointments/BookingModal';
import AppointmentPanel from '../components/appointments/AppointmentPanel';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay, locales,
});

// Custom Event Component for Calendar
const EventComponent = ({ event }) => {
  const treatment = mockTreatments.find(t => t.id === event.treatmentId) || mockTreatments[0];
  const durationMins = (event.end - event.start) / (1000 * 60);
  const isShort = durationMins <= 30;

  return (
    <div className={`p-1 px-2 h-full w-full rounded border-l-4 flex overflow-hidden shadow-sm transition-all hover:shadow-md ${treatment.color} ${isShort ? 'flex-row items-center gap-2' : 'flex-col justify-start gap-0.5'}`}>
      <div className="font-semibold text-[11px] truncate leading-none">{event.patientName}</div>
      <div className={`text-[10px] truncate opacity-90 leading-none ${isShort ? 'font-medium' : ''}`}>{event.treatmentName}</div>
    </div>
  );
};

// Custom Toolbar for Calendar
const CustomToolbar = (toolbar) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToToday = () => toolbar.onNavigate('TODAY');

  return (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-color">
      <div className="flex items-center gap-4">
        <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium border border-border-color rounded-lg hover:bg-bg-body transition-colors">
          Today
        </button>
        <div className="flex items-center gap-1">
          <button onClick={goToBack} className="p-1.5 text-text-muted hover:text-text-main hover:bg-bg-body rounded transition-colors">
            <CaretLeft size={16} weight="bold" />
          </button>
          <span className="text-base font-semibold min-w-[140px] text-center">
            {toolbar.label}
          </span>
          <button onClick={goToNext} className="p-1.5 text-text-muted hover:text-text-main hover:bg-bg-body rounded transition-colors">
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => toolbar.onView('week')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${toolbar.view === 'week' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-body'}`}
        >
          Week
        </button>
        <button
          onClick={() => toolbar.onView('day')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${toolbar.view === 'day' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-body'}`}
        >
          Day
        </button>
      </div>
    </div>
  );
};

// Helper for day label
const getDayLabel = (date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE');
};

// Mobile List View Component
const MobileListView = ({ appointments, onSelect }) => {
  // Group by date
  const grouped = appointments.reduce((acc, app) => {
    const dateKey = format(new Date(app.start), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(app);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-5 pb-6">
      {sortedDates.map(dateKey => {
        const date = new Date(dateKey + 'T00:00:00');
        const dayApps = grouped[dateKey].sort((a, b) => new Date(a.start) - new Date(b.start));

        return (
          <div key={dateKey}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isToday(date) ? 'bg-primary text-white' : 'bg-bg-body border border-border-color text-text-main'}`}>
                <span className="text-lg font-bold leading-none">{format(date, 'd')}</span>
                <span className="text-[10px] font-medium uppercase leading-none mt-0.5">{format(date, 'MMM')}</span>
              </div>
              <div>
                <div className="font-semibold text-text-main">{getDayLabel(date)}</div>
                <div className="text-xs text-text-muted">{dayApps.length} appointment{dayApps.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Appointment cards */}
            <div className="space-y-2 ml-2 pl-5 border-l-2 border-border-color">
              {dayApps.map(app => {
                const treatment = mockTreatments.find(t => t.id === app.treatmentId) || mockTreatments[0];
                return (
                  <motion.div
                    key={app.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(app)}
                    className="bg-bg-card border border-border-color rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all active:bg-bg-body"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary font-bold flex items-center justify-center text-sm">
                          {app.patientName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-text-main text-sm">{app.patientName}</div>
                          <div className="text-xs text-text-muted">{app.treatmentName}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                        app.status === 'Confirmed' ? 'bg-emerald-900/30 text-emerald-400' :
                        app.status === 'Completed' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-amber-900/30 text-amber-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {format(new Date(app.start), 'h:mm a')} - {format(new Date(app.end), 'h:mm a')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {app.chair}
                      </span>
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
          <p className="font-medium">No appointments this week</p>
        </div>
      )}
    </div>
  );
};

export default function Appointments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = mockAppointments.map(app => ({
    ...app,
    title: app.patientName,
    start: new Date(app.start),
    end: new Date(app.end),
  }));

  const handleSelectSlot = () => {
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-semibold mb-1">Appointments</h1>
          <p className="text-text-muted text-sm">Manage your clinic's schedule</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus size={16} weight="bold" /> Book Patient
          </button>
        </motion.div>
      </div>

      {/* Mobile: List View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:hidden"
      >
        <MobileListView appointments={mockAppointments} onSelect={handleSelectEvent} />
      </motion.div>

      {/* Desktop: Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:flex flex-1 bg-bg-card border border-border-color rounded-2xl shadow-sm p-5 flex-col"
      >
        <style>{`
          .rbc-calendar { font-family: var(--font-sans); min-height: 800px; }
          .rbc-header { padding: 12px 0; font-weight: 600; text-transform: uppercase; font-size: 11px; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border-color); background: var(--color-bg-card); }
          .rbc-time-view { border: none; border-top: 1px solid var(--color-border-color); border-radius: 8px; overflow: hidden; background: var(--color-bg-card); }
          .rbc-time-header { border-bottom: 1px solid var(--color-border-color); margin-right: 0 !important; }
          .rbc-time-header-content { border-left: 1px solid var(--color-border-color); }
          .rbc-time-content { border-top: none; background: var(--color-bg-body); }
          .rbc-timeslot-group { border-bottom: 1px solid var(--color-border-color); min-height: 100px; }
          .rbc-day-slot .rbc-time-slot { border-top: 1px solid var(--color-border-color); opacity: 0.2; }
          .rbc-day-slot .rbc-events-container { margin-right: 12px; }
          .rbc-event { background: transparent !important; padding: 0 !important; border: none !important; }
          .rbc-event.rbc-selected { background: transparent !important; outline: none !important; }
          .rbc-event-content { height: 100%; }
          .rbc-time-gutter .rbc-timeslot-group { border-bottom: none; }
          .rbc-label { padding: 0 10px; font-size: 11px; font-weight: 500; color: var(--color-text-muted); }
          .rbc-today { background-color: rgba(200, 144, 43, 0.08) !important; }
          .rbc-day-bg + .rbc-day-bg { border-left: 1px solid var(--color-border-color); }
          .rbc-day-bg { background: var(--color-bg-body); }
          .rbc-time-slot { min-height: 25px; }
          .rbc-allday-cell { background: var(--color-bg-card); }
        `}</style>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['week', 'day']}
          step={15}
          timeslots={4}
          min={new Date(2025, 1, 1, 8, 0)}
          max={new Date(2025, 1, 1, 19, 0)}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          components={{
            event: EventComponent,
            toolbar: CustomToolbar
          }}
          className="flex-1 min-h-0"
        />
      </motion.div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AppointmentPanel
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </AppLayout>
  );
}
