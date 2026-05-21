import '@/global.css';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
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
            className="w-40 h-40 mb-1"
            style={{ resizeMode: 'cover' }}
          />
          <Text
            className='text-primary text-6xl font-extrabold mt-0'
          >
            <Text>Kunda</Text>
            <Text style={{ color: '#ef4444' }}>Go</Text>
          </Text>
          <Text
            className="text-lg font-bold text-center mt-4 text-secondary-900"
          >
            Shop Smart.{'\n'}Deliver <Text className='text-primary'>Fast</Text>.
          </Text>
        </View>

        {/* Middle Section - Illustration */}
        <View className="h-45">
          <Image
            source={require('@/assets/images/KundaGo banner.png')}
            className="w-full h-full"
            style={{ resizeMode: 'cover' }}
          />
        </View>

        {/* Bottom Section - Actions */}
        <View className="gap-4 pb-4">
          {/* Explore KundaGo Button */}
          <Link href="/(tabs)" asChild>
            <TouchableOpacity
              className="bg-primary rounded-lg py-4 items-center"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
                elevation: 3,
              }}
            >
              <Text
                className="text-xs font-bold text-white bg-primary"
                style={{ letterSpacing: 0.05 }}
              >
                Explore KundaGo
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Login / Sign Up Button */}
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity
              className="bg-white border border-secondary-200 rounded-lg py-4 items-center"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
                elevation: 2,
              }}
            >
              <Text
                className="text-xs font-bold text-primary"
                style={{ letterSpacing: 0.05 }}
              >
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
              <Text
                className="text-base font-semibold text-primary"
              >
                Continue as Guest
              </Text>
              <Text className="text-primary text-xl">→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
