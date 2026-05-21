import '@/global.css';
import { useState } from 'react';
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
import { Link, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth';

export default function SignUpScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        fullName,
        phone,
        email: email.toLowerCase(),
        password,
      });

      const data = res.data;
      setAuth(data.data.token, data.data.user);
      router.replace(`/(auth)/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Sign up failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-surface"
      >
        <View className="flex-1 px-6 py-10">
          <View className="mb-6 items-center">
            <Text className="display-lg-mobile text-primary mb-2">
              KundaGo
            </Text>
            <Text className="body-md text-on-surface text-center">
              Join the mobility revolution
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
              Full Name
            </Text>
            <TextInput
              placeholder="John Doe"
              placeholderTextColor="#3d4a3d"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
                style={{
                  borderWidth: 1,
                  borderColor: focusedField === 'fullName' ? '#006e2f' : '#6d7b6c',
                  borderRadius: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: '#191c1e',
                }}
            />
          </View>

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
                  color: '#191c1e',
                }}
            />
          </View>

          <View className="mb-6">
            <Text className="label-sm text-on-surface mb-2">
              Phone Number
            </Text>
            <TextInput
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#3d4a3d"
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
              keyboardType="phone-pad"
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
                style={{
                  borderWidth: 1,
                  borderColor: focusedField === 'phone' ? '#006e2f' : '#6d7b6c',
                  borderRadius: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: '#191c1e',
                }}
            />
          </View>

          <View className="mb-6">
            <Text className="label-sm text-on-surface mb-2">
              Password
            </Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#3d4a3d"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
                style={{
                  borderWidth: 1,
                  borderColor: focusedField === 'password' ? '#006e2f' : '#6d7b6c',
                  borderRadius: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: '#191c1e',
                }}
            />
            <Text className="label-sm text-on-surface-variant mt-1">
              Minimum 6 characters
            </Text>
          </View>

          <View className="mb-6">
            <Text className="label-sm text-on-surface mb-2">
              Confirm Password
            </Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#3d4a3d"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              secureTextEntry
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
                style={{
                  borderWidth: 1,
                  borderColor: focusedField === 'confirmPassword' ? '#006e2f' : '#6d7b6c',
                  borderRadius: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: '#191c1e',
                }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className="bg-primary rounded py-4 mb-6 flex-row justify-center items-center"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="label-sm text-white font-bold">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="body-md text-on-surface">
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text className="body-md text-primary font-bold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
