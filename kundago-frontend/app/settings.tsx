import '@/global.css';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useThemeStore } from '@/lib/stores/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { api } from '@/lib/api';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode, setMode } = useThemeStore();
  const isDark = useThemeStore((s) => s.isDark);
  const darkModeEnabled = mode === 'dark';
  const [promoMail, setPromoMail] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data including orders, addresses, and cart will be deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/auth/account');
              logout();
              router.replace('/auth/login');
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <View className="px-4 pt-3 pb-3 bg-surface flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={isDark ? '#e1e3e5' : '#191c1e'} />
        </TouchableOpacity>
        <Text className="headline-md text-on-surface font-black flex-1">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="bg-surface-container rounded-lg shadow-ambient mb-4">
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center">
              <Feather name="mail" size={20} color="#006e2f" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="body-md font-bold text-on-surface">Promotional Mails</Text>
              <Text className="body-sm text-on-surface-variant">Receive deals and offers via email</Text>
            </View>
            <Switch
              value={promoMail}
              onValueChange={setPromoMail}
              trackColor={{ false: '#e0e3e5', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View className="bg-surface-container rounded-lg shadow-ambient mb-4">
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center">
              <Feather name="moon" size={20} color="#006e2f" />
            </View>
            <Text className="body-md text-on-surface font-semibold flex-1 ml-3">Dark Mode</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={(val) => setMode(val ? 'dark' : 'system')}
              trackColor={{ false: '#e0e3e5', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View className="bg-surface-container rounded-lg shadow-ambient mb-6">
          <TouchableOpacity className="px-4 py-4 flex-row items-center gap-3">
            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center">
              <Feather name="globe" size={20} color="#006e2f" />
            </View>
            <Text className="body-md text-on-surface font-semibold flex-1">Language</Text>
            <Text className="body-sm text-on-surface-variant">English</Text>
            <Feather name="chevron-right" size={20} color={isDark ? '#bcc9bc' : '#3d4a3d'} />
          </TouchableOpacity>
          <View className="h-px bg-surface-variant mx-4" />
          <TouchableOpacity className="px-4 py-4 flex-row items-center gap-3">
            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center">
              <Feather name="smartphone" size={20} color="#006e2f" />
            </View>
            <Text className="body-md text-on-surface font-semibold flex-1">App Version</Text>
            <Text className="body-sm text-on-surface-variant">1.0.0</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-surface-container rounded-lg shadow-ambient mb-4">
          <TouchableOpacity onPress={handleDeleteAccount} className="px-4 py-4 flex-row items-center gap-3">
            <View className="w-10 h-10 bg-error-50 rounded-lg items-center justify-center">
              <Feather name="trash-2" size={20} color="#dc2626" />
            </View>
            <Text className="body-md text-error font-semibold flex-1">Delete Account</Text>
            <Feather name="chevron-right" size={20} color={isDark ? '#bcc9bc' : '#3d4a3d'} />
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
