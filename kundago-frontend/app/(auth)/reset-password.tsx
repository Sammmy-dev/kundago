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
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
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
      <View className="flex-1 px-6 py-10 justify-center">
        <View className="mb-10 mt-10 items-center">
          <View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="lock-closed" size="32" color="#006e2f" />
          </View>
          <Text className="headline-md text-on-surface font-black text-center mb-2">
            Set New Password
          </Text>
          <Text className="body-md text-on-surface-variant text-center">
            Enter your new password below.
          </Text>
        </View>

        {error ? (
          <View className="bg-error-container rounded px-4 py-4 mb-4">
            <Text className="body-md text-error">{error}</Text>
          </View>
        ) : null}

        <View className="mb-6">
          <Text className="label-sm text-on-surface mb-2">New Password</Text>
          <View className="relative">
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#3d4a3d"
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('newPassword')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderWidth: 1,
                borderColor: focusedField === 'newPassword' ? '#006e2f' : '#6d7b6c',
                borderRadius: 4,
                paddingHorizontal: 16,
                paddingVertical: 16,
                paddingRight: 48,
                fontSize: 16,
                color: '#ffffff',
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-0 bottom-0 justify-center"
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#6d7b6c"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <Text className="label-sm text-on-surface mb-2">Confirm Password</Text>
          <View className="relative">
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#3d4a3d"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              secureTextEntry={!showConfirm}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderWidth: 1,
                borderColor: focusedField === 'confirmPassword' ? '#006e2f' : '#6d7b6c',
                borderRadius: 4,
                paddingHorizontal: 16,
                paddingVertical: 16,
                paddingRight: 48,
                fontSize: 16,
                color: '#ffffff',
              }}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-0 bottom-0 justify-center"
            >
              <Ionicons
                name={showConfirm ? 'eye-off' : 'eye'}
                size={22}
                color="#6d7b6c"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          className="bg-primary rounded py-4 mb-6 flex-row justify-center items-center"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="label-sm text-white font-bold">Reset Password</Text>
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
