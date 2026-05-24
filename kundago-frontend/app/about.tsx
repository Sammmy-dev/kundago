import '@/global.css';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const c = useThemeColors();

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <View className="px-4 pt-3 pb-3 bg-surface flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={c.onSurface} />
        </TouchableOpacity>
        <Text className="headline-md text-on-surface font-black flex-1">About KundaGo</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="items-center py-8">
          <Image
            source={require('@/assets/images/kungaGo_logo.png')}
            className="w-16 h-16 mb-4"
            resizeMode="contain"
          />
          <Text className="headline-md text-primary font-black mb-1">
            Kunda<Text style={{ color: '#ef4444' }}>Go</Text>
          </Text>
          <Text className="body-sm text-on-surface-variant mb-6">Version 1.0.0</Text>
        </View>

        <View className="bg-surface-container rounded-lg p-4 shadow-ambient mb-4">
          <Text className="body-md text-on-surface leading-6">
            KundaGo is your go-to delivery app for The Gambia. We connect you with
            everything you need — from fresh groceries and household electronics to
            construction materials and pharmacy essentials — delivered right to your
            doorstep.
          </Text>
        </View>

        <View className="bg-surface-container rounded-lg shadow-ambient mb-4">
          <View className="px-4 py-4 flex-row items-center gap-3">
            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center">
              <Feather name="map-pin" size={20} color={c.primary.DEFAULT} />
            </View>
            <View className="flex-1">
              <Text className="body-md font-bold text-on-surface">Location</Text>
              <Text className="body-sm text-on-surface-variant">The Gambia</Text>
            </View>
          </View>
          <View className="h-px bg-surface-variant mx-4" />
          <View className="px-4 py-4 flex-row items-center gap-3">
            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center">
              <Feather name="mail" size={20} color={c.primary.DEFAULT} />
            </View>
            <View className="flex-1">
              <Text className="body-md font-bold text-on-surface">Email</Text>
              <Text className="body-sm text-on-surface-variant">support@kundago.shop</Text>
            </View>
          </View>
          </View>

        <Text className="body-sm text-on-surface-variant text-center mb-8">
          © 2026 KundaGo. All rights reserved.
        </Text>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
