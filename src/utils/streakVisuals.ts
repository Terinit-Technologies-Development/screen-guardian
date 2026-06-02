import { HabitType } from '../types/habits';

export type StreakVisual = {
  label: string;
  iconColor: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  shadowColor: string;
  pulseScale: number;
};

export function getStreakVisual(streak: number, habitType: HabitType): StreakVisual {
  const isQuit = habitType === 'quit';
  if (streak >= 30) {
    return {
      label: isQuit ? 'Reset' : 'Forge',
      iconColor: isQuit ? '#c084fc' : '#fb7185',
      textColor: isQuit ? '#e9d5ff' : '#ffe4e6',
      backgroundColor: isQuit ? 'rgba(88, 28, 135, 0.5)' : 'rgba(136, 19, 55, 0.45)',
      borderColor: isQuit ? '#a855f7' : '#fb7185',
      shadowColor: isQuit ? '#a855f7' : '#fb7185',
      pulseScale: 1.08,
    };
  }
  if (streak >= 14) {
    return {
      label: isQuit ? 'Shield' : 'Blaze',
      iconColor: isQuit ? '#a78bfa' : '#f97316',
      textColor: isQuit ? '#ddd6fe' : '#fed7aa',
      backgroundColor: isQuit ? 'rgba(76, 29, 149, 0.38)' : 'rgba(154, 52, 18, 0.34)',
      borderColor: isQuit ? '#8b5cf6' : '#f97316',
      shadowColor: isQuit ? '#8b5cf6' : '#f97316',
      pulseScale: 1.05,
    };
  }
  if (streak >= 7) {
    return {
      label: isQuit ? 'Clean' : 'Flame',
      iconColor: isQuit ? '#818cf8' : '#fb923c',
      textColor: isQuit ? '#c7d2fe' : '#fed7aa',
      backgroundColor: isQuit ? 'rgba(49, 46, 129, 0.34)' : 'rgba(124, 45, 18, 0.28)',
      borderColor: isQuit ? '#6366f1' : '#fb923c',
      shadowColor: isQuit ? '#6366f1' : '#fb923c',
      pulseScale: 1.03,
    };
  }
  if (streak >= 3) {
    return {
      label: isQuit ? 'Stable' : 'Warm',
      iconColor: isQuit ? '#60a5fa' : '#f59e0b',
      textColor: isQuit ? '#bfdbfe' : '#fde68a',
      backgroundColor: isQuit ? 'rgba(30, 64, 175, 0.22)' : 'rgba(146, 64, 14, 0.2)',
      borderColor: isQuit ? '#3b82f6' : '#f59e0b',
      shadowColor: isQuit ? '#3b82f6' : '#f59e0b',
      pulseScale: 1.01,
    };
  }
  if (streak >= 1) {
    return {
      label: isQuit ? 'Clear' : 'Spark',
      iconColor: isQuit ? '#38bdf8' : '#fb923c',
      textColor: isQuit ? '#bae6fd' : '#fed7aa',
      backgroundColor: isQuit ? 'rgba(14, 116, 144, 0.18)' : 'rgba(154, 52, 18, 0.16)',
      borderColor: isQuit ? '#06b6d4' : '#fb923c',
      shadowColor: isQuit ? '#06b6d4' : '#fb923c',
      pulseScale: 1,
    };
  }
  return {
    label: isQuit ? 'Reset' : 'Dormant',
    iconColor: '#737373',
    textColor: '#a3a3a3',
    backgroundColor: 'rgba(115, 115, 115, 0.1)',
    borderColor: 'rgba(115, 115, 115, 0.2)',
    shadowColor: '#000000',
    pulseScale: 1,
  };
}
