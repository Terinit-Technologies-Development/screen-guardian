import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthScaffoldProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthScaffold({ title, subtitle, children }: AuthScaffoldProps) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-4xl font-black text-foreground tracking-tighter">{title}</Text>
            <Text className="text-muted-foreground text-base mt-2">{subtitle}</Text>
          </View>
          <View className="bg-card border border-border rounded-[32px] p-5 shadow-sm">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
};

export function AuthInput(props: AuthInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#94a3b8"
      className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground font-semibold mb-3"
    />
  );
}

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function AuthButton({ label, onPress, disabled, variant = 'primary' }: AuthButtonProps) {
  const classes = {
    primary: 'bg-cyan-500',
    secondary: 'bg-foreground',
    ghost: 'bg-transparent border border-border',
  }[variant];

  const textClasses = variant === 'ghost' ? 'text-foreground' : variant === 'secondary' ? 'text-background' : 'text-white';

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`w-full rounded-2xl px-4 py-4 items-center mb-3 ${classes} ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`font-black ${textClasses}`}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AuthMessage({ message, tone = 'error' }: { message?: string | null; tone?: 'error' | 'success' | 'info' }) {
  if (!message) return null;

  const toneClasses = {
    error: 'text-destructive',
    success: 'text-emerald-500',
    info: 'text-cyan-500',
  }[tone];

  return <Text className={`text-sm font-semibold mb-3 ${toneClasses}`}>{message}</Text>;
}
