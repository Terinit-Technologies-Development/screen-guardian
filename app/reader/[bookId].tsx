import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import Pdf from 'react-native-pdf';
import { ChevronLeft } from 'lucide-react-native';
import { useReadingStore } from '../../src/store/readingStore';

export default function BookReaderScreen() {
    const { bookId } = useLocalSearchParams<{ bookId: string }>();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { books, updateBookPage, recordReadingSession } = useReadingStore();
    const book = books.find(item => item.id === bookId);

    const [currentPage, setCurrentPage] = useState(book?.currentPage ?? 1);
    const [pageCount, setPageCount] = useState(book?.totalPages ?? 0);
    const [error, setError] = useState<string | null>(null);

    const startPageRef = useRef(book?.currentPage ?? 1);
    const currentPageRef = useRef(book?.currentPage ?? 1);
    const pageCountRef = useRef(book?.totalPages ?? 0);
    const activeStartedAtRef = useRef<number | null>(Date.now());
    const accumulatedMsRef = useRef(0);
    const finalizedRef = useRef(false);

    const pauseTimer = () => {
        if (activeStartedAtRef.current) {
            accumulatedMsRef.current += Date.now() - activeStartedAtRef.current;
            activeStartedAtRef.current = null;
        }
    };

    const resumeTimer = () => {
        if (!activeStartedAtRef.current) {
            activeStartedAtRef.current = Date.now();
        }
    };

    const finalizeSession = async () => {
        if (!book || finalizedRef.current) return;
        finalizedRef.current = true;
        pauseTimer();

        const durationSeconds = Math.floor(accumulatedMsRef.current / 1000);
        await updateBookPage(book.id, currentPageRef.current, pageCountRef.current || undefined);
        await recordReadingSession(book.id, startPageRef.current, currentPageRef.current, durationSeconds);
    };

    useEffect(() => {
        if (!book) return;

        const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
            if (state === 'active') resumeTimer();
            else pauseTimer();
        });

        return () => {
            subscription.remove();
            finalizeSession();
        };
    }, [book?.id]);

    if (!book) {
        return (
            <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? 'bg-neutral-950' : 'bg-white'}`}>
                <Text className={isDark ? 'text-white' : 'text-neutral-900'}>Book not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-3 rounded-xl bg-cyan-500">
                    <Text className="text-white font-bold">Go back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-100'}`} edges={['top']}>
            <View className={`px-4 py-3 flex-row items-center gap-3 ${isDark ? 'bg-neutral-950' : 'bg-white'} border-b ${isDark ? 'border-neutral-900' : 'border-neutral-200'}`}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 items-center justify-center">
                    <ChevronLeft size={22} color={isDark ? '#fff' : '#111'} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className={`text-sm font-black ${isDark ? 'text-white' : 'text-neutral-900'}`} numberOfLines={1}>
                        {book.title}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Page {currentPage}{pageCount ? ` of ${pageCount}` : ''}
                    </Text>
                </View>
            </View>

            {error ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className={`text-center font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Unable to open PDF</Text>
                    <Text className={`text-center mt-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{error}</Text>
                </View>
            ) : (
                <Pdf
                    source={{ uri: book.localUri }}
                    page={Math.max(1, book.currentPage)}
                    horizontal
                    enablePaging
                    spacing={8}
                    onLoadComplete={(totalPages) => {
                        pageCountRef.current = totalPages;
                        setPageCount(totalPages);
                        updateBookPage(book.id, currentPageRef.current, totalPages);
                    }}
                    onPageChanged={(page, totalPages) => {
                        currentPageRef.current = page;
                        pageCountRef.current = totalPages;
                        setCurrentPage(page);
                        setPageCount(totalPages);
                        updateBookPage(book.id, page, totalPages);
                    }}
                    onError={(pdfError) => setError(String(pdfError))}
                    style={{ flex: 1, backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }}
                />
            )}
        </SafeAreaView>
    );
}
