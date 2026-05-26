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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useThemeColors } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
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
      <View className="flex-1 px-6 py-10 justify-center">
        <View className="mb-10 mt-10 items-center">
          <View className="items-center gap-2">
            <Image
              source={require('@/assets/images/kungaGo_logo.png')}
              className="w-32 h-32 relative right-1"
              resizeMode="cover"
            />
            <Text className="headline-md text-primary text-3xl">
              <Text>Kunda</Text>
              <Text style={{ color: '#ef4444' }}>Go</Text>
            </Text>
          </View>
        </View>

        <Text className="headline-md text-on-surface font-black text-center mb-2">
          Forgot Password
        </Text>
        <Text className="body-md text-on-surface-variant text-center mb-8">
          Enter your email and we'll send you a reset code.
        </Text>

        {error ? (
          <View className="bg-error-container rounded px-4 py-4 mb-4">
            <Text className="body-md text-error">{error}</Text>
          </View>
        ) : null}

        <View className="mb-8">
          <Text className="label-sm text-on-surface mb-2">Email Address</Text>
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
            style={{
              borderWidth: 1,
              borderColor: focusedField === 'email' ? c.primary.DEFAULT : c.outline,
              borderRadius: 4,
              paddingHorizontal: 16,
              paddingVertical: 16,
              fontSize: 16,
              color: c.onSurface,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="bg-primary rounded py-4 mb-6 flex-row justify-center items-center"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="label-sm text-white font-bold">Send Reset Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} className="items-center">
          <Text className="body-md font-semibold text-on-surface-variant">
            ← Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
