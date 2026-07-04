import '@/global.css';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useThemeColors } from '@/constants/theme';
import { api } from '@/lib/api';

type OrderItem = {
  productId: {
    _id: string;
    name: string;
    images: string[];
  } | null;
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

const PAYMENT_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  PAID: { bg: '#d1fae5', text: '#065f46' },
  FAILED: { bg: '#fee2e2', text: '#991b1b' },
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

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useThemeColors();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data?.data?.order);
      } catch {
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatId = (oid: string) => `#KG-${oid.slice(-4).toUpperCase()}`;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color={c.primary.DEFAULT} size="large" />
      </View>
    );
  }

  if (!order) return null;

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <View className="px-4 pt-3 pb-3 bg-surface flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={c.onSurface} />
        </TouchableOpacity>
        <Text className="headline-md text-on-surface font-black flex-1">Order {formatId(order._id)}</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Status badges */}
        <View className="flex-row gap-2 mb-4">
          <View style={{ backgroundColor: STATUS_STYLES[order.orderStatus]?.bg || '#e5e7eb' }} className="px-3 py-1.5 rounded-full">
            <Text style={{ color: STATUS_STYLES[order.orderStatus]?.text || '#374151' }} className="label-sm font-bold">
              Order: {order.orderStatus}
            </Text>
          </View>
          <View style={{ backgroundColor: PAYMENT_STATUS_STYLES[order.paymentStatus]?.bg || '#e5e7eb' }} className="px-3 py-1.5 rounded-full">
            <Text style={{ color: PAYMENT_STATUS_STYLES[order.paymentStatus]?.text || '#374151' }} className="label-sm font-bold">
              Payment: {order.paymentStatus}
            </Text>
          </View>
        </View>

        {/* Order info */}
        <View className="bg-surface-container rounded-lg p-4 shadow-ambient mb-4">
          <Text className="label-sm text-on-surface-variant font-bold mb-3">ORDER INFO</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="body-md text-on-surface-variant">Date</Text>
            <Text className="body-md text-on-surface font-semibold">{formatDate(order.createdAt)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="body-md text-on-surface-variant">Time</Text>
            <Text className="body-md text-on-surface font-semibold">{formatTime(order.createdAt)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="body-md text-on-surface-variant">Payment</Text>
            <Text className="body-md text-on-surface font-semibold">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="body-md text-on-surface-variant">Order ID</Text>
            <Text className="body-md text-on-surface font-semibold">{formatId(order._id)}</Text>
          </View>
        </View>

        {/* Delivery address */}
        <View className="bg-surface-container rounded-lg p-4 shadow-ambient mb-4">
          <Text className="label-sm text-on-surface-variant font-bold mb-3">DELIVERY ADDRESS</Text>
          <Text className="body-md text-on-surface">{order.deliveryAddress}</Text>
        </View>

        {/* Items */}
        <View className="bg-surface-container rounded-lg p-4 shadow-ambient mb-4">
          <Text className="label-sm text-on-surface-variant font-bold mb-3">ITEMS ({order.items.length})</Text>
          {order.items.map((item, i) => (
            <View key={i} className={`flex-row items-center gap-3 ${i < order.items.length - 1 ? 'mb-3 pb-3' : ''}`}>
              <Image
                source={item.productId?.images?.[0] ? { uri: item.productId.images[0] } : undefined}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="body-md font-bold text-on-surface" numberOfLines={2}>{item.productId?.name || 'Unavailable'}</Text>
                <Text className="body-sm text-on-surface-variant">D{item.priceAtTime.toLocaleString()} × {item.quantity}</Text>
              </View>
              <Text className="body-md font-bold text-primary">D{(item.priceAtTime * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View className="bg-surface-container rounded-lg p-4 shadow-ambient mb-6">
          <View className="flex-row justify-between items-center">
            <Text className="body-md text-on-surface-variant font-semibold">Total Amount</Text>
            <Text className="headline-md text-primary font-black">D{order.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
