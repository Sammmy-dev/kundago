import '@/global.css';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useThemeColors } from '@/constants/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setError('');

    if (!newPassword) {
      setError('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
      router.push('/(auth)/sign-in');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
          onPress={() => router.push('/(auth)/forgot-password')}
          className="flex-row items-center gap-1 mb-8"
        >
          <Feather name="arrow-left" size={20} color={c.primary.DEFAULT} />
          <Text className="label-sm font-semibold text-on-surface">Back</Text>
        </TouchableOpacity>

        {/* Header Section */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Feather name="lock" size={32} color={c.primary.DEFAULT} />
          </View>
          <Text className="text-2xl font-black text-on-surface text-center mb-2">
            Set New Password
          </Text>
          <Text className="body-md text-on-surface-variant text-center">
            Create a strong password to secure your account.
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-error-container rounded-lg px-4 py-3 mb-6">
            <Text className="label-sm text-error font-semibold">{error}</Text>
          </View>
        ) : null}

        {/* New Password Input */}
        <View className="mb-6">
          <Text className="label-sm font-semibold text-on-surface mb-2">New Password</Text>
          <View className="relative">
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={c.onSurfaceVariant}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('newPassword')}
              onBlur={() => setFocusedField(null)}
              className="rounded-lg px-4 py-4 pr-12 text-base text-on-surface"
              style={{
                borderWidth: 2,
                borderColor: focusedField === 'newPassword' ? c.primary.DEFAULT : c.outline,
                backgroundColor: c.surfaceContainer,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              className="absolute right-4 top-0 bottom-0 justify-center"
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={c.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View className="mb-8">
          <Text className="label-sm font-semibold text-on-surface mb-2">Confirm Password</Text>
          <View className="relative">
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={c.onSurfaceVariant}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              secureTextEntry={!showConfirm}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              className="rounded-lg px-4 py-4 pr-12 text-base text-on-surface"
              style={{
                borderWidth: 2,
                borderColor: focusedField === 'confirmPassword' ? c.primary.DEFAULT : c.outline,
                backgroundColor: c.surfaceContainer,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((p) => !p)}
              className="absolute right-4 top-0 bottom-0 justify-center"
            >
              <Feather
                name={showConfirm ? 'eye-off' : 'eye'}
                size={20}
                color={c.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          className="bg-primary rounded-lg py-4 mb-6 flex-row justify-center items-center"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="label-sm font-bold text-white">Reset Password</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} className="items-center">
          <View className="flex-row items-center gap-2">
            <Text className="body-sm text-on-surface-variant">Remember your password? </Text>
            <Text className="body-sm font-bold text-primary">Sign in</Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
