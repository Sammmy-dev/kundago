import '@/global.css';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useThemeColors } from '@/constants/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/lib/toast';

type Product = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const c = useThemeColors();
  const { q } = useLocalSearchParams<{ q: string }>();
  const [query, setQuery] = useState(q || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/products?search=${encodeURIComponent(searchTerm)}`);
      setProducts(res.data?.data?.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (q) {
      setQuery(q);
      fetchResults(q);
    }
  }, [q]);

  const handleSearch = () => {
    if (query.trim()) {
      router.setParams({ q: query.trim() });
      fetchResults(query.trim());
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }
    setAddingId(productId);
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      showToast('Added to cart');
    } catch {
      showToast('Failed to add', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const formatPrice = (price: number) => `D${price.toLocaleString()}`;

  const renderProduct = (item: Product) => (
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
        <Text className="body-md font-bold text-on-surface mb-1" numberOfLines={2}>
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
      <View className="px-4 pt-3 pb-3 bg-surface flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={c.onSurface} />
        </TouchableOpacity>
        <View className="flex-row items-center bg-surface-container rounded-lg px-4 py-2.5 gap-2 flex-1 shadow-ambient">
          <Feather name="search" size={18} color={c.onSurfaceVariant} />
          <TextInput
            className="flex-1 text-sm text-on-surface"
            placeholder="Search products..."
            placeholderTextColor={c.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setProducts([]); }}>
              <Feather name="x" size={16} color={c.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary.DEFAULT} size="large" />
        </View>
      ) : q && products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Feather name="search" size={28} color={c.primary.DEFAULT} />
          </View>
          <Text className="headline-md text-on-surface font-black mb-2">No results found</Text>
          <Text className="body-md text-on-surface-variant text-center">
            No products match "{q}"
          </Text>
        </View>
      ) : !q ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Feather name="search" size={28} color={c.primary.DEFAULT} />
          </View>
          <Text className="headline-md text-on-surface font-black mb-2">Search Products</Text>
          <Text className="body-md text-on-surface-variant text-center">
            Type above to search for products
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4">
          <Text className="headline-md text-on-surface font-black mb-4">
            Results for "{q}"
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {products.map((item) => (
              <View key={item._id} className="w-[48%]">
                {renderProduct(item)}
              </View>
            ))}
          </View>
          <View className="h-6" />
        </ScrollView>
      )}
    </View>
  );
}
