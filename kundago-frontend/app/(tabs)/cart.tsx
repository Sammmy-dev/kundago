import '@/global.css';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useThemeColors } from '@/constants/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { useCartCount } from '@/lib/stores/cartCount';
import { ScreenHeader } from '@/components/ScreenHeader';

type CartItem = {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  } | null;
  quantity: number;
  priceAtTime: number;
};

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const setCount = useCartCount((s) => s.setCount);
  const c = useThemeColors();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/cart');
      const cart = res.data?.data?.cart;
      const items = cart?.items || [];
      setItems(items);
      setDeliveryFee(cart?.deliveryFee || 0);
      setTotal(cart?.grandTotal || cart?.totalAmount || 0);
      setCount(items.length);
    } catch {
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, setCount]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const updateQuantity = async (productId: string, quantity: number) => {
    setUpdating(productId);
    try {
      await api.put('/cart/update', { productId, quantity });
      fetchCart();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = (productId: string) => {
    Alert.alert('Remove Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/cart/remove/${productId}`);
            fetchCart();
          } catch {
            Alert.alert('Error', 'Failed to remove item');
          }
        },
      },
    ]);
  };

  const formatPrice = (price: number) => `D${price.toLocaleString()}`;

  const renderItem = ({ item }: { item: CartItem }) => {
    const product = item.productId;
    return (
      <View className="bg-surface-container rounded-lg p-4 mb-3 shadow-ambient flex-row">
        <View className="flex-row flex-1 gap-3">
          <Image
            source={product?.images?.[0] ? { uri: product.images[0] } : undefined}
            className="w-20 h-20 rounded-lg"
            resizeMode="cover"
          />
          <View className="flex-1 justify-between">
            <Text className="body-md font-bold text-on-surface" numberOfLines={2}>{product?.name || 'Unavailable'}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="body-sm text-on-surface-variant">{formatPrice(item.priceAtTime)} × {item.quantity}</Text>
              <Text className="body-md text-primary font-black">{formatPrice(item.priceAtTime * item.quantity)}</Text>
            </View>

            <View className="flex-row items-center bg-surface rounded-lg self-start">
              <TouchableOpacity
                onPress={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                disabled={updating === product._id}
                className="w-8 h-8 items-center justify-center"
              >
                <Feather name="minus" size={16} color={c.primary.DEFAULT} />
              </TouchableOpacity>
              <Text className="body-md font-bold text-on-surface w-8 text-center">{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(product._id, Math.min(product.stock, item.quantity + 1))}
                disabled={updating === product._id}
                className="w-8 h-8 items-center justify-center"
              >
                <Feather name="plus" size={16} color={c.primary.DEFAULT} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => removeItem(product._id)} className="ml-2">
          <Feather name="trash-2" size={18} color={c.error.DEFAULT} />
        </TouchableOpacity>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={{ paddingTop: insets.top }} className="bg-surface flex-1 items-center justify-center px-4">
        <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
          <Feather name="shopping-cart" size={28} color={c.primary.DEFAULT} />
        </View>
        <Text className="headline-md text-on-surface font-black mb-2">Sign in to view cart</Text>
        <Text className="body-md text-on-surface-variant text-center mb-6">
          Please sign in to see items in your cart
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/sign-in')}
          className="bg-primary rounded-lg px-6 py-3"
        >
          <Text className="body-md font-bold text-white">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <ScreenHeader title="Cart" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary.DEFAULT} size="large" />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Feather name="shopping-cart" size={28} color={c.primary.DEFAULT} />
          </View>
          <Text className="headline-md text-on-surface font-black mb-2">Your cart is empty</Text>
          <Text className="body-md text-on-surface-variant text-center mb-6">
            Browse products and add items to your cart
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)')}
            className="bg-primary rounded-lg px-6 py-3"
          >
            <Text className="body-md font-bold text-white">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, i) => item.productId?._id || `cart-${i}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        />
      )}

      {items.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-surface-container px-4 py-4 shadow-ambient">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="body-sm text-on-surface-variant">Delivery fee</Text>
            <Text className="body-sm text-on-surface-variant">{formatPrice(deliveryFee)}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="body-md text-on-surface-variant font-semibold">Total</Text>
            <Text className="headline-md text-primary font-black">{formatPrice(total)}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/checkout')}
            className="bg-primary rounded-lg py-4 items-center shadow-ambient"
          >
            <Text className="label-sm font-bold text-white">Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
