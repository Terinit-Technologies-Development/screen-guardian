import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthButton, AuthInput, AuthMessage, AuthScaffold } from '../../src/components/auth/AuthScaffold';
import { useAuthStore } from '../../src/store/authStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendPasswordReset, isLoading } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [tone, setTone] = React.useState<'error' | 'success'>('success');

  const handleReset = async () => {
    setMessage(null);
    try {
      await sendPasswordReset(email.trim());
      setTone('success');
      setMessage('Password reset link sent. Check your email.');
    } catch (error: any) {
      setTone('error');
      setMessage(error?.message ?? 'Unable to send reset email');
    }
  };

  return (
    <AuthScaffold title="Reset password" subtitle="We’ll email you a secure reset link.">
      <AuthMessage message={message} tone={tone} />
      <AuthInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AuthButton label={isLoading ? 'Sending...' : 'Send Reset Link'} onPress={handleReset} disabled={isLoading || !email} />
      <View className="items-center mt-2">
        <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
          <Text className="text-cyan-500 font-bold">Back to sign in</Text>
        </TouchableOpacity>
      </View>
    </AuthScaffold>
  );
}
