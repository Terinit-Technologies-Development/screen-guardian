import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useWorkStore } from '../../src/store/workStore';
import { Play, Square, Briefcase, Clock, FileText } from 'lucide-react-native';
import { format } from 'date-fns';
import { PerceivedEffect } from '../../src/types/work';

export default function WorkScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const { activeSession, history, startSession, stopSession } = useWorkStore();
    
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    
    // Timer state for active session
    const [elapsedTime, setElapsedTime] = useState(0);
    
    // Finish session state
    const [isFinishing, setIsFinishing] = useState(false);
    const [effect, setEffect] = useState<PerceivedEffect>('neutral');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeSession) {
            // Update immediately
            setElapsedTime(Math.floor((Date.now() - activeSession.startTime) / 1000));
            
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - activeSession.startTime) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? `${h}:` : ''}${h > 0 ? m.toString().padStart(2, '0') : m}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (!title.trim()) return;
        startSession(title.trim(), category.trim() || undefined);
        setTitle('');
        setCategory('');
    };

    const handleStop = () => {
        setIsFinishing(true);
    };

    const confirmStop = () => {
        stopSession(effect, notes.trim());
        setIsFinishing(false);
        setEffect('neutral');
        setNotes('');
    };

    const getEffectColor = (eff?: PerceivedEffect) => {
        switch(eff) {
            case 'positive': return 'text-emerald-500';
            case 'negative': return 'text-red-500';
            default: return isDark ? 'text-neutral-400' : 'text-neutral-500';
        }
    };

    const getEffectEmoji = (eff?: PerceivedEffect) => {
        switch(eff) {
            case 'positive': return '🟢';
            case 'negative': return '🔴';
            default: return '🟡';
        }
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
            <View className={`px-6 pt-14 pb-4 ${isDark ? 'bg-neutral-950' : 'bg-white'} border-b ${isDark ? 'border-neutral-900' : 'border-neutral-200'}`}>
                <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Work</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-6">
                
                {/* Active Session OR Start Form */}
                {activeSession ? (
                    <View className={`p-6 rounded-2xl mb-8 items-center border ${isDark ? 'bg-cyan-900/20 border-cyan-900/50' : 'bg-cyan-50 border-cyan-200'}`}>
                        <View className="absolute top-4 right-4 bg-cyan-500/20 px-2 py-1 rounded-md">
                            <Text className="text-cyan-600 text-xs font-bold uppercase tracking-widest">In Progress</Text>
                        </View>
                        <Text className={`text-2xl font-bold mt-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>{activeSession.title}</Text>
                        {activeSession.category && (
                            <Text className={`text-sm font-semibold mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{activeSession.category}</Text>
                        )}
                        
                        <Text className={`text-6xl font-black my-8 tracking-tighter ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                            {formatTime(elapsedTime)}
                        </Text>

                        {isFinishing ? (
                            <View className={`w-full p-4 rounded-xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                                <Text className={`text-center font-bold mb-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>How was this session?</Text>
                                <View className="flex-row justify-between space-x-2 mb-4">
                                    <TouchableOpacity onPress={() => setEffect('negative')} className={`flex-1 py-2 rounded-lg border ${effect === 'negative' ? 'bg-red-500/20 border-red-500' : (isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300')}`}>
                                        <Text className="text-center text-lg">🔴</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setEffect('neutral')} className={`flex-1 py-2 rounded-lg border ${effect === 'neutral' ? 'bg-yellow-500/20 border-yellow-500' : (isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300')}`}>
                                        <Text className="text-center text-lg">🟡</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setEffect('positive')} className={`flex-1 py-2 rounded-lg border ${effect === 'positive' ? 'bg-emerald-500/20 border-emerald-500' : (isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300')}`}>
                                        <Text className="text-center text-lg">🟢</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Add notes... (optional)"
                                    placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                                    className={`p-3 rounded-lg mb-4 text-sm ${isDark ? 'bg-neutral-950 text-white border-neutral-800' : 'bg-neutral-50 text-neutral-900 border-neutral-200'} border`}
                                />
                                <TouchableOpacity onPress={confirmStop} className="bg-cyan-500 py-3 rounded-xl flex-row justify-center items-center">
                                    <Square size={18} color="#fff" fill="#fff" />
                                    <Text className="text-white font-bold ml-2">Log Session</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                onPress={handleStop}
                                className={`flex-row items-center justify-center px-8 py-4 rounded-full border ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-300'}`}
                            >
                                <Square size={20} color={isDark ? '#fff' : '#000'} fill={isDark ? '#fff' : '#000'} />
                                <Text className={`font-bold text-lg ml-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Finish Work</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View className={`p-6 rounded-2xl mb-8 border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                        <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Start a Session</Text>
                        
                        <View className="mb-4">
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="What are you working on?"
                                placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                                className={`p-4 rounded-xl text-base font-semibold ${isDark ? 'bg-neutral-950 text-white border-neutral-800' : 'bg-neutral-50 text-neutral-900 border-neutral-200'} border`}
                            />
                        </View>
                        <View className="mb-6">
                            <TextInput
                                value={category}
                                onChangeText={setCategory}
                                placeholder="Category (e.g. Coding, Reading)"
                                placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                                className={`p-4 rounded-xl text-sm ${isDark ? 'bg-neutral-950 text-white border-neutral-800' : 'bg-neutral-50 text-neutral-900 border-neutral-200'} border`}
                            />
                        </View>

                        <TouchableOpacity 
                            onPress={handleStart}
                            disabled={!title.trim()}
                            className={`flex-row items-center justify-center py-4 rounded-xl ${!title.trim() ? (isDark ? 'bg-neutral-800' : 'bg-neutral-200') : 'bg-cyan-500'}`}
                        >
                            <Play size={20} color={!title.trim() ? (isDark ? '#525252' : '#a3a3a3') : '#fff'} fill={!title.trim() ? 'none' : '#fff'} />
                            <Text className={`font-bold text-lg ml-2 ${!title.trim() ? (isDark ? 'text-neutral-500' : 'text-neutral-400') : 'text-white'}`}>Start Timer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* History List */}
                <Text className={`text-xs font-bold uppercase tracking-wider mb-4 ml-2 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Recent Sessions</Text>
                
                {history.length === 0 ? (
                    <View className="items-center py-10">
                        <Briefcase size={32} color={isDark ? '#262626' : '#e5e5e5'} />
                        <Text className={`text-sm mt-3 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>No work sessions logged yet.</Text>
                    </View>
                ) : (
                    history.map(session => (
                        <View key={session.id} className={`p-4 mb-3 rounded-xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1 pr-4">
                                    <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{session.title}</Text>
                                    <View className="flex-row items-center mt-1 space-x-3">
                                        <Text className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                            {format(session.startTime, 'MMM do, h:mm a')}
                                        </Text>
                                        {session.category && (
                                            <Text className={`text-xs font-semibold ${isDark ? 'text-cyan-600' : 'text-cyan-500'}`}>• {session.category}</Text>
                                        )}
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className={`text-lg font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                        {Math.round((session.durationSeconds || 0) / 60)}m
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className={`text-xs font-bold mr-1 ${getEffectColor(session.perceivedEffect)}`}>
                                            {getEffectEmoji(session.perceivedEffect)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {session.description && (
                                <View className={`mt-3 pt-3 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-100'} flex-row items-start`}>
                                    <FileText size={14} color={isDark ? '#525252' : '#a3a3a3'} className="mt-0.5 mr-2" />
                                    <Text className={`text-sm flex-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{session.description}</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
                
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}
