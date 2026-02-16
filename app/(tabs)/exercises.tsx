import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Clock, Zap, ChevronRight, Info } from 'lucide-react-native';
import ExerciseService from '../../src/services/ExerciseService';
import { Exercise } from '../../src/types/exercise';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ExercisesScreen() {
    const exercises = ExerciseService.getAll();

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6">
                <Text className="text-3xl font-black text-foreground tracking-tighter">Exercises</Text>
                <Text className="text-muted-foreground text-sm mt-1">Burn focus energy with mindful movement</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {exercises.map((exercise, index) => (
                    <Animated.View
                        key={exercise.id}
                        entering={FadeInDown.delay(index * 100).springify()}
                    >
                        <ExerciseCard exercise={exercise} />
                    </Animated.View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-success';
            case 'medium': return 'bg-warning';
            case 'hard': return 'bg-destructive';
            default: return 'bg-muted';
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsExpanded(!isExpanded)}
            className="bg-card border border-border rounded-[24px] p-5 mb-4 shadow-sm"
        >
            <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-cyan-500/10 items-center justify-center mr-4">
                    <Dumbbell size={24} color="#06b6d4" />
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">{exercise.name}</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="flex-row items-center mr-3">
                            <Clock size={12} className="text-muted-foreground" />
                            <Text className="text-xs text-muted-foreground ml-1 font-semibold">{exercise.duration}s</Text>
                        </View>
                        <View className="flex-row items-center mr-3">
                            <Zap size={12} className="text-muted-foreground" />
                            <Text className="text-xs text-muted-foreground ml-1 font-bold uppercase">{exercise.difficulty}</Text>
                        </View>
                        <View className={`w-1.5 h-1.5 rounded-full ${getDifficultyColor(exercise.difficulty)}`} />
                    </View>
                </View>
                <ChevronRight
                    size={20}
                    className="text-muted-foreground"
                    style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                />
            </View>

            <Text className="text-sm text-muted-foreground mt-3 leading-5" numberOfLines={isExpanded ? undefined : 2}>
                {exercise.description}
            </Text>

            {isExpanded && (
                <View className="mt-4">
                    <View className="h-[1px] bg-border mb-4" />
                    <View className="flex-row items-center mb-3">
                        <Info size={16} color="#06b6d4" />
                        <Text className="text-sm font-bold text-cyan-500 ml-2">Instructions</Text>
                    </View>
                    {exercise.instructions.map((step, index) => (
                        <View key={index} className="flex-row mb-2 pr-4">
                            <Text className="text-sm font-bold text-muted-foreground w-6">{index + 1}</Text>
                            <Text className="text-sm text-foreground flex-1 leading-5">{step}</Text>
                        </View>
                    ))}
                    <View className="flex-row mt-5 gap-3">
                        <View className="flex-1 bg-muted/50 p-3 rounded-2xl items-center border border-border/5">
                            <Text className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">Calories</Text>
                            <Text className="text-sm font-black text-foreground">{exercise.caloriesBurned} kcal</Text>
                        </View>
                        {exercise.repetitions && (
                            <View className="flex-1 bg-muted/50 p-3 rounded-2xl items-center border border-border/5">
                                <Text className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">Target Reps</Text>
                                <Text className="text-sm font-black text-foreground">{exercise.repetitions}</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}
