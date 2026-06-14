import '@/global.css';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Modal, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { useThemeColors } from '@/constants/theme';
import { useThemeStore } from '@/lib/stores/theme';
import { useAuthStore } from '@/lib/stores/auth';
import { useStripe } from '@stripe/stripe-react-native';

type CartItem = {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
  quantity: number;
  priceAtTime: number;
};

type Address = {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
};

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery', icon: 'dollar-sign' as const, desc: 'Pay when you receive your order' },
  { value: 'STRIPE', label: 'Card Payment', icon: 'credit-card' as const, desc: 'Pay securely with Visa/Mastercard' },
  { value: 'WAVE', label: 'Wave', icon: 'smartphone' as const, desc: 'Pay with Wave mobile money' },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.isDark);
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', address: '', landmark: '' });

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      const cart = res.data?.data?.cart;
      setItems(cart?.items || []);
      setDeliveryFee(cart?.deliveryFee || 0);
      setTotal(cart?.grandTotal || cart?.totalAmount || 0);
    } catch {
      setItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data?.data?.addresses || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, [fetchCart, fetchAddresses]);

  const saveAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.address) {
      Alert.alert('Required', 'Full name, phone, and address are required');
      return;
    }
    try {
      const res = await api.post('/addresses', addressForm);
      const newAddr = res.data?.data?.address;
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddress(newAddr);
      setShowAddressForm(false);
      setAddressForm({ fullName: '', phone: '', address: '', landmark: '' });
      showToast('Address saved');
    } catch {
      showToast('Failed to save address', 'error');
    }
  };

  const WAVE_PAYMENT_URL = 'https://pay.wave.com/m/M_gm_AQGSLEdlneyq/c/gm/';

  const placeOrder = async () => {
    if (!user?.isVerified) {
      Alert.alert('Email not verified', 'Please verify your email before placing an order.');
      return;
    }
    if (!selectedAddress) {
      Alert.alert('Delivery Address', 'Please select or add a delivery address');
      return;
    }
    setPlacing(true);
    try {
      const deliveryAddress = [
        selectedAddress.fullName,
        selectedAddress.phone,
        selectedAddress.address,
        selectedAddress.landmark,
      ].filter(Boolean).join(', ');
      const orderRes = await api.post('/orders/checkout', {
        paymentMethod,
        deliveryAddress,
      });
      const orderId = orderRes.data?.data?.order?._id;

      if (paymentMethod === 'STRIPE' && orderId) {
        const paymentRes = await api.post('/payments/stripe/initiate', {
          relatedType: 'ORDER',
          relatedId: orderId,
        });
        const clientSecret = paymentRes.data?.data?.clientSecret;
        if (!clientSecret) throw new Error('No client secret returned');

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'KundaGo',
        });
        if (initError) throw initError;

        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          if (presentError.code === 'Canceled') {
            showToast('Payment cancelled', 'error');
          } else {
            throw presentError;
          }
          setPlacing(false);
          return;
        }
      }

      if (paymentMethod === 'WAVE') {
        await Linking.openURL(WAVE_PAYMENT_URL);
      }

      router.replace('/(tabs)/orders');
      showToast('Order placed successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      Alert.alert('Error', msg);
    } finally {
      setPlacing(false);
    }
  };

  if (loadingCart) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color={c.primary.DEFAULT} size="large" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-surface items-center justify-center px-4">
        <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
          <Feather name="shopping-cart" size={28} color={c.primary.DEFAULT} />
        </View>
        <Text className="headline-md text-on-surface font-black mb-2">Your cart is empty</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} className="bg-primary rounded-lg px-6 py-3">
          <Text className="body-md font-bold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <View className="px-4 pt-3 pb-3 bg-surface flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={c.onSurface} />
        </TouchableOpacity>
        <Text className="headline-md text-on-surface font-black flex-1">
          Checkout
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {!user?.isVerified && (
          <View className="mb-4 p-4 rounded-lg flex-row items-center gap-3" style={{ backgroundColor: '#FEF3C7' }}>
            <Feather name="alert-triangle" size={20} color="#D97706" />
            <View className="flex-1">
              <Text style={{ color: '#92400E', fontWeight: 600, fontSize: 14 }}>Email not verified</Text>
              <Text style={{ color: '#92400E', fontSize: 13, marginTop: 2 }}>
                Please verify your email before placing an order.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/(auth)/verify-email?email=${encodeURIComponent(user?.email || '')}`)}
              className="rounded-lg px-4 py-2" style={{ backgroundColor: '#D97706' }}
            >
              <Text style={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>Verify</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Address */}
        <View className="mb-6">
          <Text className="label-sm text-on-surface-variant font-bold mb-3">
            DELIVERY ADDRESS
          </Text>

          {addresses.map((addr) => (
            <TouchableOpacity
              key={addr._id}
              activeOpacity={0.7}
              onPress={() => setSelectedAddress(addr)}
              className="bg-surface-container rounded-lg p-4 mb-2 shadow-ambient flex-row items-center gap-3"
              style={
                selectedAddress?._id === addr._id
                  ? { borderWidth: 2, borderColor: c.primary.DEFAULT }
                  : {}
              }
            >
              <View
                className="w-5 h-5 rounded-full border-2 items-center justify-center"
                style={{
                  borderColor: selectedAddress?._id === addr._id
                    ? c.primary.DEFAULT
                    : isDark ? '#ffffff' : c.onSurfaceVariant
                }}
              >
                {selectedAddress?._id === addr._id && (
                  <View className="w-3 h-3 rounded-full bg-primary" />
                )}
              </View>
              <View className="flex-1">
                <Text className="body-md font-bold text-on-surface">
                  {addr.fullName}
                </Text>
                <Text className="body-sm text-on-surface-variant">
                  {addr.phone}
                </Text>
                <Text className="body-sm text-on-surface-variant">
                  {addr.address}
                  {addr.landmark ? `, ${addr.landmark}` : ""}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowAddressForm(true)}
            className="bg-surface-container rounded-lg p-4 shadow-ambient flex-row items-center gap-3"
          >
            <View className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center">
              <Feather name="plus" size={20} color={c.primary.DEFAULT} />
            </View>
            <Text className="body-md font-bold text-primary">
              Add new address
            </Text>
          </TouchableOpacity>
          <Text className="body-sm text-on-surface-variant mt-2 ml-1">
            Delivery within 1–2 working days
          </Text>
        </View>

        {/* Order Summary */}
        <View className="mb-6">
          <Text className="label-sm text-on-surface-variant font-bold mb-3">
            ORDER SUMMARY
          </Text>
          <View className="bg-surface-container rounded-lg shadow-ambient p-4">
            {items.map((item) => (
              <View
                key={item.productId._id}
                className="flex-row items-center gap-3 mb-3"
              >
                <Image
                  source={
                    item.productId.images?.[0]
                      ? { uri: item.productId.images[0] }
                      : undefined
                  }
                  className="w-16 h-16 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text
                    className="body-md font-bold text-on-surface"
                    numberOfLines={1}
                  >
                    {item.productId.name}
                  </Text>
                  <Text className="body-sm text-on-surface-variant">
                    Qty: {item.quantity}
                  </Text>
                </View>
                <Text className="body-md font-bold text-primary">
                  D{item.priceAtTime.toLocaleString()}
                </Text>
              </View>
            ))}
            <View className="h-px bg-surface-variant my-2" />
            <View className="flex-row justify-between items-center mb-1">
              <Text className="body-sm text-on-surface-variant">Delivery fee</Text>
              <Text className="body-sm text-on-surface-variant">D{deliveryFee.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="body-md font-bold text-on-surface">Total</Text>
              <Text className="headline-md text-primary font-black">
                D{total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="mb-6">
          <Text className="label-sm text-on-surface-variant font-bold mb-3">
            PAYMENT METHOD
          </Text>
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm.value}
              activeOpacity={0.7}
              onPress={() => setPaymentMethod(pm.value)}
              className={`bg-surface-container rounded-lg p-4 mb-2 shadow-ambient flex-row items-center gap-3`}
              style={
                paymentMethod === pm.value
                  ? { borderWidth: 2, borderColor: c.primary.DEFAULT }
                  : {}
              }
            >
              <View
                className="w-10 h-10 items-center justify-center rounded-full bg-primary-50"
                style={[
                  { borderRadius: 9999 },
                  paymentMethod === pm.value
                    ? { backgroundColor: c.primary.DEFAULT, borderRadius: 9999 }
                    : {},
                ]}
              >
                <Feather
                  name={pm.icon}
                  size={18}
                  color={paymentMethod === pm.value ? "#ffffff" : c.primary.DEFAULT}
                />
              </View>
              <View className="flex-1">
                <Text className="body-md font-bold text-on-surface">
                  {pm.label}
                </Text>
                <Text className="body-sm text-on-surface-variant">
                  {pm.desc}
                </Text>
              </View>
              <View
                className="w-5 h-5 rounded-full border-2 items-center justify-center"
                style={{
                  borderColor: paymentMethod === pm.value
                    ? c.primary.DEFAULT
                    : isDark ? '#ffffff' : c.onSurfaceVariant
                }}
              >
                {paymentMethod === pm.value && (
                  <View className="w-3 h-3 rounded-full bg-primary" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-surface-container px-4 py-4 shadow-ambient">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="body-sm text-on-surface-variant">
            Delivery fee
          </Text>
          <Text className="body-sm text-on-surface-variant">
            D{deliveryFee.toLocaleString()}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="body-md text-on-surface-variant font-semibold">
            Total
          </Text>
          <Text className="headline-md text-primary font-black">
            D{total.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={placeOrder}
          disabled={placing}
          className="bg-primary rounded-lg py-4 items-center shadow-ambient"
        >
          <Text className="label-sm font-bold text-white">
            {placing ? "Placing Order..." : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Address Modal */}
      <Modal visible={showAddressForm} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-surface-container rounded-t-xl" style={{ maxHeight: '90%' }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                className="p-6"
              >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="headline-md text-on-surface font-black">
                  New Address
                </Text>
                <TouchableOpacity onPress={() => setShowAddressForm(false)}>
                  <Feather name="x" size={24} color={c.onSurface} />
                </TouchableOpacity>
              </View>

              <TextInput
                className="bg-surface rounded-lg px-4 py-3 mb-3 text-on-surface"
                placeholder="Full name"
                placeholderTextColor={c.onSurfaceVariant}
                value={addressForm.fullName}
                onChangeText={(t) =>
                  setAddressForm((p) => ({ ...p, fullName: t }))
                }
              />
              <TextInput
                className="bg-surface rounded-lg px-4 py-3 mb-3 text-on-surface"
                placeholder="Phone number"
                placeholderTextColor={c.onSurfaceVariant}
                keyboardType="phone-pad"
                value={addressForm.phone}
                onChangeText={(t) =>
                  setAddressForm((p) => ({ ...p, phone: t }))
                }
              />
              <TextInput
                className="bg-surface rounded-lg px-4 py-3 mb-3 text-on-surface"
                placeholder="Delivery address"
                placeholderTextColor={c.onSurfaceVariant}
                multiline
                value={addressForm.address}
                onChangeText={(t) =>
                  setAddressForm((p) => ({ ...p, address: t }))
                }
              />
              <TextInput
                className="bg-surface rounded-lg px-4 py-3 mb-4 text-on-surface"
                placeholder="Landmark (optional)"
                placeholderTextColor={c.onSurfaceVariant}
                value={addressForm.landmark}
                onChangeText={(t) =>
                  setAddressForm((p) => ({ ...p, landmark: t }))
                }
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={saveAddress}
                className="bg-primary rounded-lg py-4 items-center"
              >
                <Text className="label-sm font-bold text-white">
                  Save Address
                </Text>
              </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
