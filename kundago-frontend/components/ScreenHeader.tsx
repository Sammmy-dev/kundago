import { View, Text } from 'react-native';
import { ReactNode } from 'react';

type Props = {
  title: string;
  showBell?: boolean;
  children?: ReactNode;
};

export function ScreenHeader({ title, showBell = true, children }: Props) {
  return (
    <View className="px-4 pt-4 pb-3 bg-surface">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-headline-md text-on-surface">{title}</Text>
      </View>
      {children}
    </View>
  );
}
