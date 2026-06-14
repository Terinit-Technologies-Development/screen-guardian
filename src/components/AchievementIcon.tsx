import React from 'react';
import {
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Briefcase,
  CheckCircle,
  Dumbbell,
  Flame,
  LayoutList,
  Medal,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Trophy,
} from 'lucide-react-native';

const ICONS: Record<string, any> = {
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Briefcase,
  CheckCircle,
  Dumbbell,
  Flame,
  LayoutList,
  Medal,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Trophy,
};

export function AchievementIcon({ name, size = 20, color }: { name: string; size?: number; color: string }) {
  const Icon = ICONS[name] ?? Award;
  return <Icon size={size} color={color} />;
}
