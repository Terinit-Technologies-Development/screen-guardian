import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthButton, AuthInput, AuthMessage, AuthScaffold } from '../../src/components/auth/AuthScaffold';
import { useAuthStore } from '../../src/store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSignup = async () => {
    setMessage(null);
    try {
      await signUp(email.trim(), password, displayName.trim() || undefined);
      router.replace('/auth/verify-email' as any);
    } catch (error: any) {
      setMessage(error?.message ?? 'Unable to create account');
    }
  };

  return (
    <AuthScaffold title="Create account" subtitle="Start protecting your focus across devices.">
      <AuthMessage message={message} />
      <AuthInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" />
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
      <AuthButton label={isLoading ? 'Creating account...' : 'Sign Up'} onPress={handleSignup} disabled={isLoading || !email || password.length < 6} />
      <View className="items-center mt-2">
        <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
          <Text className="text-muted-foreground">
            Already have an account? <Text className="text-cyan-500 font-bold">Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScaffold>
  );
}
