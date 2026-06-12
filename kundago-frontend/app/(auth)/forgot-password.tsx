import '@/global.css';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useThemeColors } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.toLowerCase() });
      router.push(`/(auth)/verify-reset-otp?email=${encodeURIComponent(email.toLowerCase())}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          className="flex-row items-center gap-1 mb-8"
        >
          <Feather name="arrow-left" size={20} color={c.primary.DEFAULT} />
          <Text className="label-sm font-semibold text-on-surface">Back</Text>
        </TouchableOpacity>

        {/* Header Section */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Feather name="mail" size={32} color={c.primary.DEFAULT} />
          </View>
          <Text className="text-2xl font-black text-on-surface text-center mb-2">
            Forgot Password?
          </Text>
          <Text className="body-md text-on-surface-variant text-center">
            Enter your email and we'll send you a code to reset your password.
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-error-container rounded-lg px-4 py-3 mb-6">
            <Text className="label-sm text-error font-semibold">{error}</Text>
          </View>
        ) : null}

        {/* Email Input */}
        <View className="mb-8">
          <Text className="label-sm font-semibold text-on-surface mb-2">Email Address</Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor={c.onSurfaceVariant}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className="rounded-lg px-4 py-4 text-base text-on-surface"
            style={{
              borderWidth: 2,
              borderColor: focusedField === 'email' ? c.primary.DEFAULT : c.outline,
              backgroundColor: c.surfaceContainer,
            }}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="bg-primary rounded-lg py-4 mb-6 flex-row justify-center items-center"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="label-sm font-bold text-white">Send Reset Code</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} className="items-center">
          <View className="flex-row items-center gap-2">
            <Text className="body-sm text-on-surface-variant">Don't have the code? </Text>
            <Text className="body-sm font-bold text-primary">Sign in instead</Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
