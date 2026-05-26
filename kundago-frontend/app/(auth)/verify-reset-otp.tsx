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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';

export default function VerifyResetOTPScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      const res = await api.post('/auth/verify-otp', { email, otp: code });
      const resetToken = res.data.data.resetToken;
      router.push(`/(auth)/reset-password?token=${encodeURIComponent(resetToken)}`);
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
      await api.post('/auth/forgot-password', { email });
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: '#fffbfe' }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingTop: insets.top,
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ marginBottom: 24 }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#49454e' }}>
              ← Back
            </Text>
          </TouchableOpacity>

          {/* Header Section */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: '#f3e5ff',
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 36 }}>🔐</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#1c1b1f', marginBottom: 8, textAlign: 'center' }}>
              Check your email
            </Text>
            <Text style={{ fontSize: 14, color: '#49454e', textAlign: 'center', marginBottom: 4 }}>
              We sent a reset code to
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1c1b1f', textAlign: 'center' }}>
              {email || 'your email'}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={{ backgroundColor: '#f9dedc', borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <Text style={{ fontSize: 12, color: '#b3261e' }}>{error}</Text>
            </View>
          ) : null}

          {/* OTP Input Section */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: '#1c1b1f', textAlign: 'center', marginBottom: 16, letterSpacing: 0.5 }}>
              RESET CODE
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
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
              }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
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
                      style={{
                        fontSize: 28,
                        fontWeight: '700',
                        fontFamily: 'JetBrains Mono',
                        color: filled ? '#006e2f' : '#191c1e',
                      }}
                    >
                      {filled ? code[i] : isCurrent ? '|' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || code.length !== 6}
            style={{
              borderRadius: 8,
              paddingVertical: 16,
              marginBottom: 24,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: code.length === 6 ? '#006e2f' : '#e0f2e9',
              opacity: loading || code.length !== 6 ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>
                Verify Code
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator color="#006e2f" size="small" />
                ) : (
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#006e2f' }}>
                    Resend reset code
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={{ fontSize: 14, color: '#49454e' }}>
                Resend code in{' '}
                <Text
                  style={{
                    fontWeight: '700',
                    color: '#1c1b1f',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  {formatCountdown(countdown)}
                </Text>
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
