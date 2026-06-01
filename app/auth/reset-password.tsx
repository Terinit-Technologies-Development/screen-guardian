import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthButton, AuthInput, AuthMessage, AuthScaffold } from '../../src/components/auth/AuthScaffold';
import { useAuthStore } from '../../src/store/authStore';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session, updatePassword, isLoading } = useAuthStore();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [tone, setTone] = React.useState<'error' | 'success'>('error');

  const handleUpdate = async () => {
    setMessage(null);
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      await updatePassword(password);
      setTone('success');
      setMessage('Password updated. Redirecting...');
      router.replace('/(tabs)');
    } catch (error: any) {
      setTone('error');
      setMessage(error?.message ?? 'Unable to update password');
    }
  };

  return (
    <AuthScaffold title="Choose new password" subtitle="Set a new password for your Screen Guardian account.">
      {!session && (
        <AuthMessage message="Open the reset link from your email first, then return here." tone="info" />
      )}
      <AuthMessage message={message} tone={tone} />
      <AuthInput value={password} onChangeText={setPassword} placeholder="New password" secureTextEntry />
      <AuthInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" secureTextEntry />
      <AuthButton label={isLoading ? 'Updating...' : 'Update Password'} onPress={handleUpdate} disabled={isLoading || !session} />
      <View className="items-center mt-2">
        <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
          <Text className="text-cyan-500 font-bold">Back to sign in</Text>
        </TouchableOpacity>
      </View>
    </AuthScaffold>
  );
}
