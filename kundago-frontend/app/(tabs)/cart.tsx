import '@/global.css';
import { ScrollView, View, Text } from 'react-native';

export default function CartScreen() {
  return (
    <ScrollView className="bg-surface">
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 600 }}>
        <Text className="display-lg-mobile text-primary" style={{ marginBottom: 8 }}>
          Cart
        </Text>
        <Text className="body-md text-on-surface">
          Your cart is empty
        </Text>
      </View>
    </ScrollView>
  );
}
