import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { X, Clock, Eye, AlertCircle } from 'lucide-react-native';
import { useSettingsStore } from '../store/settingsStore';
import { AppLimit } from '../types/usage';

interface AppLimitModalProps {
    isVisible: boolean;
    app: {
        packageName: string;
        appName: string;
    } | null;
    onClose: () => void;
}

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
    }, [app, perAppLimits]);

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

    if (!app) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-card rounded-t-3xl p-6 border-t border-border">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-xl font-bold text-foreground">{app.appName}</Text>
                            <Text className="text-xs text-muted-foreground">{app.packageName}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-muted rounded-full">
                            <X size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="flex-row items-center justify-between bg-muted/30 p-4 rounded-xl mb-6">
                            <View>
                                <Text className="text-sm font-semibold text-foreground">Enable Limits</Text>
                                <Text className="text-xs text-muted-foreground">Restrict usage for this app</Text>
                            </View>
                            <Switch
                                value={isEnabled}
                                onValueChange={setIsEnabled}
                                trackColor={{ false: '#3f3f46', true: '#06b6d4' }}
                            />
                        </View>

                        {isEnabled && (
                            <View className="space-y-6">
                                {/* Time Limit */}
                                <View>
                                    <View className="flex-row items-center gap-2 mb-3">
                                        <Clock size={16} color="#06b6d4" />
                                        <Text className="text-sm font-medium text-foreground">Daily Time Limit</Text>
                                    </View>
                                    <View className="flex-row items-center bg-muted/50 rounded-xl px-4 py-3">
                                        <TextInput
                                            className="flex-1 text-foreground font-bold text-lg"
                                            keyboardType="numeric"
                                            value={timeLimit}
                                            onChangeText={setTimeLimit}
                                            placeholder="60"
                                            placeholderTextColor="#666"
                                        />
                                        <Text className="text-muted-foreground ml-2">minutes</Text>
                                    </View>
                                </View>

                                {/* Visit Limit */}
                                <View>
                                    <View className="flex-row items-center gap-2 mb-3">
                                        <Eye size={16} color="#a855f7" />
                                        <Text className="text-sm font-medium text-foreground">Daily Visit Limit</Text>
                                    </View>
                                    <View className="flex-row items-center bg-muted/50 rounded-xl px-4 py-3">
                                        <TextInput
                                            className="flex-1 text-foreground font-bold text-lg"
                                            keyboardType="numeric"
                                            value={visitLimit}
                                            onChangeText={setVisitLimit}
                                            placeholder="10"
                                            placeholderTextColor="#666"
                                        />
                                        <Text className="text-muted-foreground ml-2">visits</Text>
                                    </View>
                                </View>

                                <View className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20 flex-row gap-3">
                                    <AlertCircle size={18} color="#06b6d4" />
                                    <Text className="text-xs text-cyan-600 flex-1 leading-4">
                                        When these limits are reached, Screen Guardian will automatically show an intervention screen.
                                    </Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-primary py-4 rounded-xl mt-8"
                        >
                            <Text className="text-center font-bold text-primary-foreground">Save Changes</Text>
                        </TouchableOpacity>

                        <View className="h-6" />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
