import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkStore } from '../store/workStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function WorkCardModal({ visible, onClose }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { createCard } = useWorkStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('60');
  const [dueDate, setDueDate] = useState('');

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setEstimatedMinutes('60');
    setDueDate('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const save = async () => {
    if (!title.trim()) return;
    const dueAt = dueDate.trim() ? new Date(dueDate.trim()).getTime() : undefined;
    await createCard({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      estimatedMinutes: Math.max(1, parseInt(estimatedMinutes, 10) || 60),
      dueAt: Number.isFinite(dueAt) ? dueAt : undefined,
    });
    close();
  };

  const bg = isDark ? 'bg-neutral-950' : 'bg-white';
  const inputBg = isDark ? 'bg-neutral-900' : 'bg-neutral-50';
  const inputBorder = isDark ? 'border-neutral-800' : 'border-neutral-200';
  const textColor = isDark ? 'text-white' : 'text-neutral-900';
  const muted = isDark ? 'text-neutral-400' : 'text-neutral-500';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-end">
        <Pressable className="flex-1" onPress={close} />
        <View className={`${bg} rounded-t-[32px] max-h-[85%]`}>
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <Text className={`text-xl font-black ${textColor}`}>New Work Card</Text>
            <TouchableOpacity onPress={close} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
              <X size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          <ScrollView className="px-6 pt-4" contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 40) }}>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder="What needs to be done?" />
            <Field label="Category" value={category} onChangeText={setCategory} placeholder="Coding, Admin, Writing..." />
            <Field label="Estimated minutes" value={estimatedMinutes} onChangeText={setEstimatedMinutes} placeholder="60" keyboardType="number-pad" />
            <Field label="Due date / time" value={dueDate} onChangeText={setDueDate} placeholder="2026-06-03 17:00" />
            <View className="mb-5">
              <Text className={`text-sm font-bold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Definition of done, notes, constraints..."
                placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                multiline
                className={`p-4 rounded-xl text-base ${inputBg} ${textColor} border ${inputBorder}`}
                style={{ textAlignVertical: 'top' }}
              />
            </View>
            <TouchableOpacity disabled={!title.trim()} onPress={save} className={`p-4 rounded-2xl ${title.trim() ? 'bg-cyan-500' : isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
              <Text className={`text-center text-lg font-black ${title.trim() ? 'text-white' : muted}`}>Create Work Card</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  function Field({ label, value, onChangeText, placeholder, keyboardType }: any) {
    return (
      <View className="mb-5">
        <Text className={`text-sm font-bold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
          className={`p-4 rounded-xl text-base ${inputBg} ${textColor} border ${inputBorder}`}
        />
      </View>
    );
  }
}
