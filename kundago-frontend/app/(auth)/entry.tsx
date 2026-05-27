import '@/global.css';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
export default function EntryScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-surface"
    >
      <View
        className="flex-1 px-6 pt-10 pb-6 justify-center gap-2.5"
      >
        {/* Top Section - Brand */}
        <View className="items-center pt-2.5">
          <Image
            source={require('@/assets/images/kungaGo_logo.png')}
            className="w-40 h-40 "
            style={{ resizeMode: 'cover' }}
          />
          <Text className='text-6xl mb-0 font-extrabold mt-0 text-primary'>
            <Text>Kunda</Text>
            <Text style={{ color: '#ef4444' }}>Go</Text>
          </Text>
          <Text className="text-body-lg font-bold text-center -mt-3 mb-4 text-on-surface">
            Shop Smart. Deliver <Text className="text-primary">Fast</Text>.
          </Text>
        </View>

        {/* Middle Section - Illustration */}
        <View className="h-45 mb-6">
          <Image
            source={require('@/assets/images/KundaGo banner.png')}
            className="w-full h-full"
            style={{ resizeMode: 'cover', borderRadius: 12 }}
          />
        </View>

        {/* Bottom Section - Actions */}
        <View className="gap-4 pb-4">
          {/* Login / Sign Up Button */}
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity
              className="rounded-lg py-4 items-center bg-surface-container border border-surface-variant shadow-ambient"
            >
              <Text className="text-label-sm text-primary">
                Login / Sign Up
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Continue as Guest Link */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="items-center py-3"
          >
            <View className="flex-row items-center gap-1">
              <Text className="text-body-md font-semibold text-primary">
                Continue as Guest
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#006e2f" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
