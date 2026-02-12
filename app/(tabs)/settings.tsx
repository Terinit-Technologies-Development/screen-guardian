import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { useSettingsStore } from '../../src/store/settingsStore';
import { formatTime } from '../../src/utils/formatters';
import { RotateCcw } from 'lucide-react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function SettingsScreen() {
    const {
        dailyScreenTimeLimit,
        setDailyLimit,
        cooldownDuration,
        setCooldownDuration,
        maxExtensions,
        setMaxExtensions,
        exerciseDifficulty,
        setExerciseDifficulty,
        monitoringEnabled,
        toggleMonitoring,
        notificationsEnabled,
        toggleNotifications,
        resetSettings,
    } = useSettingsStore();

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="p-4 space-y-4">
                <StyledText className="text-2xl font-bold text-foreground mb-4">Settings</StyledText>

                {/* Screen Time Limit Section */}
                <StyledView className="bg-card border border-border rounded-xl p-4">
                    <StyledText className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Daily Limit</StyledText>
                    <StyledView className="flex-row justify-between items-center mb-4">
                        <StyledText className="text-sm text-muted-foreground">Limit</StyledText>
                        <StyledText className="text-lg font-bold text-cyan-500">{formatTime(dailyScreenTimeLimit)}</StyledText>
                    </StyledView>
                    {/* Slider replacement - Simple buttons for now as RN slider needs extra dep or custom implementation */}
                    <StyledView className="flex-row gap-2">
                        {[3600, 7200, 10800, 14400, 18000].map((val) => (
                            <TouchableOpacity
                                key={val}
                                onPress={() => setDailyLimit(val)}
                                className={`flex-1 py-1 rounded-md items-center border ${dailyScreenTimeLimit === val ? 'bg-cyan-500 border-cyan-500' : 'bg-muted border-border'}`}
                            >
                                <StyledText className={`text-[10px] ${dailyScreenTimeLimit === val ? 'text-white' : 'text-muted-foreground'}`}>
                                    {val / 3600}h
                                </StyledText>
                            </TouchableOpacity>
                        ))}
                    </StyledView>
                </StyledView>

                {/* Toggles */}
                <StyledView className="bg-card border border-border rounded-xl overflow-hidden">
                    <StyledView className="flex-row items-center justify-between p-4 border-b border-border">
                        <StyledView>
                            <StyledText className="text-sm font-medium text-foreground">Monitoring</StyledText>
                            <StyledText className="text-xs text-muted-foreground">Track app usage</StyledText>
                        </StyledView>
                        <Switch
                            value={monitoringEnabled}
                            onValueChange={toggleMonitoring}
                            trackColor={{ false: "#3f3f46", true: "#06b6d4" }}
                        />
                    </StyledView>
                    <StyledView className="flex-row items-center justify-between p-4">
                        <StyledView>
                            <StyledText className="text-sm font-medium text-foreground">Notifications</StyledText>
                            <StyledText className="text-xs text-muted-foreground">Limit alerts</StyledText>
                        </StyledView>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: "#3f3f46", true: "#06b6d4" }}
                        />
                    </StyledView>
                </StyledView>

                {/* Exercise Difficulty */}
                <StyledView className="bg-card border border-border rounded-xl p-4">
                    <StyledText className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Exercise Difficulty</StyledText>
                    <StyledView className="flex-row gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((d) => (
                            <TouchableOpacity
                                key={d}
                                onPress={() => setExerciseDifficulty(d)}
                                className={`flex-1 py-2 rounded-lg items-center border ${exerciseDifficulty === d ? 'bg-primary border-primary' : 'bg-muted border-border'}`}
                            >
                                <StyledText className={`capitalize text-xs font-medium ${exerciseDifficulty === d ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                    {d}
                                </StyledText>
                            </TouchableOpacity>
                        ))}
                    </StyledView>
                </StyledView>

                {/* Reset All */}
                <TouchableOpacity
                    onPress={resetSettings}
                    className="flex-row items-center justify-center gap-2 p-4 rounded-xl border border-red-500/20 bg-red-500/5 mt-4"
                >
                    <RotateCcw size={16} color="#ef4444" />
                    <StyledText className="text-red-500 font-medium text-sm">Reset All Settings</StyledText>
                </TouchableOpacity>

                <StyledText className="text-[10px] text-center text-muted-foreground font-mono uppercase tracking-widest mt-4">
                    v1.0.0
                </StyledText>
            </ScrollView>
        </SafeAreaView>
    );
}
