import React from 'react';
import { Text, View } from 'react-native';
import { AchievementDefinition, AchievementProgress, UserAchievement } from '../types/achievements';
import { AchievementIcon } from './AchievementIcon';

const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  legend: 'Legend',
};

export function AchievementCard({
  definition,
  progress,
  unlock,
  isDark,
}: {
  definition: AchievementDefinition;
  progress: AchievementProgress;
  unlock?: UserAchievement;
  isDark: boolean;
}) {
  const unlocked = !!unlock || progress.isUnlocked;
  const progressLabel = `${Math.min(progress.value, progress.target)}/${progress.target}`;

  return (
    <View
      className={`p-4 rounded-[28px] border overflow-hidden ${
        unlocked
          ? isDark ? 'bg-neutral-900 border-white/10' : 'bg-white border-neutral-200'
          : isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-200'
      }`}
      style={{ opacity: unlocked ? 1 : 0.68 }}
    >
      {unlocked && (
        <View
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full"
          style={{ backgroundColor: `${definition.color}24` }}
        />
      )}
      <View className="flex-row items-start gap-3">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center border"
          style={{ backgroundColor: `${definition.color}1A`, borderColor: `${definition.color}40` }}
        >
          <AchievementIcon name={definition.icon} size={22} color={unlocked ? definition.color : '#737373'} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text className={`text-base font-black flex-1 ${isDark ? 'text-white' : 'text-neutral-900'}`} numberOfLines={1}>
              {definition.title}
            </Text>
            <Text className="text-[9px] font-black uppercase" style={{ color: unlocked ? definition.color : '#737373' }}>
              {unlocked ? TIER_LABELS[definition.tier] : progressLabel}
            </Text>
          </View>
          <Text className={`text-xs mt-1 leading-4 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {definition.description}
          </Text>
          {unlocked && (
            <Text className="text-[11px] font-bold mt-2" style={{ color: definition.color }}>
              {definition.rewardText}
            </Text>
          )}
        </View>
      </View>

      <View className={`h-1.5 rounded-full mt-4 overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.max(4, progress.ratio * 100)}%`, backgroundColor: unlocked ? definition.color : '#737373' }}
        />
      </View>
    </View>
  );
}
