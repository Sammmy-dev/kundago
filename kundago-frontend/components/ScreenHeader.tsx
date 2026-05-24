import { View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import { Feather } from '@expo/vector-icons';

type Props = {
  title: string;
  showBell?: boolean;
  children?: ReactNode;
};

export function ScreenHeader({ title, showBell = true, children }: Props) {
  return (
    <View className="px-4 pt-4 pb-3 bg-surface">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="headline-md text-on-surface font-black">{title}</Text>
        {/* {showBell && (
          <TouchableOpacity className="relative">
            <Feather name="bell" size={24} color="#191c1e" />
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>
        )} */}
      </View>
      {children}
    </View>
  );
}
