import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, Lock, Unlock, Info, ChevronLeft, ChevronRight, Plus, X, ShieldAlert, ShieldCheck, ShieldOff, Edit3, Trash2, CalendarDays } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useStatePlannerStore } from '../../src/store/statePlannerStore';
import { PLANNER_STATES, PlannerStateId, PlannerEntry, STATE_CATEGORY_RESTRICTIONS, CategoryRestriction, FunctionalBalance, AppOverride, canModifyEntry, canCancelState } from '../../src/types/statePlanner';
import { useWellbeingStore } from '../../src/store/wellbeingStore';
import { useUsageStore } from '../../src/store/usageStore';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <Pressable onLongPress={() => setVisible(true)} onPressOut={() => setVisible(false)} delayLongPress={300}>
      {children}
      {visible && (
        <View className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-900 dark:bg-zinc-100 rounded-lg p-2 shadow-lg z-50 max-w-[240px]">
          <Text className="text-xs text-white dark:text-zinc-900 dark:font-medium leading-4">{text}</Text>
          <View className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45 -mt-1" />
        </View>
      )}
    </Pressable>
  );
}

function BalanceRing({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 28;
  const progress = (score / 100) * circumference;
  return (
    <View className="items-center mx-2">
      <View className="w-16 h-16 justify-center items-center">
        <View className="absolute w-16 h-16 rounded-full border-4 border-zinc-800 dark:border-zinc-300" />
        <View className="absolute w-16 h-16 rounded-full" style={{ borderTopColor: color, borderRightColor: color, borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderWidth: 4, transform: [{ rotate: '-90deg' }] }} />
        <Text className="text-sm font-bold text-foreground">{score}</Text>
      </View>
      <Text className="text-[10px] font-semibold text-muted-foreground mt-1">{label}</Text>
    </View>
  );
}

export default function StatePlannerScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const entries = useStatePlannerStore(s => s.entries);
  const recurringPatterns = useStatePlannerStore(s => s.recurringPatterns);
  const setEntry = useStatePlannerStore(s => s.setEntry);
  const removeEntry = useStatePlannerStore(s => s.removeEntry);
  const lockEntry = useStatePlannerStore(s => s.lockEntry);
  const unlockEntry = useStatePlannerStore(s => s.unlockEntry);
  const updateAppOverride = useStatePlannerStore(s => s.updateAppOverride);
  const setActiveState = useStatePlannerStore(s => s.setActiveState);
  const addRecurringPattern = useStatePlannerStore(s => s.addRecurringPattern);
  const removeRecurringPattern = useStatePlannerStore(s => s.removeRecurringPattern);
  const getRestrictionsForToday = useStatePlannerStore(s => s.getRestrictionsForToday);
  const calculateBalance = useStatePlannerStore(s => s.calculateBalance);
  const classifications = useWellbeingStore(s => s.classifications);
  const todayApps = useUsageStore(s => s.todayApps);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [patternStateId, setPatternStateId] = useState<PlannerStateId>('deep-work');
  const [patternDays, setPatternDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { stateId: todayState } = getRestrictionsForToday();

  const balance: FunctionalBalance = useMemo(() => {
    return calculateBalance(classifications, todayApps);
  }, [entries, classifications, todayApps, calculateBalance]);

  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: string; day: number; isCurrentMonth: boolean; isToday: boolean; isFuture: boolean }> = [];

    for (let i = 0; i < firstDay; i++) {
      const d = new Date(year, month, -(firstDay - i - 1));
      days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), isCurrentMonth: false, isToday: d.toISOString().split('T')[0] === today, isFuture: d > new Date() });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr, day: i, isCurrentMonth: true, isToday: dateStr === today, isFuture: d > new Date() });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d.toISOString().split('T')[0], day: i, isCurrentMonth: false, isToday: false, isFuture: true });
    }
    return days;
  }, [currentMonth, today]);

  const selectedEntry = selectedDate ? entries[selectedDate] : null;

  const handleDatePress = (date: string) => {
    setSelectedDate(date);
  };

  const handleSetState = (stateId: PlannerStateId) => {
    if (!selectedDate) return;
    const entry = entries[selectedDate];
    if (entry && !canModifyEntry(entry)) {
      Alert.alert('Locked', 'This entry is locked and cannot be modified.');
      return;
    }
    setEntry(selectedDate, stateId);
    if (selectedDate === today) setActiveState(stateId);
  };

  const handleRemoveDate = () => {
    if (!selectedDate) return;
    const entry = entries[selectedDate];
    if (entry && !canModifyEntry(entry)) {
      Alert.alert('Locked', 'This entry is locked and cannot be removed.');
      return;
    }
    removeEntry(selectedDate);
    setSelectedDate(null);
  };

  const handleAddPattern = () => {
    addRecurringPattern({
      stateId: patternStateId,
      daysOfWeek: patternDays,
      startDate: new Date(currentMonth.year, currentMonth.month, 1).toISOString().split('T')[0],
      endDate: null,
      appOverrides: [],
    });
    setShowPatternModal(false);
  };

  const restrictionsToday = useMemo(() => {
    if (!todayState) return [];
    return STATE_CATEGORY_RESTRICTIONS[todayState];
  }, [todayState]);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`} edges={['top']}>
      <View className={`px-6 pt-6 pb-4 ${isDark ? 'bg-neutral-950' : 'bg-white'} border-b ${isDark ? 'border-neutral-900' : 'border-neutral-200'}`}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>State Planner</Text>
            <Text className={`text-sm font-semibold mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Plan your month. Lock in focus. Recover intentionally.</Text>
          </View>
          <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'}`}>
            <CalendarDays size={24} color="#06b6d4" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>

      <View className="px-4 pt-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => setCurrentMonth(m => ({ ...m, month: m.month === 0 ? 11 : m.month - 1, year: m.month === 0 ? m.year - 1 : m.year }))} className="p-2">
          <ChevronLeft size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">{MONTH_NAMES[currentMonth.month]} {currentMonth.year}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth(m => ({ ...m, month: m.month === 11 ? 0 : m.month + 1, year: m.month === 11 ? m.year + 1 : m.year }))} className="p-2">
          <ChevronRight size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      <View className="px-4 pt-2 flex-row justify-between">
        {DAY_LABELS.map(d => (
          <View key={d} className="w-[14.28%] items-center"><Text className="text-xs font-semibold text-muted-foreground">{d}</Text></View>
        ))}
      </View>

      <View className="px-4 pt-1 flex-row flex-wrap">
        {calendarDays.map(day => {
          const entry = entries[day.date];
          const stateDef = entry ? PLANNER_STATES.find(s => s.id === entry.stateId) : null;
          const bg = stateDef ? (isDark ? stateDef.darkColor : stateDef.color) : (day.isToday ? '#06b6d4' : 'transparent');
          const opacity = day.isCurrentMonth ? 1 : 0.35;
          return (
            <TouchableOpacity
              key={day.date}
              className={`w-[14.28%] aspect-square items-center justify-center rounded-lg m-[0.5%] ${selectedDate === day.date ? 'ring-2 ring-cyan-400' : ''}`}
              style={{ backgroundColor: stateDef ? bg : (day.isToday ? bg : isDark ? '#1a1a1a' : '#f5f5f5'), opacity, borderWidth: day.isToday && !stateDef ? 1 : 0, borderColor: day.isToday ? '#06b6d4' : 'transparent' }}
              onPress={() => handleDatePress(day.date)}
            >
              {entry?.locked && !stateDef && (
                <View className="absolute top-0.5 right-0.5">
                  <Lock size={7} color={isDark ? '#fff' : '#000'} />
                </View>
              )}
              <Text className={`text-xs font-semibold ${stateDef || day.isToday ? 'text-white' : 'text-foreground'}`}>{day.day}</Text>
              {entry?.locked && stateDef && <Lock size={6} color="#fff" className="absolute top-0.5 right-0.5" />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="px-4 pt-3 flex-row flex-wrap gap-2">
        {PLANNER_STATES.map(s => (
          <View key={s.id} className="flex-row items-center mr-3">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: isDark ? s.darkColor : s.color }} />
            <Text className="text-xs text-muted-foreground ml-1">{s.label}</Text>
          </View>
        ))}
      </View>

      {selectedDate && (
        <View className="px-4 pt-4">
          <View className="bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
              {selectedEntry && (
                <TouchableOpacity onPress={() => {
                  if (selectedEntry?.locked) {
                    if (canCancelState(selectedEntry.stateId)) unlockEntry(selectedDate);
                  } else lockEntry(selectedDate);
                }} className="flex-row items-center">
                  {selectedEntry?.locked ? <Lock size={14} color={isDark ? '#ef4444' : '#dc2626'} /> : <Unlock size={14} color={isDark ? '#a1a1aa' : '#71717a'} />}
                  <Text className={`text-xs ml-1 ${selectedEntry?.locked ? 'text-red-500' : 'text-muted-foreground'}`}>{selectedEntry?.locked ? 'Locked' : 'Unlocked'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedEntry?.locked && selectedEntry.stateId === 'lock-in' && (
              <View className="mt-2 bg-red-500/10 rounded-lg p-2 flex-row items-center">
                <ShieldAlert size={14} color="#dc2626" />
                <Text className="text-xs text-red-500 ml-1 flex-1">Lock-IN state cannot be cancelled once started</Text>
              </View>
            )}

            <View className="flex-row flex-wrap gap-2 mt-3">
              {PLANNER_STATES.map(s => {
                const isSelected = selectedEntry?.stateId === s.id;
                const canSelect = !selectedEntry || canModifyEntry(selectedEntry) || selectedEntry.stateId !== s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => canSelect && handleSetState(s.id)}
                    disabled={!canSelect}
                    className={`px-3 py-2 rounded-xl flex-row items-center ${isSelected ? 'ring-2 ring-offset-1 ring-cyan-400' : ''}`}
                    style={{ backgroundColor: isDark ? s.darkColor + (isSelected ? '' : '80') : s.color + (isSelected ? '' : '40'), opacity: canSelect ? 1 : 0.5 }}
                  >
                    <Text className="text-xs font-semibold text-white">{s.icon} {s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedEntry && (
              <View className="mt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">Category Restrictions</Text>
                  <Tooltip text="Each state enforces time limits by app classification. Doomscroll-risk, social, and game apps get progressively tighter restrictions as state intensity increases.">
                    <Info size={14} color={isDark ? '#a1a1aa' : '#71717a'} />
                  </Tooltip>
                </View>
                <View className="mt-2">
                  {STATE_CATEGORY_RESTRICTIONS[selectedEntry.stateId].filter(r => r.maxDailyMinutes < 9999 || !r.allowed).map(r => (
                    <View key={r.category} className="flex-row items-center justify-between py-1.5 border-b border-border/40">
                      <View className="flex-row items-center flex-1">
                        <Text className="text-xs font-semibold text-foreground capitalize">{r.category}</Text>
                        <Tooltip text={r.tooltip}>
                          <Info size={11} color={isDark ? '#71717a' : '#a3a3a3'} className="ml-1" />
                        </Tooltip>
                      </View>
                      {!r.allowed ? (
                        <View className="bg-red-500/20 px-2 py-0.5 rounded-md"><Text className="text-[10px] font-bold text-red-500">BLOCKED</Text></View>
                      ) : (
                        <Text className="text-xs text-muted-foreground">{r.maxDailyMinutes}min / {r.maxSessions}x</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedEntry && (
              <TouchableOpacity onPress={handleRemoveDate} className="mt-3 flex-row items-center justify-center py-2 rounded-xl bg-zinc-800 dark:bg-zinc-200">
                <Trash2 size={14} color={isDark ? '#ef4444' : '#dc2626'} />
                <Text className="text-xs font-semibold text-red-500 ml-1">Remove Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View className="px-4 pt-4">
        <View className="bg-card rounded-2xl p-4 border border-border">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">Functional Balance</Text>
            <Tooltip text="Your balance score reflects how well your monthly plan balances focus, recovery, discipline, and flexibility. Focus = how intense your states are. Recovery = rest days. Discipline = locked-in commitment. Flexibility = room to customize apps.">
              <Info size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
            </Tooltip>
          </View>

          <View className="flex-row justify-around mt-4">
            <BalanceRing score={balance.overallScore} label="Overall" color="#06b6d4" />
            <BalanceRing score={balance.focusScore} label="Focus" color="#7c3aed" />
            <BalanceRing score={balance.recoveryScore} label="Recovery" color="#10b981" />
            <BalanceRing score={balance.disciplineScore} label="Discipline" color="#f59e0b" />
          </View>

          <View className="mt-3 h-2 rounded-full bg-zinc-800 dark:bg-zinc-200 overflow-hidden">
            <View className="h-full rounded-full" style={{ width: `${balance.overallScore}%`, backgroundColor: balance.overallScore >= 70 ? '#10b981' : balance.overallScore >= 40 ? '#f59e0b' : '#ef4444' }} />
          </View>
          <Text className="text-xs text-muted-foreground mt-1 text-center">
            {balance.overallScore >= 70 ? 'Well-balanced plan' : balance.overallScore >= 40 ? 'Consider more recovery days or focus days' : 'Your plan needs adjustment — see suggestions'}
          </Text>
        </View>
      </View>

      {balance.adjustmentsNeeded.length > 0 && (
        <View className="px-4 pt-3">
          <View className="bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-center mb-2">
              <ShieldAlert size={16} color="#f59e0b" />
              <Text className="text-sm font-bold text-foreground ml-2">Adjustments Needed</Text>
              <Tooltip text="These are apps whose average usage exceeds the time budget in a planned state. Adjust the state or customize the app override.">
                <Info size={14} color={isDark ? '#a1a1aa' : '#71717a'} className="ml-1" />
              </Tooltip>
            </View>
            {balance.adjustmentsNeeded.slice(0, 5).map((adj, i) => (
              <View key={i} className="flex-row items-start py-1.5 border-b border-border/40">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-foreground">{adj.appName}</Text>
                  <Text className="text-[10px] text-muted-foreground">{adj.reason}</Text>
                </View>
                <Text className={`text-[10px] font-bold ${adj.scoreImpact < 0 ? 'text-red-500' : 'text-green-500'}`}>{adj.scoreImpact > 0 ? '+' : ''}{adj.scoreImpact}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="px-4 pt-4">
        <View className="bg-card rounded-2xl p-4 border border-border">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-foreground">Recurring Patterns</Text>
            <TouchableOpacity onPress={() => setShowPatternModal(true)} className="bg-cyan-500 px-3 py-1.5 rounded-xl">
              <View className="flex-row items-center">
                <Plus size={14} color="#fff" />
                <Text className="text-xs font-bold text-white ml-1">Add</Text>
              </View>
            </TouchableOpacity>
          </View>

          {recurringPatterns.length === 0 && (
            <Text className="text-xs text-muted-foreground text-center py-4">No recurring patterns yet. Create one to auto-fill your calendar.</Text>
          )}

          {recurringPatterns.map(pattern => {
            const stateDef = PLANNER_STATES.find(s => s.id === pattern.stateId);
            const dayNames = pattern.daysOfWeek.map(d => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d]).join(', ');
            return (
              <View key={pattern.id} className="flex-row items-center justify-between py-2 border-b border-border/40">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: isDark ? stateDef?.darkColor : stateDef?.color }} />
                    <Text className="text-sm font-semibold text-foreground">{stateDef?.icon} {stateDef?.label}</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground mt-0.5">{dayNames}</Text>
                </View>
                <TouchableOpacity onPress={() => removeRecurringPattern(pattern.id)} className="p-2">
                  <Trash2 size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      <Modal visible={showPatternModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 border-t border-border" style={{ maxHeight: '80%', paddingBottom: Math.max(24, insets.bottom + 12) }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-foreground">New Recurring Pattern</Text>
              <TouchableOpacity onPress={() => setShowPatternModal(false)}><X size={20} color={isDark ? '#fff' : '#000'} /></TouchableOpacity>
            </View>

            <Text className="text-sm font-semibold text-foreground mb-2">Select State</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PLANNER_STATES.map(s => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setPatternStateId(s.id)}
                  className={`px-3 py-2 rounded-xl ${patternStateId === s.id ? 'ring-2 ring-cyan-400' : ''}`}
                  style={{ backgroundColor: isDark ? s.darkColor + '80' : s.color + '40' }}
                >
                  <Text className="text-xs font-semibold text-white">{s.icon} {s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-semibold text-foreground mb-2">Select Days</Text>
            <View className="flex-row justify-between mb-6">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setPatternDays(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i].sort())}
                  className={`w-10 h-10 rounded-full items-center justify-center ${patternDays.includes(i) ? 'bg-cyan-500' : 'bg-card border border-border'}`}
                >
                  <Text className={`text-xs font-bold ${patternDays.includes(i) ? 'text-white' : 'text-foreground'}`}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleAddPattern} className="bg-cyan-500 py-3 rounded-xl items-center">
              <Text className="text-sm font-bold text-white">Create Pattern</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </SafeAreaView>
  );
}