import { format, subDays, isToday, isYesterday } from 'date-fns';

export function formatDate(date: Date | number, formatStr: string = 'MMM dd, yyyy'): string {
  return format(date, formatStr);
}

export function getDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getTodayString(): string {
  return getDateString(new Date());
}

export function getRelativeDateLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return formatDate(date, 'MMM dd');
}

export function getLast7Days(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(getDateString(subDays(new Date(), i)));
  }
  return dates;
}

export function getLast30Days(): string[] {
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    dates.push(getDateString(subDays(new Date(), i)));
  }
  return dates;
}
