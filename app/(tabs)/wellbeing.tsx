import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { format } from 'date-fns';
import { BookOpen, Gamepad2, MessageCircle, AlertTriangle, Briefcase, SlidersHorizontal, Plus, Minus } from 'lucide-react-native';
import { useUsageStore } from '../../src/store/usageStore';
import { useReadingStore } from '../../src/store/readingStore';
import { useWellbeingStore } from '../../src/store/wellbeingStore';
import { formatTime } from '../../src/utils/formatters';
import { WellbeingEffects } from '../../src/types/wellbeing';

export default function WellbeingScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { todayApps, allApps } = useUsageStore();
  const { dailyLogs } = useReadingStore();
  const { classifications, classifyApp, states, setActiveState, updateStateEffect } = useWellbeingStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const reading = dailyLogs[today] ?? { pagesRead: 0, durationSeconds: 0 };
  const activeState = states.find(state => state.isActive) ?? states[0];

  const appRows = allApps.map(app => {
    const usage = todayApps.find(item => item.packageName === app.packageName);
    const classification = classifications[app.packageName];
    return {
      packageName: app.packageName,
      appName: app.appName,
      timeInForeground: usage?.timeInForeground ?? 0,
      classification,
    };
  }).sort((a, b) => b.timeInForeground - a.timeInForeground);

  const summary = useMemo(() => {
    let gamingSeconds = 0;
    let messagingSeconds = 0;
    let socialSeconds = 0;
    let doomscrollSeconds = 0;
    let productiveSeconds = 0;
    let otherSeconds = 0;

    for (const app of appRows) {
      const classification = app.classification;
      if (classification?.isGame || classification?.category === 'game') gamingSeconds += app.timeInForeground;
      else if (classification?.isMessaging || classification?.category === 'messaging') messagingSeconds += app.timeInForeground;
      else if (classification?.isDoomscrollRisk || classification?.category === 'social') {
        socialSeconds += app.timeInForeground;
        if (classification?.isDoomscrollRisk) doomscrollSeconds += app.timeInForeground;
      } else if (classification?.category === 'productive') productiveSeconds += app.timeInForeground;
      else otherSeconds += app.timeInForeground;
    }

    return {
      readingSeconds: reading.durationSeconds,
      gamingSeconds,
      messagingSeconds,
      socialSeconds,
      doomscrollSeconds,
      productiveSeconds,
      otherSeconds,
    };
  }, [appRows, reading.durationSeconds]);

  const score = Math.round(
    (summary.readingSeconds / 60) * activeState.effects.reading +
    (summary.gamingSeconds / 60) * activeState.effects.gaming +
    (summary.productiveSeconds / 60) * 0.6 +
    (summary.doomscrollSeconds / 60) * activeState.effects.social +
    (summary.otherSeconds / 60) * activeState.effects.screenTime
  );

  const topApps = appRows.slice(0, 12);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`} edges={['top']}>
      <View className={`px-6 pt-6 pb-4 ${isDark ? 'bg-neutral-950' : 'bg-white'} border-b ${isDark ? 'border-neutral-900' : 'border-neutral-200'}`}>
        <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>Wellbeing</Text>
        <Text className={`text-sm font-semibold mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
          Functional screen time, gaming, and state effects
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 110 }}>
        <View className={`p-5 rounded-[32px] border mb-6 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className={`text-lg font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>Functional Balance</Text>
              <Text className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>State-adjusted score</Text>
            </View>
            <Text className={`text-3xl font-black ${score >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{score}</Text>
          </View>
          <View className="gap-3">
            <BreakdownRow icon={BookOpen} color="#8b5cf6" label="Reading" value={formatTime(summary.readingSeconds)} />
            <BreakdownRow icon={Gamepad2} color="#22c55e" label="Gaming / downtime" value={formatTime(summary.gamingSeconds)} />
            <BreakdownRow icon={MessageCircle} color="#06b6d4" label="Messaging" value={formatTime(summary.messagingSeconds)} />
            <BreakdownRow icon={AlertTriangle} color="#ef4444" label="Doomscroll risk" value={formatTime(summary.doomscrollSeconds)} />
            <BreakdownRow icon={Briefcase} color="#3b82f6" label="Productive apps" value={formatTime(summary.productiveSeconds)} />
          </View>
        </View>

        <View className="mb-6">
          <Text className={`text-xs font-black uppercase tracking-widest mb-3 ml-2 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Current State</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
            {states.map(state => (
              <TouchableOpacity
                key={state.id}
                onPress={() => setActiveState(state.id)}
                className={`w-40 p-4 rounded-3xl border ${state.isActive ? 'bg-cyan-500 border-cyan-500' : isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
              >
                <SlidersHorizontal size={18} color={state.isActive ? '#fff' : '#06b6d4'} />
                <Text className={`font-black mt-2 ${state.isActive ? 'text-white' : isDark ? 'text-white' : 'text-neutral-900'}`}>{state.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeState && (
            <View className={`mt-3 p-4 rounded-3xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              {(Object.keys(activeState.effects) as (keyof WellbeingEffects)[]).map(key => (
                <View key={key} className="flex-row items-center justify-between py-2">
                  <Text className={`capitalize font-bold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{key}</Text>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => updateStateEffect(activeState.id, key, Number((activeState.effects[key] - 0.1).toFixed(1)))} className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 items-center justify-center">
                      <Minus size={14} color={isDark ? '#fff' : '#111'} />
                    </TouchableOpacity>
                    <Text className={`w-12 text-center font-black ${activeState.effects[key] >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{activeState.effects[key].toFixed(1)}</Text>
                    <TouchableOpacity onPress={() => updateStateEffect(activeState.id, key, Number((activeState.effects[key] + 0.1).toFixed(1)))} className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 items-center justify-center">
                      <Plus size={14} color={isDark ? '#fff' : '#111'} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View>
          <Text className={`text-xs font-black uppercase tracking-widest mb-3 ml-2 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Classify Apps</Text>
          <View className="gap-3">
            {topApps.map(app => {
              const c = app.classification;
              return (
                <View key={app.packageName} className={`p-4 rounded-3xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                  <View className="flex-row justify-between gap-3 mb-3">
                    <View className="flex-1">
                      <Text className={`font-black ${isDark ? 'text-white' : 'text-neutral-900'}`} numberOfLines={1}>{app.appName}</Text>
                      <Text className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{formatTime(app.timeInForeground)}</Text>
                    </View>
                    {c?.heightenedRestriction && <Text className="text-xs font-black text-red-500">HEIGHTENED</Text>}
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    <ClassButton label="Game" active={!!c?.isGame} onPress={() => classifyApp(app.packageName, app.appName, { isGame: !c?.isGame, category: !c?.isGame ? 'game' : 'other' })} />
                    <ClassButton label="Message" active={!!c?.isMessaging} onPress={() => classifyApp(app.packageName, app.appName, { isMessaging: !c?.isMessaging, category: !c?.isMessaging ? 'messaging' : 'other' })} />
                    <ClassButton label="Doomscroll" active={!!c?.isDoomscrollRisk} danger onPress={() => classifyApp(app.packageName, app.appName, { isDoomscrollRisk: !c?.isDoomscrollRisk, category: !c?.isDoomscrollRisk ? 'social' : 'other', heightenedRestriction: !c?.isDoomscrollRisk ? true : c?.heightenedRestriction })} />
                    <ClassButton label="Heighten" active={!!c?.heightenedRestriction} danger onPress={() => classifyApp(app.packageName, app.appName, { heightenedRestriction: !c?.heightenedRestriction })} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BreakdownRow({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
          <Icon size={16} color={color} />
        </View>
        <Text className="text-sm font-bold text-foreground">{label}</Text>
      </View>
      <Text className="text-sm font-black text-foreground">{value}</Text>
    </View>
  );
}

function ClassButton({ label, active, danger, onPress }: { label: string; active: boolean; danger?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className={`px-3 py-2 rounded-xl border ${active ? (danger ? 'bg-red-500 border-red-500' : 'bg-cyan-500 border-cyan-500') : 'bg-transparent border-border'}`}>
      <Text className={`text-xs font-black ${active ? 'text-white' : 'text-muted-foreground'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
