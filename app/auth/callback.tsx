import React from 'react';
import { Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const latestUrl = Linking.useURL();
  const handledRef = React.useRef(false);
  const [message, setMessage] = React.useState('Completing sign in...');

  React.useEffect(() => {
    const complete = async () => {
      if (handledRef.current) return;
      handledRef.current = true;

      try {
        const url = latestUrl ?? await Linking.getInitialURL();
        if (!url) throw new Error('No authentication callback URL was found.');

        const next = await useAuthStore.getState().handleAuthCallback(url);
        const { isEmailVerified } = useAuthStore.getState();

        if (next) {
          router.replace(next as any);
          return;
        }

        router.replace((isEmailVerified ? '/(tabs)' : '/auth/verify-email') as any);
      } catch (error: any) {
        setMessage(error?.message ?? 'Unable to complete authentication.');
      }
    };

    complete();
  }, [latestUrl, router]);

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
      <View className="bg-card border border-border rounded-[32px] p-6 w-full">
        <Text className="text-2xl font-black text-foreground mb-2">Authentication</Text>
        <Text className="text-muted-foreground">{message}</Text>
      </View>
    </SafeAreaView>
  );
}
