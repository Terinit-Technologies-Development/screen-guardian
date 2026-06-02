import React, { useEffect, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Flame, ShieldCheck, Sparkles, Target, Trophy } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAchievementStore } from '../../src/store/achievementStore';
import { ACHIEVEMENTS } from '../../src/utils/achievementDefinitions';
import { AchievementCard } from '../../src/components/AchievementCard';
import { AchievementUnlockToast } from '../../src/components/AchievementUnlockToast';

const CATEGORY_LABELS: Record<string, string> = {
  habits: 'Habits',
  streaks: 'Streaks',
  work: 'Work',
  focus: 'Focus',
  reading: 'Reading',
  screen_time: 'Screen Time',
  planning: 'Planning',
};

export default function AchievementsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { unlocked, latestUnlocks, evaluateAchievements, getProgress, getMetrics, markAchievementSeen } = useAchievementStore();

  useEffect(() => {
    evaluateAchievements();
  }, [evaluateAchievements]);

  const progress = getProgress();
  const metrics = getMetrics();
  const unlockedCount = Object.keys(unlocked).length;
  const completionRatio = ACHIEVEMENTS.length > 0 ? unlockedCount / ACHIEVEMENTS.length : 0;
  const level = Math.max(1, Math.floor(unlockedCount / 4) + 1);
  const nextLevelRemaining = Math.max(0, level * 4 - unlockedCount);
  const nextUnlock = progress
    .filter(item => !item.isUnlocked)
    .sort((a, b) => b.ratio - a.ratio)[0];
  const nextDefinition = nextUnlock ? ACHIEVEMENTS.find(item => item.id === nextUnlock.achievementId) : undefined;

  const grouped = useMemo(() => {
    return ACHIEVEMENTS.reduce<Record<string, typeof ACHIEVEMENTS>>((acc, achievement) => {
      acc[achievement.category] = [...(acc[achievement.category] ?? []), achievement];
      return acc;
    }, {});
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`} edges={['top']}>
      <AchievementUnlockToast
        unlock={latestUnlocks[0]}
        onDismiss={() => latestUnlocks[0] && markAchievementSeen(latestUnlocks[0].achievementId)}
      />

      <View className={`px-6 pt-6 pb-4 ${isDark ? 'bg-neutral-950' : 'bg-white'} border-b ${isDark ? 'border-neutral-900' : 'border-neutral-200'}`}>
        <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>Achievements</Text>
        <Text className={`text-sm font-semibold mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Dopamine with direction, not distraction</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()} className="mb-6">
          <View className="bg-[#101014] p-6 rounded-[36px] border border-white/10 overflow-hidden">
            <View className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-cyan-500/20" />
            <View className="absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-purple-500/20" />
            <View className="flex-row items-center justify-between z-10">
              <View className="flex-1 pr-4">
                <Text className="text-cyan-300 text-[10px] font-black uppercase tracking-[2px]">Intentional Living</Text>
                <Text className="text-white text-4xl font-black mt-1">Level {level}</Text>
                <Text className="text-neutral-400 text-xs mt-2 leading-5">
                  {nextLevelRemaining === 0 ? 'Level up is ready.' : `${nextLevelRemaining} more badges until Level ${level + 1}.`}
                </Text>
              </View>
              <View className="w-20 h-20 rounded-[28px] bg-white/10 border border-white/10 items-center justify-center">
                <Trophy size={36} color="#facc15" />
              </View>
            </View>
            <View className="h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
              <View className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.max(4, completionRatio * 100)}%` }} />
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="text-white/50 text-xs font-bold">{unlockedCount}/{ACHIEVEMENTS.length} badges</Text>
              <Text className="text-cyan-300 text-xs font-black">{Math.round(completionRatio * 100)}%</Text>
            </View>
          </View>
        </Animated.View>

        <View className="flex-row gap-3 mb-6">
          <MetricTile icon={Flame} label="Build Streak" value={`${metrics.bestBuildHabitStreak}d`} color="#f97316" isDark={isDark} />
          <MetricTile icon={ShieldCheck} label="Clean Streak" value={`${metrics.bestQuitHabitStreak}d`} color="#8b5cf6" isDark={isDark} />
          <MetricTile icon={Target} label="Intentional" value={`${metrics.intentionalTodayScore}/3`} color="#10b981" isDark={isDark} />
        </View>

        {nextDefinition && nextUnlock && (
          <View className={`p-5 rounded-[32px] border mb-6 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-2xl bg-cyan-500/10 items-center justify-center">
                <Sparkles size={20} color="#06b6d4" />
              </View>
              <View className="flex-1">
                <Text className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Closest Next Badge</Text>
                <Text className={`text-base font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>{nextDefinition.title}</Text>
              </View>
              <Text className="text-cyan-500 font-black text-sm">{Math.round(nextUnlock.ratio * 100)}%</Text>
            </View>
            <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <View className="h-full bg-cyan-500" style={{ width: `${Math.max(4, nextUnlock.ratio * 100)}%` }} />
            </View>
          </View>
        )}

        {Object.entries(grouped).map(([category, definitions]) => (
          <View key={category} className="mb-7">
            <View className="flex-row items-center justify-between mb-3 px-2">
              <Text className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {CATEGORY_LABELS[category] ?? category}
              </Text>
              <View className={`px-2.5 py-1 rounded-full ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                <Text className={`text-[10px] font-black ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {definitions.filter(item => unlocked[item.id]).length}/{definitions.length}
                </Text>
              </View>
            </View>
            <View className="gap-3">
              {definitions.map(definition => {
                const itemProgress = progress.find(item => item.achievementId === definition.id)!;
                return (
                  <AchievementCard
                    key={definition.id}
                    definition={definition}
                    progress={itemProgress}
                    unlock={unlocked[definition.id]}
                    isDark={isDark}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricTile({ icon: Icon, label, value, color, isDark }: { icon: any; label: string; value: string; color: string; isDark: boolean }) {
  return (
    <View className={`flex-1 p-4 rounded-3xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
      <View className="w-9 h-9 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: `${color}1F` }}>
        <Icon size={18} color={color} />
      </View>
      <Text className={`text-lg font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>{value}</Text>
      <Text className={`text-[10px] font-bold uppercase mt-0.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{label}</Text>
    </View>
  );
}
