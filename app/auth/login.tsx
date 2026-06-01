import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthButton, AuthInput, AuthMessage, AuthScaffold } from '../../src/components/auth/AuthScaffold';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, isLoading } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setMessage(null);
    try {
      await signIn(email.trim(), password);
      const { isEmailVerified } = useAuthStore.getState();
      router.replace((isEmailVerified ? '/(tabs)' : '/auth/verify-email') as any);
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Unable to sign in';
      setMessage(errorMessage);
      if (errorMessage.toLowerCase().includes('email not confirmed')) {
        router.replace('/auth/verify-email' as any);
      }
    }
  };

  const handleGoogle = async () => {
    setMessage(null);
    try {
      await signInWithGoogle();
      const { isEmailVerified } = useAuthStore.getState();
      router.replace((isEmailVerified ? '/(tabs)' : '/auth/verify-email') as any);
    } catch (error: any) {
      setMessage(error?.message ?? 'Unable to sign in with Google');
    }
  };

  return (
    <AuthScaffold title="Welcome back" subtitle="Sign in to sync your focus data securely.">
      <AuthMessage message={message} />
      <AuthInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AuthInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <AuthButton label={isLoading ? 'Signing in...' : 'Sign In'} onPress={handleLogin} disabled={isLoading || !email || !password} />
      <AuthButton label="Continue with Google" onPress={handleGoogle} disabled={isLoading} variant="secondary" />

      <View className="items-center mt-2">
        <TouchableOpacity onPress={() => router.push('/auth/forgot-password' as any)}>
          <Text className="text-cyan-500 font-bold mb-4">Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/signup' as any)}>
          <Text className="text-muted-foreground">
            New here? <Text className="text-cyan-500 font-bold">Create an account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScaffold>
  );
}
