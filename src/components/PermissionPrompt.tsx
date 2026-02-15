import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePermissionStore } from '../store/usePermissionStore';
import { Shield, Smartphone, Eye, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const PermissionPrompt: React.FC = () => {
    const { status, requestUsageStats, requestOverlay, requestAccessibility, checkAllPermissions } = usePermissionStore();

    const allGranted = status.usageStats && status.overlay && status.accessibility;

    if (allGranted) return null;

    const permissions = [
        {
            id: 'usage',
            name: 'Usage Access',
            description: 'Track time spent in apps',
            icon: Smartphone,
            granted: status.usageStats,
            action: requestUsageStats,
            color: '#06b6d4'
        },
        {
            id: 'overlay',
            name: 'Overlay Permission',
            description: 'Show protection screens',
            icon: Shield,
            granted: status.overlay,
            action: requestOverlay,
            color: '#a855f7'
        },
        {
            id: 'accessibility',
            name: 'Accessibility Service',
            description: 'Real-time monitoring',
            icon: Eye,
            granted: status.accessibility,
            action: requestAccessibility,
            color: '#22c55e'
        }
    ];

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="bg-amber-500/5 border border-amber-500/20 rounded-[32px] p-6 overflow-hidden"
        >
            <View className="flex-row items-center gap-4 mb-6">
                <View className="w-12 h-12 bg-amber-500/10 rounded-2xl items-center justify-center border border-amber-500/20">
                    <AlertCircle size={24} color="#f59e0b" />
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">Initial Setup</Text>
                    <Text className="text-xs text-muted-foreground font-medium">Some features are restricted</Text>
                </View>
            </View>

            <View className="gap-3">
                {permissions.map((p) => (
                    <TouchableOpacity
                        key={p.id}
                        onPress={p.granted ? undefined : p.action}
                        disabled={p.granted}
                        activeOpacity={0.7}
                        className={`flex-row items-center justify-between p-4 rounded-[22px] border ${p.granted ? 'bg-muted/20 border-border/40' : 'bg-card border-border/60 shadow-sm'}`}
                    >
                        <View className="flex-row items-center gap-4 flex-1">
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center border"
                                style={{
                                    backgroundColor: p.granted ? 'transparent' : `${p.color}15`,
                                    borderColor: p.granted ? '#3f3f4620' : `${p.color}20`
                                }}
                            >
                                <p.icon
                                    size={20}
                                    color={p.granted ? '#71717a' : p.color}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`text-sm font-bold ${p.granted ? 'text-muted-foreground/60' : 'text-foreground'}`}>
                                    {p.name}
                                </Text>
                                <Text className="text-[10px] text-muted-foreground font-medium" numberOfLines={1}>
                                    {p.granted ? 'Permission granted' : p.description}
                                </Text>
                            </View>
                        </View>

                        {p.granted ? (
                            <View className="w-6 h-6 bg-green-500/20 rounded-full items-center justify-center">
                                <CheckCircle2 size={14} color="#22c55e" />
                            </View>
                        ) : (
                            <View className="bg-primary/10 w-8 h-8 rounded-full items-center justify-center border border-primary/20">
                                <ChevronRight size={16} color="#06b6d4" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                onPress={checkAllPermissions}
                activeOpacity={0.6}
                className="mt-6 py-4 items-center bg-white/5 rounded-2xl border border-white/5"
            >
                <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verify Permissions</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};
