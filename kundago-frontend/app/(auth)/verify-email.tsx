import '@/global.css';
import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { email } = useLocalSearchParams<{ email: string }>();
  const { width } = useWindowDimensions();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const boxSize = Math.min(52, (width - 48 - 60) / 6);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { email, otp: code });
      const data = res.data;
      setAuth(data.data.token, data.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/send-verification', { email });
      setCountdown(60);
      setCanResend(false);
      setCode('');
      inputRef.current?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-surface">
        <View style={{ paddingTop: insets.top }} className="flex-1 justify-center px-6 py-10">
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center mb-6">
              <Text className="text-3xl">✉️</Text>
            </View>
            <Text className="headline-md text-on-surface font-black text-center mb-2">
              Check your email
            </Text>
            <Text className="body-md text-on-surface-variant text-center">
              We sent a verification code to
            </Text>
            <Text className="body-md text-on-surface font-bold text-center">
              {email || 'your email'}
            </Text>
          </View>

          {error ? (
            <View className="bg-error-container rounded-lg p-4 mb-6">
              <Text className="text-sm text-on-error-container">{error}</Text>
            </View>
          ) : null}

          <View className="mb-8">
            <Text className="label-sm text-on-surface text-center mb-4">
              VERIFICATION CODE
            </Text>

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(text) => {
                const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
                setCode(digits);
                if (digits.length === 6) setError('');
              }}
              editable={!loading}
              keyboardType="number-pad"
              maxLength={6}
              caretHidden
              className="absolute inset-0 opacity-0"
            />

            <View className="flex-row justify-center gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const filled = code.length > i;
                const isCurrent = code.length === i;
                return (
                  <View
                    key={i}
                    style={{
                      width: boxSize,
                      height: boxSize + 12,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: filled ? '#006e2f' : '#6d7b6c',
                      backgroundColor: filled ? '#f0fdf4' : '#ffffff',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      className="text-2xl font-bold text-on-surface"
                      style={{ fontFamily: 'JetBrains Mono', color: filled ? '#006e2f' : '#191c1e' }}
                    >
                      {filled ? code[i] : isCurrent ? '|' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || code.length !== 6}
            className={`rounded-lg py-4 mb-6 flex-row justify-center items-center ${
              code.length === 6 ? 'bg-primary shadow-ambient' : 'bg-primary-100'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="label-sm font-bold text-white">
                Verify Email
              </Text>
            )}
          </TouchableOpacity>

          <View className="items-center mb-8">
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator color="#006e2f" size="small" />
                ) : (
                  <Text className="body-md font-bold text-primary">
                    Resend verification code
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text className="body-md text-on-surface-variant">
                Resend code in{' '}
                <Text className="font-bold text-on-surface" style={{ fontFamily: 'JetBrains Mono' }}>
                  {formatCountdown(countdown)}
                </Text>
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} className="items-center">
            <Text className="body-md font-semibold text-on-surface-variant">
              ← Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
