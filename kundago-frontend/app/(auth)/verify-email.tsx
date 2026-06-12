import '@/global.css';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth';
import { useThemeColors } from '@/constants/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
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

  const handleOtpChange = (index: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = sanitized.slice(-1);
    setOtpDigits(newDigits);
    setError('');

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpBoxPress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const code = otpDigits.join('');

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
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={100}
      className="bg-surface"
    >
      <View style={{ paddingTop: insets.top }} className="flex-1 px-6 py-8 justify-center">
        {/* Header Section */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Feather name="mail" size={32} color={c.primary.DEFAULT} />
          </View>
          <Text className="text-2xl font-black text-on-surface text-center mb-2">
            Check your email
          </Text>
          <Text className="body-md text-on-surface-variant text-center mb-1">
            We sent a verification code to
          </Text>
          <Text className="body-md font-semibold text-on-surface text-center">
            {email || 'your email'}
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-error-container rounded-lg px-4 py-3 mb-6">
            <Text className="label-sm text-error font-semibold">{error}</Text>
          </View>
        ) : null}

        {/* OTP Input Section */}
        <View className="mb-8">
          <Text className="label-sm font-semibold text-on-surface text-center mb-6 uppercase tracking-widest">
            Verification code
          </Text>

          {/* Hidden TextInput for keyboard capture */}
          <TextInput
            ref={(ref) => (inputRefs.current[0] = ref)}
            value={otpDigits.join('')}
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
              const newDigits = digits.split('');
              while (newDigits.length < 6) newDigits.push('');
              setOtpDigits(newDigits);
              if (digits.length === 6) setError('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            style={{ position: 'absolute', opacity: 0 }}
          />

          {/* OTP Display Boxes */}
          <View className="flex-row justify-center gap-3">
            {otpDigits.map((digit, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleOtpBoxPress(index)}
                activeOpacity={0.7}
                className="w-14 h-14 border-2 rounded-lg items-center justify-center"
                style={{
                  borderColor: digit ? c.primary.DEFAULT : c.outline,
                  backgroundColor: digit ? c.primary50 : c.surface,
                }}
              >
                <Text className="text-2xl font-bold text-on-surface">
                  {digit}
                </Text>

                {/* Hidden TextInput for each box */}
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={(e) => handleKeyPress(index, e.nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
          className="bg-primary rounded-lg py-4 mb-6 flex-row justify-center items-center"
          style={{ opacity: loading || code.length !== 6 ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="label-sm font-bold text-white">Verify Email</Text>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View className="items-center mb-8">
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator color={c.primary.DEFAULT} size="small" />
              ) : (
                <View className="flex-row items-center gap-1">
                  <Feather name="rotate-cw" size={14} color={c.primary.DEFAULT} />
                  <Text className="label-sm font-bold text-primary">
                    Resend verification code
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <Text className="body-sm text-on-surface-variant">
              Resend code in{' '}
              <Text className="font-bold text-on-surface">
                {formatCountdown(countdown)}
              </Text>
            </Text>
          )}
        </View>

        {/* Sign In Link */}
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} className="items-center">
          <View className="flex-row items-center gap-2">
            <Text className="body-sm text-on-surface-variant">Already verified? </Text>
            <Text className="body-sm font-bold text-primary">Sign in</Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
