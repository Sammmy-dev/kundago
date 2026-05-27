import '@/global.css';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/constants/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/lib/api';
import { ScreenHeader } from '@/components/ScreenHeader';

const menuItems = [
  { id: 1, label: 'Saved Address', icon: 'map-pin' },
  { id: 2, label: 'Payment Methods', icon: 'credit-card' },
  { id: 3, label: 'About KundaGo', icon: 'info' },
  { id: 4, label: 'Settings', icon: 'settings' },
  { id: 5, label: 'Help & Support', icon: 'help-circle' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const c = useThemeColors();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.profileImage) {
      setAvatar(user.profileImage);
    }
  }, [user?.profileImage]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const profileUrl = res.data?.data?.user?.profileImage;
      if (profileUrl) {
        setAvatar(profileUrl);
        setUser({ ...user!, profileImage: profileUrl });
      }
    } catch {
      Alert.alert('Upload failed', 'Could not upload profile image.');
    } finally {
      setUploading(false);
    }
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-surface">
      <ScreenHeader title="Profile" />

    <ScrollView className="flex-1 bg-surface">

      <View className="px-4 mt-2 mb-6">
        <View className="rounded-lg p-6 items-center bg-surface-container">
          <View className="relative mb-4">
            {avatar ? (
              <Image source={{ uri: avatar }} className="w-20 h-20 rounded-full" />
            ) : (
              <View className="w-20 h-20 rounded-full items-center justify-center bg-primary-50">
                <Feather name="user" size={32} color={c.primary.DEFAULT} />
              </View>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={pickImage}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full items-center justify-center bg-primary"
            >
              <Feather name={uploading ? 'loader' : 'camera'} size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text className="text-headline-md text-on-surface mb-1">{user?.fullName || 'User'}</Text>
          {user?.email && (
            <Text className="text-body-md text-on-surface-variant">{user.email || 'No email provided'}</Text>
          )}
          {user?.phone && (
            <Text className="text-body-md text-on-surface-variant">{user.phone || 'No phone provided'}</Text>
          )}
        </View>
      </View>

      <View className="px-4 mb-6">
        <View className="rounded-lg bg-surface-container">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                if (item.label === 'Saved Address') router.push('/addresses');
                if (item.label === 'Settings') router.push('/settings');
                if (item.label === 'About KundaGo') router.push('/about');
                if (item.label === 'Help & Support') router.push('/help');
              }}
              className="flex-row items-center px-4 py-4"
            >
              <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 bg-primary-50">
                <Feather name={item.icon as any} size={20} color={c.primary.DEFAULT} />
              </View>
              <Text className="text-body-md font-semibold text-on-surface flex-1">{item.label}</Text>
              <Feather name="chevron-right" size={20} color={c.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="px-4 mb-8">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            logout();
            router.replace('/(auth)/sign-in');
          }}
          className="rounded-lg flex-row items-center justify-center px-4 py-4 bg-red-50"
        >
          <Feather name="log-out" size={20} color={c.error.DEFAULT} />
          <Text className="text-body-md font-bold ml-2 text-error">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <View className="h-6" />
    </ScrollView>
    </View>
  );
}
