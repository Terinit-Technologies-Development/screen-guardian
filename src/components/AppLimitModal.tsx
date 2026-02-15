import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Switch, ScrollView, Dimensions, Pressable } from 'react-native';
import { X, Clock, Eye, AlertCircle, Trash2, ChevronRight, Sparkles } from 'lucide-react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSettingsStore } from '../store/settingsStore';

interface AppLimitModalProps {
    isVisible: boolean;
    app: {
        packageName: string;
        appName: string;
    } | null;
    onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AppLimitModal = ({ isVisible, app, onClose }: AppLimitModalProps) => {
    const { perAppLimits, setAppLimit, removeAppLimit } = useSettingsStore();
    const [isEnabled, setIsEnabled] = useState(false);
    const [timeLimit, setTimeLimit] = useState('60');
    const [visitLimit, setVisitLimit] = useState('10');

    useEffect(() => {
        if (app && perAppLimits[app.packageName]) {
            const limit = perAppLimits[app.packageName];
            setIsEnabled(true);
            setTimeLimit((limit.maxTimeMinutes || 60).toString());
            setVisitLimit((limit.maxVisits || 10).toString());
        } else {
            setIsEnabled(false);
            setTimeLimit('60');
            setVisitLimit('10');
        }
    }, [app, isVisible]); // Reset when app changes or modal opens

    const handleSave = () => {
        if (!app) return;

        if (isEnabled) {
            setAppLimit(app.packageName, {
                appId: app.packageName,
                appName: app.appName,
                maxTimeMinutes: parseInt(timeLimit) || 60,
                maxVisits: parseInt(visitLimit) || 10,
                category: 'Other',
                isWhitelisted: false
            });
        } else {
            removeAppLimit(app.packageName);
        }
        onClose();
    };

    if (!app && !isVisible) return null;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end">
                {/* Backdrop */}
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(200)}
                    className="absolute inset-0 bg-black/70"
                >
                    <Pressable className="flex-1" onPress={onClose} />
                </Animated.View>

                {/* Content Container */}
                <Animated.View
                    entering={SlideInDown.springify().damping(20).stiffness(100)}
                    exiting={SlideOutDown.duration(250)}
                    className="bg-white rounded-t-[40px] px-6 pt-2 pb-10 shadow-2xl"
                    style={{ maxHeight: SCREEN_HEIGHT * 0.85 }}
                >
                    {/* Handle */}
                    <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mt-3 mb-6" />

                    <View className="flex-row justify-between items-start mb-8">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900 mb-1" numberOfLines={1}>
                                {app?.appName || 'App Settings'}
                            </Text>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                {app?.packageName || ''}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center border border-gray-200"
                        >
                            <X size={20} color="#000" opacity={0.6} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
                        {/* Status Card */}
                        <View className={`p-5 rounded-3xl mb-8 flex-row items-center justify-between border ${isEnabled ? 'bg-cyan-50 border-cyan-100' : 'bg-gray-50 border-gray-100'}`}>
                            <View className="flex-row items-center gap-4">
                                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isEnabled ? 'bg-cyan-100' : 'bg-gray-200/50'}`}>
                                    <Sparkles size={24} color={isEnabled ? '#0891b2' : '#666'} />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-gray-900">Active Limits</Text>
                                    <Text className="text-xs text-gray-500 font-medium">
                                        {isEnabled ? 'Monitoring enabled' : 'Limits are paused'}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={isEnabled}
                                onValueChange={setIsEnabled}
                                trackColor={{ false: '#d1d5db', true: '#22d3ee' }}
                                thumbColor="#FFF"
                            />
                        </View>

                        {isEnabled ? (
                            <Animated.View entering={FadeIn.delay(100)} className="space-y-8">
                                {/* Time Limit Section */}
                                <View>
                                    <View className="flex-row items-center justify-between mb-4">
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-8 h-8 rounded-lg bg-cyan-100 items-center justify-center">
                                                <Clock size={16} color="#0891b2" />
                                            </View>
                                            <Text className="text-base font-bold text-gray-800">Time Budget</Text>
                                        </View>
                                        <Text className="text-cyan-600 font-bold">{timeLimit}m</Text>
                                    </View>

                                    <View className="bg-gray-50 rounded-2xl p-1 border border-gray-100 flex-row items-center">
                                        <TextInput
                                            className="flex-1 text-gray-900 font-bold text-lg px-4 py-3"
                                            keyboardType="numeric"
                                            value={timeLimit}
                                            onChangeText={setTimeLimit}
                                            placeholder="60"
                                            placeholderTextColor="#9ca3af"
                                            selectionColor="#22d3ee"
                                        />
                                        <View className="bg-white/80 px-4 py-3 rounded-xl mr-1 shadow-sm border border-gray-100">
                                            <Text className="text-gray-500 font-bold">min/day</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Visit Limit Section */}
                                <View>
                                    <View className="flex-row items-center justify-between mb-4">
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-8 h-8 rounded-lg bg-purple-100 items-center justify-center">
                                                <Eye size={16} color="#7c3aed" />
                                            </View>
                                            <Text className="text-base font-bold text-gray-800">Access Limit</Text>
                                        </View>
                                        <Text className="text-purple-600 font-bold">{visitLimit}x</Text>
                                    </View>

                                    <View className="bg-gray-50 rounded-2xl p-1 border border-gray-100 flex-row items-center">
                                        <TextInput
                                            className="flex-1 text-gray-900 font-bold text-lg px-4 py-3"
                                            keyboardType="numeric"
                                            value={visitLimit}
                                            onChangeText={setVisitLimit}
                                            placeholder="10"
                                            placeholderTextColor="#9ca3af"
                                            selectionColor="#c084fc"
                                        />
                                        <View className="bg-white/80 px-4 py-3 rounded-xl mr-1 shadow-sm border border-gray-100">
                                            <Text className="text-gray-500 font-bold">visits/day</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Warning Box */}
                                <View className="bg-orange-50 p-5 rounded-3xl border border-orange-100 flex-row gap-4">
                                    <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                                        <AlertCircle size={20} color="#ea580c" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-orange-900 font-bold text-sm mb-1">Impact</Text>
                                        <Text className="text-orange-800/60 text-xs leading-5 font-medium">
                                            Once limits are hit, Screen Guardian will intercept and show a cognitive exercise to help you refocus.
                                        </Text>
                                    </View>
                                </View>
                            </Animated.View>
                        ) : (
                            <View className="py-12 items-center opacity-40">
                                <AlertCircle size={48} color="#94a3b8" />
                                <Text className="text-gray-600 text-center mt-4 font-bold px-10">
                                    Enable limits to start managing screen time for this application.
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer Actions */}
                    <View className="flex-row gap-4">
                        {isEnabled && app && (
                            <TouchableOpacity
                                onPress={() => {
                                    removeAppLimit(app.packageName);
                                    onClose();
                                }}
                                className="w-14 h-14 bg-red-50 rounded-2xl items-center justify-center border border-red-100"
                            >
                                <Trash2 size={24} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={handleSave}
                            className={`flex-1 h-14 rounded-2xl items-center justify-center shadow-lg ${isEnabled ? 'bg-cyan-500 shadow-cyan-200' : 'bg-gray-100'}`}
                        >
                            <Text className={`font-bold text-lg ${isEnabled ? 'text-white' : 'text-gray-400'}`}>
                                {isEnabled ? 'Apply Budget' : 'Close'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};
