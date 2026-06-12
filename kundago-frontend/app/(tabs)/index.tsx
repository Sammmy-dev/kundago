import '@/global.css';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TextInput, TouchableOpacity, FlatList, Image, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useThemeColors } from '@/constants/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
const banners = [
  { id: 1, source: require('@/assets/images/KundaGo banner.png') },
  { id: 2, source: require('@/assets/images/KundaGo banner.png') },
  { id: 3, source: require('@/assets/images/KundaGo banner.png') },
  { id: 4, source: require('@/assets/images/KundaGo banner.png') },
];

const categories = [
  { id: 1, name: 'Groceries', image: require('@/assets/images/groceries.png') },
  { id: 2, name: 'Household/Electronics', image: require('@/assets/images/household-electtonics.png') },
  { id: 3, name: 'Construction', image: require('@/assets/images/construction.png') },
  { id: 4, name: 'Personal Care', image: require('@/assets/images/pharmacy-health.png') },
];

const popularItems = [
  { id: 1, name: 'Fresh Produce', price: 'D5,000', icon: 'package' },
  { id: 2, name: 'Premium Fabrics', price: 'D8,500', icon: 'package' },
  { id: 3, name: 'Beauty Kits', price: 'D3,200', icon: 'package' },
  { id: 4, name: 'Power Tools', price: 'D12,000', icon: 'package' },
  { id: 5, name: 'Home Essentials', price: 'D6,800', icon: 'package' },
  { id: 6, name: 'Electronics Kit', price: 'D4,500', icon: 'package' },
];

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const c = useThemeColors();
  const firstName = user?.fullName?.split(' ')[0] || 'to kundaGo';
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<{ _id: string; name: string; price: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const { showToast } = useToast();
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();

  const autoScroll = useCallback(() => {
    const nextIndex = (currentBanner + 1) % banners.length;
    bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentBanner(nextIndex);
  }, [currentBanner]);

  useEffect(() => {
    const timer = setInterval(autoScroll, 4000);
    return () => clearInterval(timer);
  }, [autoScroll]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchText.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchText)}&limit=5`);
        setSuggestions(res.data?.data?.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchText]);

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-surface">
      <View className="px-4 pt-4 pb-3 bg-surface">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <Image
              source={require("@/assets/images/kungaGo_logo.png")}
              className="w-9 h-9"
              resizeMode="contain"
            />
            <Text className="text-headline-md text-primary">
              <Text>Kunda</Text>
              <Text style={{ color: "#ef4444" }}>Go</Text>
            </Text>
          </View>
        </View>

        <View className="mb-4 px-2">
          <Text className="text-body-md font-semibold text-on-surface">
            Welcome <Text className="text-body-md font-semibold">{firstName}</Text>
          </Text>
        </View>

        <View className="relative">
          <View className="flex-row items-center rounded-lg px-4 py-3 gap-3 bg-surface-container">
            <Feather name="search" size={20} color={c.onSurfaceVariant} />
            <TextInput
              className="flex-1 text-sm text-on-surface"
              placeholder="Search KundaGo..."
              placeholderTextColor={c.onSurfaceVariant}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchText(''); setSuggestions([]); setShowSuggestions(false); }}>
                <Feather name="x" size={18} color={c.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
          {showSuggestions && suggestions.length > 0 && (
            <View className="absolute top-full left-0 right-0 rounded-b-lg z-50 shadow-ambient bg-surface-container">
              {suggestions.map((item, i) => (
                <TouchableOpacity
                  key={item._id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowSuggestions(false);
                    router.push(`/product/${item._id}`);
                  }}
                  className="flex-row items-center gap-3 px-4 py-3"
                  style={i < suggestions.length - 1 ? { borderBottomWidth: 1, borderColor: c.surfaceVariant } : undefined}
                >
                  <Feather name="search" size={16} color={c.onSurfaceVariant} />
                  <View className="flex-1">
                    <Text className="text-body-md text-on-surface" numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text className="text-label-sm font-semibold text-primary">D{item.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSearchSubmit}
                className="flex-row items-center justify-center gap-2 px-4 py-3 rounded-b-lg bg-primary-50"
              >
                <Feather name="search" size={14} color={c.primary.DEFAULT} />
                <Text className="text-label-sm font-bold text-primary">View all results</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 24 }}>

      <View className="mx-4 mt-5 mb-2 relative">
        <FlatList
          ref={bannerRef}
          data={banners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={width - 32}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / (width - 32),
            );
            setCurrentBanner(index);
          }}
          renderItem={({ item }) => (
            <View style={{ width: width - 32 }}>
              <Image
                source={item.source}
                className="w-full rounded-xl"
          style={{ height: 180, resizeMode: "contain" }}
              />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />

        <View className="absolute bottom-5 left-0 right-0 flex-row justify-center gap-2">
          {banners.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full transition-all"
              style={{
                width: currentBanner === index ? 24 : 8,
                backgroundColor: currentBanner === index ? c.primary.DEFAULT : c.onSurfaceVariant,
              }}
            />
          ))}
        </View>
      </View>

      <View className="px-4 mt-4 mb-6">
        <View className="flex-row bg-surface-container rounded-lg">
          <View className="flex-1 flex-row items-center gap-3 px-3 py-3">
            <Feather name="truck" size={15} color={c.primary.DEFAULT} />
            <Text className="text-[6px] font-semibold text-on-surface flex-1">
              Same-day or next-day delivery
            </Text>
          </View>
          <View className="w-px bg-surface" />
          <View className="flex-1 flex-row items-center gap-3 px-3 py-3">
            <Feather name="shield" size={15} color={c.primary.DEFAULT} />
            <Text className="text-[6px] font-semibold text-on-surface flex-1">
              Secure payments
            </Text>
          </View>
          <View className="w-px bg-surface" />
          <View className="flex-1 flex-row items-center gap-3 px-3 py-3">
            <Feather name="users" size={15} color={c.primary.DEFAULT} />
            <Text className="text-[6px] font-semibold text-on-surface flex-1">
              Trusted by Gambian families
            </Text>
          </View>
          <View className="w-px bg-surface" />
          <View className="flex-1 flex-row items-center gap-3 px-3 py-3">
            <Feather name="headphones" size={15} color={c.primary.DEFAULT} />
            <Text className="text-[6px] font-semibold text-on-surface flex-1">
              24/7 Customer support
            </Text>
          </View>
        </View>
      </View>

      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-headline-md text-on-surface">
            Categories
          </Text>
          <TouchableOpacity onPress={() => router.push('/categories')} className="flex-row items-center gap-1">
            <Text className="text-sm font-bold text-primary">
              View all
            </Text>
            <Feather name="arrow-right" size={12} color={c.primary.DEFAULT} />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap gap-3 justify-between">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/categories?category=${encodeURIComponent(category.name)}`)}
              className="w-[48%] rounded-lg p-4 items-center flex-row gap-3 bg-surface-container"
            >
              <Image source={category.image} className="w-10 h-10" resizeMode="contain" />
              <Text
                className="text-center font-bold flex-1 text-label-sm text-on-surface"
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-headline-md text-on-surface">
            Popular
          </Text>
          <TouchableOpacity className="flex-row items-center gap-1">
            <Text className="text-sm font-bold text-primary">See more</Text>
            <Feather name="arrow-right" size={12} color={c.primary.DEFAULT} />
          </TouchableOpacity>
        </View>

        <FlatList
          className="p-2 bg-surface"
          data={popularItems}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="rounded-lg p-3 mr-3 bg-surface-container"
              style={{ width: 150 }}
            >
              <View
                className="rounded-lg p-4 items-center mb-3 justify-center bg-secondary-100"
                style={{ minHeight: 100 }}
              >
                <Feather name={item.icon as any} size={32} color={c.primary.DEFAULT} />
              </View>
              <Text
                className="font-bold mb-1 text-left text-label-sm text-on-surface"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-body-md font-black text-primary">
                  {item.price}
                </Text>
                <TouchableOpacity className="w-7 h-7 rounded-lg items-center justify-center bg-primary-500">
                  <Feather name="plus" size={14} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
        />
      </View>

      <View className="px-4 mb-6">
        <Image
          source={require('@/assets/images/Banner-2.png')}
          className="w-full rounded-lg"
          style={{ height: 100, resizeMode: "contain" }}
        />
      </View>

      <View className="h-6" />
    </ScrollView>
    </View>
  );
}
