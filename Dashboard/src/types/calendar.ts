export type EventColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  color: EventColor;
  recurrence: RecurrenceType;
  reminder: number; // minutes before event
  location?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
