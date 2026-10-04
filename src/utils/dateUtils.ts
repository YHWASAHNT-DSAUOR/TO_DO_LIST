/**
 * Date and time utilities for the Hierarchical To-Do application.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateHeading(dateString: string): { dayName: string; formattedDate: string } {
  const parts = dateString.split('-');
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  
  const todayStr = getTodayDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getFormattedDateString(tomorrow);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getFormattedDateString(yesterday);

  let prefix = '';
  if (dateString === todayStr) prefix = 'Today, ';
  else if (dateString === tomorrowStr) prefix = 'Tomorrow, ';
  else if (dateString === yesterdayStr) prefix = 'Yesterday, ';

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = prefix + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return { dayName, formattedDate };
}

export function getFormattedDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getGreeting(userName: string): string {
  const hour = new Date().getHours();
  let timeOfDay = 'Morning';
  if (hour >= 12 && hour < 17) {
    timeOfDay = 'Afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'Evening';
  } else if (hour >= 22 || hour < 5) {
    timeOfDay = 'Night';
  }
  return `Good ${timeOfDay}${userName ? `, ${userName}` : ''}`;
}

export function formatTimeDisplay(timeStr?: string, is24Hour = false): string {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  if (is24Hour) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function calculateReminderTime(taskDate: string, taskTime?: string, reminderOption = 'none', customMinutes = 0): Date | null {
  if (!taskTime || reminderOption === 'none') return null;

  const [year, month, day] = taskDate.split('-').map(Number);
  const [hour, minute] = taskTime.split(':').map(Number);

  const targetDate = new Date(year, month - 1, day, hour, minute, 0);

  let minutesBefore = 0;
  switch (reminderOption) {
    case 'at_time':
      minutesBefore = 0;
      break;
    case '5m':
      minutesBefore = 5;
      break;
    case '10m':
      minutesBefore = 10;
      break;
    case '15m':
      minutesBefore = 15;
      break;
    case '30m':
      minutesBefore = 30;
      break;
    case '1h':
      minutesBefore = 60;
      break;
    case 'custom':
      minutesBefore = customMinutes || 0;
      break;
    default:
      return null;
  }

  const reminderDate = new Date(targetDate.getTime() - minutesBefore * 60 * 1000);
  return reminderDate;
}

export function getTimeStatus(taskDate: string, taskTime?: string): { label: string; isUrgent: boolean; isPast: boolean } {
  if (!taskTime) return { label: '', isUrgent: false, isPast: false };

  const [year, month, day] = taskDate.split('-').map(Number);
  const [hour, minute] = taskTime.split(':').map(Number);
  const taskDateTime = new Date(year, month - 1, day, hour, minute, 0);
  const now = new Date();

  const diffMs = taskDateTime.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (60 * 1000));

  if (diffMinutes < 0) {
    const pastMinutes = Math.abs(diffMinutes);
    if (pastMinutes < 60) return { label: `${pastMinutes}m overdue`, isUrgent: true, isPast: true };
    const pastHours = Math.floor(pastMinutes / 60);
    return { label: `${pastHours}h overdue`, isUrgent: true, isPast: true };
  }

  if (diffMinutes === 0) {
    return { label: 'Due now', isUrgent: true, isPast: false };
  }

  if (diffMinutes <= 30) {
    return { label: `In ${diffMinutes}m`, isUrgent: true, isPast: false };
  }

  if (diffMinutes <= 120) {
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return { label: m > 0 ? `In ${h}h ${m}m` : `In ${h}h`, isUrgent: false, isPast: false };
  }

  return { label: '', isUrgent: false, isPast: false };
}

export function getUpcomingDates(daysCount = 7): { dateString: string; label: string; dayOfWeek: string; isToday: boolean }[] {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateString = getFormattedDateString(d);
    
    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    dates.push({
      dateString,
      label,
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'long' }),
      isToday: i === 0
    });
  }
  return dates;
}
