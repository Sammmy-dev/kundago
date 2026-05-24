import '@/global.css';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const faqs = [
  { q: 'How do I place an order?', a: 'Browse products, add items to your cart, proceed to checkout, select a delivery address and payment method, then tap Place Order.' },
  { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery (COD), Card payments via Stripe, and Wave mobile money.' },
  { q: 'How long does delivery take?', a: 'Delivery times vary by location. You will receive a confirmation once your order is processed.' },
  { q: 'Can I cancel my order?', a: 'Please contact our support team as soon as possible if you need to cancel an order.' },
  { q: 'How do I track my order?', a: 'You can view your order status in the Orders tab. Statuses include PENDING, CONFIRMED, and DELIVERED.' },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const c = useThemeColors();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <View className="px-4 pt-3 pb-3 bg-surface flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={c.onSurface} />
        </TouchableOpacity>
        <Text className="headline-md text-on-surface font-black flex-1">Help & Support</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Contact */}
        <View className="bg-surface-container rounded-lg shadow-ambient mb-4">
          <TouchableOpacity
            onPress={() => Linking.openURL('https://wa.me/447459064328')}
            className="px-4 py-4 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center">
              <Feather name="message-circle" size={20} color={c.primary.DEFAULT} />
            </View>
            <View className="flex-1">
              <Text className="body-md font-bold text-on-surface">WhatsApp</Text>
              <Text className="body-sm text-on-surface-variant">+44 7459 064328</Text>
            </View>
            <Feather name="chevron-right" size={20} color={c.onSurfaceVariant} />
          </TouchableOpacity>
          <View className="h-px bg-surface-variant mx-4" />
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:support@kundago.shop')}
            className="px-4 py-4 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center">
              <Feather name="mail" size={20} color={c.primary.DEFAULT} />
            </View>
            <View className="flex-1">
              <Text className="body-md font-bold text-on-surface">Email Us</Text>
              <Text className="body-sm text-on-surface-variant">support@kundago.shop</Text>
            </View>
            <Feather name="chevron-right" size={20} color={c.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text className="label-sm text-on-surface-variant font-bold mb-3">FREQUENTLY ASKED QUESTIONS</Text>
        <View className="bg-surface-container rounded-lg shadow-ambient mb-6">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <View key={i}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setOpenIndex(isOpen ? null : i)}
                  className="px-4 py-4 flex-row items-center gap-3"
                >
                  <Text className="body-md text-on-surface font-semibold flex-1">{faq.q}</Text>
                  <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={c.onSurfaceVariant} />
                </TouchableOpacity>
                {isOpen && (
                  <View className="px-4 pb-4">
                    <Text className="body-sm text-on-surface-variant leading-5">{faq.a}</Text>
                  </View>
                )}
                {i < faqs.length - 1 && <View className="h-px bg-surface-variant mx-4" />}
              </View>
            );
          })}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
