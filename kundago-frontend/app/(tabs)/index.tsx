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
  { id: 4, name: 'Pharmacy & Health', image: require('@/assets/images/pharmacy-health.png') },
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
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <View className="px-4 pt-4 pb-3 bg-surface">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <Image
              source={require("@/assets/images/kungaGo_logo.png")}
              className="w-9 h-9"
              resizeMode="contain"
            />
            <Text className="headline-md text-primary">
              <Text>Kunda</Text>
              <Text style={{ color: "#ef4444" }}>Go</Text>
            </Text>
          </View>
          {/* <TouchableOpacity className="relative">
            <Feather name="bell" size={24} color="#191c1e" />
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity> */}
        </View>

        <View className="mb-4 px-2">
          <Text className="body-md font-semibold text-on-surface">
            Welcome <Text className="body-md font-semibold">{firstName}</Text>
          </Text>
        </View>

        <View className="relative">
          <View className="flex-row items-center bg-surface-container rounded-lg px-4 py-3 gap-3">
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
            <View className="absolute top-full left-0 right-0 bg-surface-container rounded-b-lg shadow-ambient z-50">
              {suggestions.map((item, i) => (
                <TouchableOpacity
                  key={item._id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowSuggestions(false);
                    router.push(`/product/${item._id}`);
                  }}
                  className={`flex-row items-center gap-3 px-4 py-3 ${i < suggestions.length - 1 ? 'border-b border-surface-variant' : ''}`}
                >
                  <Feather name="search" size={16} color={c.onSurfaceVariant} />
                  <View className="flex-1">
                    <Text className="body-md text-on-surface" numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text className="body-sm text-primary font-semibold">D{item.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSearchSubmit}
                className="flex-row items-center justify-center gap-2 px-4 py-3 bg-primary-50 rounded-b-lg"
              >
                <Feather name="search" size={14} color={c.primary.DEFAULT} />
                <Text className="label-sm text-primary font-bold">View all results</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

    <ScrollView className="bg-surface flex-1">

      <View className="mx-4 mt-5 mb-2">
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
                style={{ height: 180, resizeMode: "cover" }}
              />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />

        <View className="flex-row justify-center gap-2 mt-3">
          {banners.map((_, index) => (
            <View
              key={index}
              className={`${
                currentBanner === index
                  ? "w-6 bg-primary"
                  : "w-2 bg-on-surface-variant"
              } h-2 rounded-full transition-all`}
            />
          ))}
        </View>
      </View>

      <View className="px-4 mt-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="headline-md text-on-surface font-black">
            Categories
          </Text>
          <TouchableOpacity onPress={() => router.push('/categories')} className="flex-row items-center gap-1">
            <Text
              className="text-sm font-bold text-primary"
              style={{ fontFamily: "Hanken Grotesk" }}
            >
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
              className="w-[48%] bg-surface-container rounded-lg p-4 items-center shadow-ambient flex-row gap-3"
            >
              <Image source={category.image} className="w-10 h-10" resizeMode="contain" />
              <Text
                className="label-sm text-on-surface text-center font-bold flex-1"
                style={{ lineHeight: 14 }}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="headline-md text-on-surface font-black">
            Popular
          </Text>
          <TouchableOpacity className="flex-row items-center gap-1">
            <Text className="text-sm font-bold text-primary">See more</Text>
            <Feather name="arrow-right" size={12} color={c.primary.DEFAULT} />
          </TouchableOpacity>
        </View>

        <FlatList
          className="bg-surface p-2"
          data={popularItems}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-surface-container rounded-lg p-3 mr-3  shadow-ambient"
              style={{
                width: 150,
              }}
            >
              <View
                className="rounded-lg p-4 bg-secondary-100 items-center mb-3 justify-center"
                style={{
                  minHeight: 100,
                }}
              >
                <Feather name={item.icon as any} size={32} color={c.primary.DEFAULT} />
              </View>
              <Text
                className="label-sm text-on-surface font-bold mb-1 text-left"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="body-md text-primary font-black">
                  {item.price}
                </Text>
                <TouchableOpacity className="w-7 h-7 bg-primary-500 rounded-lg items-center justify-center">
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

      <View className="h-6" />
    </ScrollView>
    </View>
  );
}
