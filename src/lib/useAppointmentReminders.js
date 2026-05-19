import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'dentease.notifiedAppointments';

const sameDay = (a, b) => {
  const da = a instanceof Date ? a : new Date(a);
  const db = b instanceof Date ? b : new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const loadNotified = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const saveNotified = (set) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
};

// Show browser notifications for appointments starting in the next 30 minutes
export function useAppointmentReminders(appointments) {
  const notifiedRef = useRef(loadNotified());

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    // Request permission lazily on first mount
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const check = () => {
      const now = new Date();
      const today = appointments.filter(a => sameDay(new Date(a.start), now));
      today.forEach(a => {
        const start = new Date(a.start);
        const diffMin = (start.getTime() - now.getTime()) / 60_000;
        if (diffMin > 0 && diffMin <= 30 && !notifiedRef.current.has(a.id)) {
          new Notification(`Upcoming: ${a.patientName}`, {
            body: `${a.treatmentName} at ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} in ${a.chair}`,
            icon: '/icon.svg',
            tag: a.id,
          });
          notifiedRef.current.add(a.id);
          saveNotified(notifiedRef.current);
        }
      });
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [appointments]);
}
