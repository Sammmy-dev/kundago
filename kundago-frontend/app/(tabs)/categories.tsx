import '@/global.css';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useThemeColors } from '@/constants/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/lib/toast';
import { useCartCount } from '@/lib/stores/cartCount';
import { ScreenHeader } from '@/components/ScreenHeader';

type Product = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
};

const categoryImages: Record<string, any> = {
  Groceries: require('@/assets/images/groceries.png'),
  'Household/Electronics': require('@/assets/images/household-electtonics.png'),
  Construction: require('@/assets/images/construction.png'),
  'Personal Care': require('@/assets/images/pharmacy-health.png'),
};

const categoryIcons: Record<string, string> = {
  Groceries: 'shopping-cart',
  'Household/Electronics': 'zap',
  Construction: 'tool',
  'Personal Care': 'heart',
};

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const c = useThemeColors();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const categories = Object.keys(categoryImages);
  const chipCategories = ['All', ...categories];

  const fetchProducts = useCallback(async (pageNum: number, category?: string, replace = true) => {
    if (replace) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const url = category ? `/products/category/${encodeURIComponent(category)}` : '/products';
      const res = await api.get(url, { params: { page: pageNum, limit: 20 } });
      const newProducts = res.data?.data?.products || [];
      if (replace) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      setHasMore(res.data?.hasMore ?? false);
      setPage(pageNum);
    } catch {
      if (replace) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, selectedCategory || undefined, true);
  }, [selectedCategory, fetchProducts]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1, selectedCategory || undefined, false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchProducts(1, selectedCategory || undefined, true);
    setRefreshing(false);
  }, [selectedCategory, fetchProducts]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const formatPrice = (price: number) => `D${price.toLocaleString()}`;

  const addToCart = async (productId: string) => {
    if (!user) {
      Alert.alert('Login required', 'Please sign in to add items');
      router.push('/(auth)/sign-in');
      return;
    }
    setAddingId(productId);
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      useCartCount.getState().setCount(useCartCount.getState().count + 1);
      showToast('Added to cart');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add');
    } finally {
      setAddingId(null);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${item._id}`)}
      className="bg-surface-container rounded-lg shadow-ambient overflow-hidden"
    >
      <Image
        source={item.images?.[0] ? { uri: item.images[0] } : undefined}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="body-md font-bold text-on-surface mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="body-md text-primary font-black">{formatPrice(item.price)}</Text>
          <TouchableOpacity
            onPress={() => addToCart(item._id)}
            disabled={addingId === item._id}
            className="w-7 h-7 bg-primary rounded-lg items-center justify-center"
          >
            <Feather name={addingId === item._id ? 'loader' : 'plus'} size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <ScreenHeader title="Categories">
        <View className="flex-row items-center bg-surface-container rounded-lg px-4 py-3 gap-3">
          <Feather name="search" size={20} color={c.onSurfaceVariant} />
          <TextInput
            className="flex-1 text-sm text-on-surface"
            placeholder="Search products..."
            placeholderTextColor={c.onSurfaceVariant}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </ScreenHeader>

      <View className="px-4 py-3">
        <FlatList
          data={chipCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
          renderItem={({ item }) => {
            const active = item === 'All' ? selectedCategory === null : selectedCategory === item;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(item === 'All' ? null : selectedCategory === item ? null : item)}
                className={`rounded-lg px-4 py-2 ${active ? 'bg-primary' : 'bg-surface-container shadow-ambient'}`}
              >
                <Text className={`label-sm font-bold ${active ? 'text-white' : 'text-on-surface'}`}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item}
        />
      </View>

      {loading ? (
        <View className="py-10 items-center">
          <ActivityIndicator color={c.primary.DEFAULT} size="large" />
        </View>
      ) : (
        <FlatList
          className="flex-1 px-4"
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="w-[48%] mb-3">
              {renderProduct({ item })}
            </View>
          )}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListHeaderComponent={
            <Text className="headline-md text-on-surface font-black mb-4 pt-2">
              {selectedCategory || 'All Products'}
            </Text>
          }
          ListEmptyComponent={
            <View className="py-10 items-center">
              <Feather name="package" size={40} color={c.onSurfaceVariant} />
              <Text className="body-md text-on-surface-variant mt-3">
                {searchText ? 'No products match your search' : 'No products yet'}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator color={c.primary.DEFAULT} size="small" />
              </View>
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
}
