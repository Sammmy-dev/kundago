import '@/global.css';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useThemeColors } from '@/constants/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { ScreenHeader } from '@/components/ScreenHeader';

type OrderItem = {
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  quantity: number;
  priceAtTime: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryAddress: string;
  createdAt: string;
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  DELIVERED: { bg: '#d1fae5', text: '#065f46' },
};

const PAYMENT_ICONS: Record<string, string> = {
  COD: 'dollar-sign',
  STRIPE: 'credit-card',
  WAVE: 'smartphone',
};

const PAYMENT_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  STRIPE: 'Card Payment',
  WAVE: 'Wave',
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const c = useThemeColors();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/orders');
      setOrders(res.data?.data?.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatId = (id: string) => `#KG-${id.slice(-4).toUpperCase()}`;

  if (!user) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 items-center justify-center px-4 bg-surface">
        <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-primary-50">
          <Feather name="package" size={28} color={c.primary.DEFAULT} />
        </View>
        <Text className="text-headline-md text-on-surface mb-2">Sign in to view orders</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(auth)/sign-in')} className="rounded-lg px-6 py-3 bg-primary">
          <Text className="text-body-md font-bold text-white">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-surface">
      <ScreenHeader title="Orders" showBell={false} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary.DEFAULT} size="large" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-primary-50">
            <Feather name="package" size={28} color={c.primary.DEFAULT} />
          </View>
          <Text className="text-headline-md text-on-surface mb-2">No orders yet</Text>
          <Text className="text-body-md text-on-surface-variant text-center mb-6">
            Browse products and place your first order
          </Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)')} className="rounded-lg px-6 py-3 bg-primary">
            <Text className="text-body-md font-bold text-white">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 bg-surface" contentContainerStyle={{ paddingBottom: 24 }}>
          {orders.map((order) => {
            return (
              <TouchableOpacity
                key={order._id}
                activeOpacity={0.8}
                onPress={() => router.push(`/order/${order._id}`)}
                className="rounded-lg p-4 mb-3 bg-surface-container"
              >
                {/* Header row */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-2">
                    <Feather name="shopping-bag" size={18} color={c.primary.DEFAULT} />
                    <Text className="text-body-md font-bold text-on-surface">{formatId(order._id)}</Text>
                  </View>
                  <Text className="text-label-sm text-on-surface-variant">{formatDate(order.createdAt)}</Text>
                </View>

                {/* Items */}
                {order.items.slice(0, 2).map((item, i) => (
                  <View key={`${order._id}-${i}`} className="flex-row items-center gap-3 mb-2">
                    <Image
                      source={item.productId.images?.[0] ? { uri: item.productId.images[0] } : undefined}
                      className="w-12 h-12 rounded-lg"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-label-sm font-bold text-on-surface" numberOfLines={1}>{item.productId.name}</Text>
                      <Text className="text-label-sm text-on-surface-variant">D{item.priceAtTime.toLocaleString()} × {item.quantity}</Text>
                    </View>
                    <Text className="text-label-sm font-bold text-primary">D{(item.priceAtTime * item.quantity).toLocaleString()}</Text>
                  </View>
                ))}
                {order.items.length > 2 && (
                  <Text className="text-label-sm font-bold text-primary mb-2">+{order.items.length - 2} more</Text>
                )}

                {/* Bottom row */}
                <View className="flex-row justify-between items-center pt-3 mt-1">
                  <View className="flex-row items-center gap-2">
                    <View className="w-6 h-6 rounded-full items-center justify-center bg-primary-50">
                      <Feather name={PAYMENT_ICONS[order.paymentMethod] || 'dollar-sign'} size={12} color={c.primary.DEFAULT} />
                    </View>
                    <Text className="text-label-sm text-on-surface">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</Text>
                  </View>
                  <View style={{ backgroundColor: STATUS_STYLES[order.orderStatus]?.bg || '#e5e7eb' }} className="px-2.5 py-1 rounded-full">
                    <Text style={{ color: STATUS_STYLES[order.orderStatus]?.text || '#374151' }} className="text-xs font-bold">
                      {order.orderStatus}
                    </Text>
                  </View>
                </View>

                {/* Total */}
                <View className="flex-row justify-end items-center mt-2 pt-2">
                  <Text className="text-body-md font-bold text-on-surface">Total: </Text>
                  <Text className="text-body-lg font-black text-primary">D{order.totalAmount.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View className="h-6" />
        </ScrollView>
      )}
    </View>
  );
}
