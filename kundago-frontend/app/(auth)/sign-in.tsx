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
import { Link, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth';

export default function SignInScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.toLowerCase(),
        password,
      });

      const data = res.data;
      setAuth(data.data.token, data.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Sign in failed. Please try again.';
      setError(message);
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
                className="w-40 h-40 relative right-2 -bottom-4"
                resizeMode="cover"
              />
              <Text className="headline-md text-primary text-4xl">
                <Text>Kunda</Text>
                <Text style={{ color: '#ef4444' }}>Go</Text>
              </Text>
            </View>
            <Text className="body-md text-on-surface text-center">
              Welcome back to your one-stop shop
            </Text>
          </View>

          {error ? (
            <View className="bg-error-container rounded px-4 py-4 mb-4">
              <Text className="body-md text-error">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="mb-6">
            <Text className="label-sm text-on-surface mb-2">
              Email Address
            </Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#3d4a3d"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderWidth: 1,
                borderColor: focusedField === 'email' ? '#006e2f' : '#6d7b6c',
                borderRadius: 4,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: '#ffffff',
              }}
            />
          </View>

          <View className="mb-6">
            <Text className="label-sm text-on-surface mb-2">
              Password
            </Text>
            <View className="relative">
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#3d4a3d"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{
                  borderWidth: 1,
                  borderColor: focusedField === 'password' ? '#006e2f' : '#6d7b6c',
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

          <TouchableOpacity className="mb-10">
            <Text className="label-sm text-primary text-right">
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="bg-primary rounded py-4 mb-6 flex-row justify-center items-center"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="label-sm text-white font-bold bg-primary">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="body-md text-on-surface">
              Don&apos;t have an account?{' '}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="body-md text-primary font-bold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
  );
}
