import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.DEFAULT,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          color: Colors.primary.DEFAULT,
        },
        tabBarStyle: {
          backgroundColor: Colors.surface.DEFAULT,
          borderTopColor: Colors.outline,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <Feather name="shopping-cart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => <Feather name="package" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
