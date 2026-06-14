import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { BookOpen, Plus, Trash2 } from 'lucide-react-native';
import { useReadingStore } from '../../src/store/readingStore';

export default function ReadingScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { books, importBook, removeBook, isLoading } = useReadingStore();

    const handleImport = async () => {
        try {
            await importBook();
        } catch (error: any) {
            Alert.alert('Import failed', error?.message ?? 'Unable to import this PDF.');
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`} edges={['top']}>
            <View className={`px-6 pt-6 pb-4 flex-row justify-between items-center ${isDark ? 'bg-neutral-950' : 'bg-white'} border-b ${isDark ? 'border-neutral-900' : 'border-neutral-200'}`}>
                <View>
                    <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>Reading</Text>
                    <Text className={`text-sm font-semibold mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                        Books, pages, and active reading time
                    </Text>
                </View>
                <TouchableOpacity onPress={handleImport} className="w-10 h-10 rounded-full bg-cyan-500 items-center justify-center">
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 96 }}>
                {books.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <View className={`w-16 h-16 rounded-full ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} items-center justify-center mb-4`}>
                            <BookOpen size={28} color={isDark ? '#404040' : '#d4d4d4'} />
                        </View>
                        <Text className={`text-lg font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>No books yet</Text>
                        <Text className={`text-sm text-center mt-2 px-8 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Tap + to upload a PDF and start tracking pages read automatically.
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {books.map(book => {
                            const progress = book.totalPages > 0 ? Math.min(100, (book.currentPage / book.totalPages) * 100) : 0;
                            return (
                                <TouchableOpacity
                                    key={book.id}
                                    onPress={() => router.push({ pathname: '/reader/[bookId]', params: { bookId: book.id } } as any)}
                                    activeOpacity={0.75}
                                    className={`p-4 rounded-2xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <View className="w-12 h-12 rounded-2xl bg-cyan-500/10 items-center justify-center">
                                            <BookOpen size={22} color="#06b6d4" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`text-base font-black ${isDark ? 'text-white' : 'text-neutral-900'}`} numberOfLines={1}>
                                                {book.title}
                                            </Text>
                                            <Text className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                                Page {book.currentPage}{book.totalPages ? ` of ${book.totalPages}` : ''}
                                            </Text>
                                            <View className={`h-1.5 rounded-full mt-3 overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                                                <View className="h-full bg-cyan-500" style={{ width: `${Math.max(2, progress)}%` }} />
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                removeBook(book.id);
                                            }}
                                            className="w-9 h-9 rounded-xl bg-red-500/10 items-center justify-center"
                                        >
                                            <Trash2 size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
