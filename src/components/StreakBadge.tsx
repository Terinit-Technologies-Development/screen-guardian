import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring } from 'react-native-reanimated';
import { Flame, ShieldCheck } from 'lucide-react-native';
import { HabitType } from '../types/habits';
import { getStreakVisual } from '../utils/streakVisuals';

export function StreakBadge({ streak, type, compact = false }: { streak: number; type: HabitType; compact?: boolean }) {
  const visual = getStreakVisual(streak, type);
  const pulse = useSharedValue(1);
  const Icon = type === 'quit' ? ShieldCheck : Flame;

  useEffect(() => {
    if (streak >= 7) {
      pulse.value = withRepeat(
        withSequence(
          withSpring(visual.pulseScale, { damping: 8, stiffness: 90 }),
          withSpring(1, { damping: 9, stiffness: 100 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withSpring(1);
    }
  }, [pulse, streak, visual.pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      className={`flex-row items-center ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-full border`}
      style={[
        animatedStyle,
        {
          backgroundColor: visual.backgroundColor,
          borderColor: visual.borderColor,
          shadowColor: visual.shadowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: streak >= 7 ? 0.45 : 0.12,
          shadowRadius: streak >= 7 ? 10 : 4,
          elevation: streak >= 7 ? 4 : 0,
        },
      ]}
    >
      <Icon size={compact ? 13 : 15} color={visual.iconColor} />
      <Text className={`${compact ? 'text-[10px]' : 'text-xs'} font-black ml-1.5`} style={{ color: visual.textColor }}>
        {streak}d
      </Text>
      {!compact && (
        <Text className="text-[9px] font-black uppercase ml-1.5" style={{ color: visual.textColor }}>
          {visual.label}
        </Text>
      )}
    </Animated.View>
  );
}
