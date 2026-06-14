import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthButton, AuthInput, AuthMessage, AuthScaffold } from '../../src/components/auth/AuthScaffold';
import { useAuthStore } from '../../src/store/authStore';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, pendingVerificationEmail, refreshUser, resendVerification, signOut, isLoading } = useAuthStore();
  const [email, setEmail] = React.useState(pendingVerificationEmail ?? user?.email ?? '');
  const [message, setMessage] = React.useState<string | null>('Check your email for the verification link.');
  const [tone, setTone] = React.useState<'error' | 'success' | 'info'>('info');

  const handleRefresh = async () => {
    setMessage(null);
    const refreshedUser = await refreshUser();
    if (refreshedUser?.email_confirmed_at) {
      router.replace('/(tabs)');
      return;
    }

    setTone('info');
    setMessage('Still waiting for verification. If the link did not open the app, try opening it again or resend it below.');
  };

  const handleResend = async () => {
    setMessage(null);
    try {
      await resendVerification(email.trim());
      setTone('success');
      setMessage('Verification email resent. Check your inbox.');
    } catch (error: any) {
      setTone('error');
      setMessage(error?.message ?? 'Unable to resend verification email');
    }
  };

  const handleChangeEmail = async () => {
    await signOut();
    router.replace('/auth/login' as any);
  };

  return (
    <AuthScaffold title="Verify your email" subtitle="Your account is almost ready.">
      <AuthMessage message={message} tone={tone} />
      <Text className="text-muted-foreground text-sm mb-4">
        Open the verification link sent to your inbox. If the link verifies your account but does not bring you back to Screen Guardian, tap Refresh below.
      </Text>
      <AuthInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AuthButton label="Refresh Verification Status" onPress={handleRefresh} disabled={isLoading} />
      <AuthButton label="Resend Verification Email" onPress={handleResend} disabled={isLoading || !email} variant="ghost" />
      <View className="items-center mt-2">
        <TouchableOpacity onPress={handleChangeEmail}>
          <Text className="text-cyan-500 font-bold">Use another email</Text>
        </TouchableOpacity>
      </View>
    </AuthScaffold>
  );
}
