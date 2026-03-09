import { useState, useMemo, useCallback } from 'react';
import { CalendarEvent, CalendarDay } from '@/types/calendar';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: generateId(),
      title: 'Team Meeting',
      description: 'Weekly sync with the development team',
      date: new Date(),
      startTime: '10:00',
      endTime: '11:00',
      color: 'blue',
      recurrence: 'weekly',
      reminder: 15,
      location: 'Conference Room A',
    },
    {
      id: generateId(),
      title: 'Project Deadline',
      description: 'Submit final deliverables',
      date: new Date(new Date().setDate(new Date().getDate() + 3)),
      startTime: '17:00',
      endTime: '18:00',
      color: 'red',
      recurrence: 'none',
      reminder: 60,
    },
    {
      id: generateId(),
      title: 'Lunch with Client',
      description: 'Discuss new partnership opportunities',
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      startTime: '12:30',
      endTime: '14:00',
      color: 'green',
      recurrence: 'none',
      reminder: 30,
      location: 'Downtown Restaurant',
    },
  ]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const calendarDays = useMemo((): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((date) => ({
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      events: events.filter((event) => isSameDay(new Date(event.date), date)),
    }));
  }, [currentDate, events]);

  const nextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const prevMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: generateId() };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event))
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setSelectedEvent(null);
  }, []);

  const moveEvent = useCallback((eventId: string, newDate: Date) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, date: newDate } : event
      )
    );
  }, []);

  return {
    currentDate,
    calendarDays,
    events,
    selectedEvent,
    setSelectedEvent,
    nextMonth,
    prevMonth,
    goToToday,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
  };
}
