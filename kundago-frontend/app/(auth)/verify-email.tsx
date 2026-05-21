import '@/global.css';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

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
      const res = await api.post('/auth/verify-email', {
        email,
        otp: code,
      });

      const data = res.data;
      setAuth(data.data.token, data.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Invalid or expired code. Please try again.';
      setError(message);
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
      const message =
        err.response?.data?.message ||
        'Failed to resend code. Please try again.';
      setError(message);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-surface"
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingVertical: 40,
            justifyContent: 'center',
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#f0fdf4',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 36 }}>✉️</Text>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                lineHeight: 32,
                color: '#0f172a',
                textAlign: 'center',
                marginBottom: 8,
                fontFamily: 'Hanken Grotesk',
              }}
            >
              Check your email
            </Text>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              We sent a verification code to
            </Text>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: '#0f172a',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              {email || 'your email'}
            </Text>
          </View>

          {error ? (
            <View
              style={{
                backgroundColor: '#ffdad6',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: '#ba1a1a',
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 12,
                letterSpacing: 0.05,
                fontWeight: '500',
                color: '#191c1e',
                marginBottom: 16,
                textAlign: 'center',
                fontFamily: 'JetBrains Mono',
              }}
            >
              VERIFICATION CODE
            </Text>

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(text) => {
                const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
                setCode(digits);
                if (digits.length === 6) {
                  setError('');
                }
              }}
              editable={!loading}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                opacity: 0,
              }}
            />

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const filled = code.length > i;
                const isCurrent = code.length === i;

                return (
                  <View
                    key={i}
                    style={{
                      width: 52,
                      height: 64,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: filled ? '#006e2f' : '#6d7b6c',
                      backgroundColor: filled ? '#f0fdf4' : '#ffffff',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: filled ? '#006e2f' : '#191c1e',
                        fontFamily: 'JetBrains Mono',
                      }}
                    >
                      {filled ? code[i] : isCurrent ? '|' : ''}
                    </Text>
                  </View>
                );
              })}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || code.length !== 6}
            style={{
              backgroundColor:
                code.length === 6 ? '#006e2f' : '#bccbb9',
              borderRadius: 8,
              paddingVertical: 16,
              marginBottom: 24,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
              elevation: code.length === 6 ? 3 : 0,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text
                style={{
                  fontSize: 12,
                  letterSpacing: 0.05,
                  fontWeight: '700',
                  color: code.length === 6 ? '#ffffff' : '#94a3b8',
                  fontFamily: 'Hanken Grotesk',
                }}
              >
                Verify Email
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator color="#006e2f" size="small" />
                ) : (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#006e2f',
                    }}
                  >
                    Resend verification code
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  color: '#64748b',
                }}
              >
                Resend code in{' '}
                <Text
                  style={{
                    fontWeight: '700',
                    color: '#0f172a',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  {formatCountdown(countdown)}
                </Text>
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            style={{ alignItems: 'center' }}
          >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#64748b',
                }}
            >
              ← Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
