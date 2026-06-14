import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { ReadingBook, ReadingDailyLog, ReadingSession } from '../types/reading';
import { useHabitStore } from './habitStore';
import { queueAchievementEvaluation } from '../services/achievementEvaluationService';

const BOOK_DIR = `${FileSystem.documentDirectory ?? ''}books/`;

async function ensureBookDir() {
    if (!FileSystem.documentDirectory) throw new Error('Local document storage is unavailable');
    const info = await FileSystem.getInfoAsync(BOOK_DIR);
    if (!info.exists) {
        await FileSystem.makeDirectoryAsync(BOOK_DIR, { intermediates: true });
    }
}

interface ReadingState {
    books: ReadingBook[];
    sessions: ReadingSession[];
    dailyLogs: Record<string, ReadingDailyLog>;
    isLoading: boolean;
    importBook: () => Promise<void>;
    updateBookPage: (bookId: string, page: number, totalPages?: number) => Promise<void>;
    recordReadingSession: (bookId: string, startPage: number, endPage: number, durationSeconds: number) => Promise<void>;
    removeBook: (bookId: string) => Promise<void>;
    loadFromCloud: () => Promise<void>;
}

export const useReadingStore = create<ReadingState>()(
    persist(
        (set, get) => ({
            books: [],
            sessions: [],
            dailyLogs: {},
            isLoading: false,

            importBook: async () => {
                const result = await DocumentPicker.getDocumentAsync({
                    type: 'application/pdf',
                    copyToCacheDirectory: true,
                    multiple: false,
                });

                if (result.canceled || !result.assets?.[0]) return;

                await ensureBookDir();

                const asset = result.assets[0];
                const id = Crypto.randomUUID();
                const fileName = asset.name || `${id}.pdf`;
                const localUri = `${BOOK_DIR}${id}.pdf`;

                await FileSystem.copyAsync({ from: asset.uri, to: localUri });

                const now = Date.now();
                const title = fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim() || 'Untitled Book';
                const book: ReadingBook = {
                    id,
                    title,
                    fileName,
                    localUri,
                    totalPages: 0,
                    currentPage: 1,
                    status: 'reading',
                    importedAt: now,
                    updatedAt: now,
                };

                set(state => ({ books: [book, ...state.books] }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('reading_books').insert({
                            id: book.id,
                            user_id: session.user.id,
                            title: book.title,
                            file_name: book.fileName,
                            local_uri: book.localUri,
                            total_pages: book.totalPages,
                            current_page: book.currentPage,
                            status: book.status,
                            imported_at: new Date(book.importedAt).toISOString(),
                            updated_at: new Date(book.updatedAt).toISOString(),
                        });
                    }
                } catch (e) {
                    console.error('Failed to sync book metadata:', e);
                }
            },

            updateBookPage: async (bookId, page, totalPages) => {
                const now = Date.now();
                set(state => ({
                    books: state.books.map(book => {
                        if (book.id !== bookId) return book;
                        const nextTotalPages = totalPages ?? book.totalPages;
                        return {
                            ...book,
                            currentPage: page,
                            totalPages: nextTotalPages,
                            status: nextTotalPages > 0 && page >= nextTotalPages ? 'completed' : book.status,
                            updatedAt: now,
                        };
                    }),
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const updates: Record<string, unknown> = {
                            current_page: page,
                            updated_at: new Date(now).toISOString(),
                        };
                        if (totalPages !== undefined) {
                            updates.total_pages = totalPages;
                            updates.status = page >= totalPages ? 'completed' : 'reading';
                        }

                        await supabase.from('reading_books')
                            .update(updates)
                            .eq('id', bookId)
                            .eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to sync book progress:', e);
                }
            },

            recordReadingSession: async (bookId, startPage, endPage, durationSeconds) => {
                const pagesRead = Math.max(0, endPage - startPage);
                if (pagesRead <= 0 && durationSeconds <= 0) return;

                const now = Date.now();
                const date = format(new Date(), 'yyyy-MM-dd');
                const readingSession: ReadingSession = {
                    id: Crypto.randomUUID(),
                    bookId,
                    startedAt: now - durationSeconds * 1000,
                    endedAt: now,
                    startPage,
                    endPage,
                    pagesRead,
                    durationSeconds,
                };

                set(state => {
                    const existing = state.dailyLogs[date] ?? { date, pagesRead: 0, durationSeconds: 0 };
                    return {
                        sessions: [readingSession, ...state.sessions],
                        dailyLogs: {
                            ...state.dailyLogs,
                            [date]: {
                                date,
                                pagesRead: existing.pagesRead + pagesRead,
                                durationSeconds: existing.durationSeconds + durationSeconds,
                            },
                        },
                    };
                });
                queueAchievementEvaluation();

                await useHabitStore.getState().recordReadingProgress(date, pagesRead, durationSeconds);

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('reading_sessions').insert({
                            id: readingSession.id,
                            user_id: session.user.id,
                            book_id: bookId,
                            started_at: new Date(readingSession.startedAt).toISOString(),
                            ended_at: new Date(now).toISOString(),
                            start_page: startPage,
                            end_page: endPage,
                            pages_read: pagesRead,
                            duration_seconds: durationSeconds,
                        });

                        const daily = get().dailyLogs[date];
                        await supabase.from('reading_daily_logs').upsert({
                            user_id: session.user.id,
                            log_date: date,
                            pages_read: daily.pagesRead,
                            duration_seconds: daily.durationSeconds,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'user_id,log_date' });
                    }
                } catch (e) {
                    console.error('Failed to sync reading session:', e);
                }
            },

            removeBook: async (bookId) => {
                const book = get().books.find(item => item.id === bookId);
                set(state => ({ books: state.books.filter(item => item.id !== bookId) }));

                if (book?.localUri) {
                    try {
                        const info = await FileSystem.getInfoAsync(book.localUri);
                        if (info.exists) await FileSystem.deleteAsync(book.localUri);
                    } catch (e) {
                        console.error('Failed to delete local PDF:', e);
                    }
                }

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('reading_books').delete().eq('id', bookId).eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to delete cloud book:', e);
                }
            },

            loadFromCloud: async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

                    set({ isLoading: true });
                    const { data: books } = await supabase
                        .from('reading_books')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('updated_at', { ascending: false });

                    if (books) {
                        set({
                            books: books.map(book => ({
                                id: book.id,
                                title: book.title,
                                fileName: book.file_name ?? undefined,
                                localUri: book.local_uri,
                                totalPages: book.total_pages,
                                currentPage: book.current_page,
                                status: book.status,
                                importedAt: new Date(book.imported_at).getTime(),
                                updatedAt: new Date(book.updated_at).getTime(),
                            })),
                        });
                    }

                    const { data: dailyLogs } = await supabase
                        .from('reading_daily_logs')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('log_date', { ascending: false })
                        .limit(90);

                    if (dailyLogs) {
                        const mapped: Record<string, ReadingDailyLog> = {};
                        for (const log of dailyLogs) {
                            mapped[log.log_date] = {
                                date: log.log_date,
                                pagesRead: log.pages_read,
                                durationSeconds: log.duration_seconds,
                            };
                        }
                        set({ dailyLogs: mapped });
                    }
                } catch (e) {
                    console.error('Failed to load reading data from cloud:', e);
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'screen-guardian-reading',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
