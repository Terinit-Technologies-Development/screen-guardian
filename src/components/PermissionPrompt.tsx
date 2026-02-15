import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { usePermissionStore } from '../store/usePermissionStore';
import { Shield, Smartphone, Eye, Bell, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react-native';

export const PermissionPrompt: React.FC = () => {
    const { status, requestUsageStats, requestOverlay, requestAccessibility, checkAllPermissions } = usePermissionStore();

    const allGranted = status.usageStats && status.overlay && status.accessibility;

    if (allGranted) return null;

    const permissions = [
        {
            id: 'usage',
            name: 'Usage Access',
            description: 'Required to track how long you spend in each app.',
            icon: Smartphone,
            granted: status.usageStats,
            action: requestUsageStats,
            color: '#06b6d4'
        },
        {
            id: 'overlay',
            name: 'Overlay Permission',
            description: 'Allows Screen Guardian to show a block screen over other apps.',
            icon: Shield,
            granted: status.overlay,
            action: requestOverlay,
            color: '#a855f7'
        },
        {
            id: 'accessibility',
            name: 'Accessibility Service',
            description: 'Enables more robust, real-time app intervention and monitoring.',
            icon: Eye,
            granted: status.accessibility,
            action: requestAccessibility,
            color: '#22c55e'
        }
    ];

    return (
        <View className="bg-card border border-amber-500/20 rounded-2xl p-5 mb-6 overflow-hidden">
            <View className="flex-row items-center gap-3 mb-4">
                <View className="p-2 bg-amber-500/10 rounded-lg">
                    <AlertTriangle size={20} color="#f59e0b" />
                </View>
                <View>
                    <Text className="text-lg font-bold text-foreground">Setup Required</Text>
                    <Text className="text-xs text-muted-foreground">Grant permissions to enable protection</Text>
                </View>
            </View>

            <View className="space-y-4">
                {permissions.map((p) => (
                    <TouchableOpacity
                        key={p.id}
                        onPress={p.granted ? undefined : p.action}
                        disabled={p.granted}
                        className={`flex-row items-center justify-between p-4 rounded-xl border ${p.granted ? 'bg-muted/30 border-border opacity-60' : 'bg-background border-border shadow-sm'}`}
                    >
                        <View className="flex-row items-center gap-4 flex-1">
                            <View
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: p.granted ? '#3f3f4620' : `${p.color}15` }}
                            >
                                <p.icon
                                    size={20}
                                    color={p.granted ? '#71717a' : p.color}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`text-sm font-bold ${p.granted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {p.name}
                                </Text>
                                <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={2}>
                                    {p.description}
                                </Text>
                            </View>
                        </View>

                        {p.granted ? (
                            <CheckCircle2 size={20} color="#22c55e" />
                        ) : (
                            <View className="bg-primary/10 p-1.5 rounded-full">
                                <ChevronRight size={16} color="#06b6d4" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                onPress={checkAllPermissions}
                className="mt-6 py-3 items-center"
            >
                <Text className="text-xs text-muted-foreground underline">Already granted? Tap to verify</Text>
            </TouchableOpacity>
        </View>
    );
};
