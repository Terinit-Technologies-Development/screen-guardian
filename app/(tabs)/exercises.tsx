import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Clock, Zap, ChevronRight, Info } from 'lucide-react-native';
import ExerciseService from '../../src/services/ExerciseService';
import { Exercise } from '../../src/types/exercise';

export default function ExercisesScreen() {
    const exercises = ExerciseService.getAll();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Exercises</Text>
                <Text style={styles.subtitle}>Burn focus energy with mindful movement</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return '#10b981';
            case 'medium': return '#fbbf24';
            case 'hard': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => setIsExpanded(!isExpanded)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Dumbbell size={24} color="#06b6d4" />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Clock size={12} color="#94a3b8" />
                            <Text style={styles.metaText}>{exercise.duration}s</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Zap size={12} color="#94a3b8" />
                            <Text style={styles.metaText}>{exercise.difficulty.toUpperCase()}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(exercise.difficulty) }]} />
                        </View>
                    </View>
                </View>
                <ChevronRight size={20} color="#334155" style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }} />
            </View>

            <Text style={styles.description}>{exercise.description}</Text>

            {isExpanded && (
                <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    <View style={styles.instructionHeader}>
                        <Info size={16} color="#06b6d4" />
                        <Text style={styles.instructionTitle}>Step-by-Step Instructions</Text>
                    </View>
                    {exercise.instructions.map((step, index) => (
                        <View key={index} style={styles.stepRow}>
                            <Text style={styles.stepNumber}>{index + 1}</Text>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Est. Calories</Text>
                            <Text style={styles.statValue}>{exercise.caloriesBurned} kcal</Text>
                        </View>
                        {exercise.repetitions && (
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>Target Reps</Text>
                                <Text style={styles.statValue}>{exercise.repetitions}</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 4,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#0a0a0a',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1e1e1e',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#164e6320',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    titleContainer: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    metaText: {
        fontSize: 12,
        color: '#94a3b8',
        marginLeft: 4,
        fontWeight: '600',
    },
    difficultyDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    description: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 12,
        lineHeight: 20,
    },
    expandedContent: {
        marginTop: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#1e1e1e',
        marginBottom: 16,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#06b6d4',
        marginLeft: 8,
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingRight: 16,
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
        width: 24,
    },
    stepText: {
        fontSize: 14,
        color: '#cbd5e1',
        flex: 1,
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#111111',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
});
