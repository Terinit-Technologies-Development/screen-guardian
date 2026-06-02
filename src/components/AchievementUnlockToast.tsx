import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { ACHIEVEMENTS } from '../utils/achievementDefinitions';
import { UserAchievement } from '../types/achievements';
import { AchievementIcon } from './AchievementIcon';

export function AchievementUnlockToast({ unlock, onDismiss }: { unlock?: UserAchievement; onDismiss: () => void }) {
  const definition = unlock ? ACHIEVEMENTS.find(item => item.id === unlock.achievementId) : undefined;
  if (!definition) return null;

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutUp.duration(200)}
      className="absolute left-4 right-4 top-4 z-50 rounded-[28px] bg-neutral-950 border border-white/15 p-4 shadow-2xl"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${definition.color}24` }}>
          <AchievementIcon name={definition.icon} color={definition.color} size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] text-cyan-300 font-black uppercase tracking-widest">Badge Unlocked</Text>
          <Text className="text-white text-base font-black mt-0.5">{definition.title}</Text>
          <Text className="text-neutral-400 text-xs mt-0.5" numberOfLines={1}>{definition.rewardText}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
          <X size={15} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
