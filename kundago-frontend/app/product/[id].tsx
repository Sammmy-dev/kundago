import '@/global.css';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, FlatList, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useThemeColors } from '@/constants/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { useCartCount } from '@/lib/stores/cartCount';
import { useToast } from '@/lib/toast';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const c = useThemeColors();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const imageListRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();
  const cartCount = useCartCount((s) => s.count);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data?.data?.product);
      } catch {
        Alert.alert('Error', 'Product not found');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please sign in to add items to cart');
      router.push('/(auth)/sign-in');
      return;
    }
    setAdding(true);
    try {
      await api.post('/cart/add', { productId: id, quantity });
      useCartCount.getState().setCount(useCartCount.getState().count + 1);
      showToast('Added to cart');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color={c.primary.DEFAULT} size="large" />
      </View>
    );
  }

  if (!product) return null;

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <View className="relative">
        <FlatList
          ref={imageListRef}
          data={product.images?.length ? product.images : ['']}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          renderItem={({ item }) => (
            <Image
              source={item ? { uri: item } : undefined}
              style={{ width, height: 288 }}
              resizeMode="cover"
            />
          )}
          keyExtractor={(_, i) => String(i)}
        />
        {product.images && product.images.length > 1 && (
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
            {product.images.map((_, i) => (
              <View
                key={i}
                className={`rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                style={{ width: 8, height: 8 }}
              />
            ))}
          </View>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ top: 20 }}
          className="absolute left-4 w-10 h-10 bg-surface rounded-full items-center justify-center shadow-ambient"
        >
          <Feather name="arrow-left" size={22} color={c.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/cart')}
          style={{ top: 20 }}
          className="absolute right-4 w-10 h-10 bg-surface rounded-full items-center justify-center shadow-ambient"
        >
          <Feather name="shopping-cart" size={18} color={c.onSurface} />
          {cartCount > 0 && (
            <View className="absolute -top-1 -right-1 w-[14px] h-[14px] bg-primary rounded-full items-center justify-center px-0.5">
              <Text className="text-white text-[8px] font-bold">{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="headline-md text-on-surface font-black mb-2">{product.name}</Text>
        <Text className="display-lg-mobile text-primary font-black mb-4">
          D{product.price.toLocaleString()}
        </Text>

        <View className="flex-row items-center gap-2 mb-4">
          <View className={`px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-primary-50' : 'bg-red-50'}`}>
            <Text className={`label-sm font-bold ${product.stock > 0 ? 'text-primary' : 'text-error'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </Text>
          </View>
        </View>

        {product.description && (
          <>
            <Text className="label-sm text-on-surface-variant mb-2">DESCRIPTION</Text>
            <Text className="body-md text-on-surface mb-6 leading-6">{product.description}</Text>
          </>
        )}

        {product.stock > 0 && (
          <View className="flex-row items-center gap-4 mb-6">
            <Text className="label-sm text-on-surface-variant">Quantity</Text>
            <View className="flex-row items-center bg-surface-container rounded-lg shadow-ambient">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 items-center justify-center"
              >
                <Feather name="minus" size={18} color={c.primary.DEFAULT} />
              </TouchableOpacity>
              <Text className="body-md font-bold text-on-surface w-10 text-center">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 items-center justify-center"
              >
                <Feather name="plus" size={18} color={c.primary.DEFAULT} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={addToCart}
          disabled={adding || product.stock === 0}
          className={`rounded-lg py-4 flex-row items-center justify-center gap-2 mb-8 ${
            product.stock > 0 ? 'bg-primary shadow-ambient' : 'bg-gray-300'
          }`}
        >
          <Feather name="shopping-cart" size={18} color={product.stock > 0 ? '#ffffff' : '#94a3b8'} />
          <Text className="label-sm font-bold text-white">
            {adding ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
