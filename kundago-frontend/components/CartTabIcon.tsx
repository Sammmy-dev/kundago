import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCartCount } from '@/lib/stores/cartCount';

export function CartTabIcon({ color, size }: { color: string; size: number }) {
  const count = useCartCount((s) => s.count);
  return (
    <View className="relative">
      <Feather name="shopping-cart" size={size} color={color} />
      {count > 0 && (
        <View className="absolute -top-1 -right-1.5 w-4 h-4 bg-primary rounded-full items-center justify-center">
          <Text className="text-white text-[10px] font-bold">{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
}
