import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { useFocusStore } from '../store/focusStore';
import { X, Play, Clock, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { formatTime } from '../utils/formatters';

const { width, height } = Dimensions.get('window');

interface DeepFocusModalProps {
    visible: boolean;
    onClose: () => void;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function DeepFocusModal({ visible, onClose }: DeepFocusModalProps) {
    const { isActive, startTime, endTime, durationMinutes, startFocus, stopFocus } = useFocusStore();
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && endTime) {
            interval = setInterval(() => {
                const remaining = Math.max(0, endTime - Date.now());
                setTimeLeft(remaining);
                if (remaining <= 0) {
                    stopFocus();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, endTime]);

    const handleStart = async () => {
        await startFocus(selectedDuration);
    };

    const handleStop = async () => {
        await stopFocus();
    };

    const formatCountdown = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 justify-end sm:justify-center p-4">
                <Animated.View
                    entering={SlideInDown.springify().damping(15)}
                    className="bg-card w-full max-w-sm mx-auto rounded-[32px] overflow-hidden border border-border/50"
                >
                    {/* Header */}
                    <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-indigo-500/10 rounded-full items-center justify-center">
                                <Shield size={20} color="#6366f1" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-foreground">Deep Focus</Text>
                                <Text className="text-xs text-muted-foreground font-medium">Distraction-free mode</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 bg-muted items-center justify-center rounded-full"
                        >
                            <X size={16} color="#999" />
                        </TouchableOpacity>
                    </View>

                    <View className="p-6">
                        {!isActive ? (
                            // INACTIVE STATE: SELECTION
                            <View className="gap-6">
                                <Text className="text-muted-foreground text-sm leading-5">
                                    Maximize your productivity by blocking all distracting apps for a set duration. Only essential apps will remain accessible.
                                </Text>

                                <View>
                                    <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Duration (Minutes)</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {DURATIONS.map(dur => (
                                            <TouchableOpacity
                                                key={dur}
                                                onPress={() => setSelectedDuration(dur)}
                                                className={`px-4 py-3 rounded-2xl border ${selectedDuration === dur
                                                        ? 'bg-indigo-500 border-indigo-500'
                                                        : 'bg-muted/50 border-transparent'
                                                    }`}
                                            >
                                                <Text className={`font-bold ${selectedDuration === dur ? 'text-white' : 'text-foreground'
                                                    }`}>{dur}m</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleStart}
                                    className="bg-indigo-500 h-14 rounded-[20px] flex-row items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                >
                                    <Play size={20} color="white" fill="white" />
                                    <Text className="text-white font-bold text-lg">Start Focus Session</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // ACTIVE STATE: COUNTDOWN
                            <View className="items-center py-8">
                                <Animated.View
                                    entering={ZoomIn}
                                    className="w-48 h-48 rounded-full border-4 border-indigo-500/20 items-center justify-center mb-8 relative"
                                >
                                    <View className="absolute inset-0 items-center justify-center opacity-10">
                                        <Shield size={100} color="#6366f1" />
                                    </View>
                                    <Text className="text-5xl font-black text-foreground font-mono">
                                        {formatCountdown(timeLeft)}
                                    </Text>
                                    <Text className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">Active</Text>
                                </Animated.View>

                                <Text className="text-center text-muted-foreground max-w-[250px] mb-8">
                                    You are in Deep Focus mode. Distractions are blocked.
                                </Text>

                                <TouchableOpacity
                                    onPress={handleStop}
                                    className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-xl flex-row items-center gap-2"
                                >
                                    <AlertTriangle size={16} color="#ef4444" />
                                    <Text className="text-red-500 font-bold">End Session Early</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
