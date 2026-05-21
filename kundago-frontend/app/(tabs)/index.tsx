import '@/global.css';
import { ScrollView, View, Text, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

const categories = [
  { id: 1, name: 'Groceries', icon: 'shopping-cart' },
  { id: 2, name: 'Construction', icon: 'tool' },
  { id: 3, name: 'Beans & Fabrics', icon: 'grid' },
  { id: 4, name: 'Beauty & Care', icon: 'heart' },
  { id: 5, name: 'Electronics', icon: 'zap' },
  { id: 6, name: 'Household', icon: 'home' },
];

const popularItems = [
  { id: 1, name: 'Fresh Produce', price: '₦5,000', icon: 'package' },
  { id: 2, name: 'Premium Fabrics', price: '₦8,500', icon: 'package' },
  { id: 3, name: 'Beauty Kits', price: '₦3,200', icon: 'package' },
  { id: 4, name: 'Power Tools', price: '₦12,000', icon: 'package' },
  { id: 5, name: 'Home Essentials', price: '₦6,800', icon: 'package' },
  { id: 6, name: 'Electronics Kit', price: '₦4,500', icon: 'package' },
];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const currentBanner = 0;

  return (
    <ScrollView className="bg-surface flex-1">
      <View className="px-4 pt-4 pb-3 bg-surface">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <Image
              source={require('@/assets/images/kungaGo_logo.png')}
              className="w-9 h-9"
              resizeMode="contain"
            />
            <Text className="headline-md text-primary">
              <Text>Kunda</Text>
              <Text style={{ color: '#ef4444' }}>Go</Text>
            </Text>
          </View>
          <TouchableOpacity className="relative">
            <Feather name="bell" size={24} color="#191c1e" />
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="flex-row items-center gap-2 mb-4 px-2">
          <Feather name="map-pin" size={16} color="#006e2f" />
          <Text className="body-md text-on-surface">Deliver to</Text>
          <Text className="body-md text-primary font-bold">Basan</Text>
          <Feather name="chevron-down" size={14} color="#3d4a3d" />
        </TouchableOpacity>

        <View className="flex-row items-center bg-white rounded-lg border border-tertiary px-4 py-3 gap-3">
          <Feather name="search" size={20} color="#3d4a3d" />
          <TextInput
            className="flex-1 text-sm text-on-surface"
            style={{ color: '#191c1e' }}
            placeholder="Search items..."
            placeholderTextColor="#3d4a3d"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Feather name="sliders" size={20} color="#3d4a3d" />
        </View>
      </View>

      <View className="mx-4 mt-5 mb-2">
        <TouchableOpacity
          activeOpacity={0.8}
          className="rounded-xl p-5 overflow-hidden shadow-ambient"
          style={{
            backgroundColor: '#fef3c7',
            minHeight: 180,
          }}
        >
          <View
            className="rounded-xl p-5 justify-between flex-1"
            style={{
              backgroundColor: '#fef3c7',
              minHeight: 180,
            }}
          >
            <View>
              <Text className="headline-md text-on-surface font-black mb-1">
                Eid Bazin
              </Text>
              <Text className="body-md text-on-surface-variant">
                Exclusive collections
              </Text>
            </View>
            <TouchableOpacity className="bg-primary-500 rounded-lg py-3 px-6 self-start flex-row items-center gap-2">
              <Text className="text-sm font-bold text-white" style={{ fontFamily: 'Hanken Grotesk' }}>Shop Now</Text>
              <Feather name="arrow-right" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View className="flex-row justify-center gap-2 mt-3">
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              className={`${
                currentBanner === index ? 'w-6 bg-primary-500' : 'w-2 bg-on-surface-variant'
              } h-2 rounded-full transition-all`}
            />
          ))}
        </View>
      </View>

      <View className="px-4 mt-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="headline-md text-on-surface font-black">Categories</Text>
          <TouchableOpacity className="flex-row items-center gap-1">
            <Text className="text-sm font-bold text-primary" style={{ fontFamily: 'Hanken Grotesk' }}>View all</Text>
            <Feather name="arrow-right" size={12} color="#006e2f" />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap gap-3 justify-between">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.7}
              className="w-[31%] bg-white rounded-lg p-4 items-center border border-secondary-100 shadow-ambient"
            >
              <View className="w-12 h-12 bg-primary-50 rounded-lg items-center justify-center mb-2">
                <Feather name={category.icon} size={24} color="#006e2f" />
              </View>
              <Text
                className="label-sm text-on-surface text-center font-bold"
                style={{ lineHeight: 14 }}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="headline-md text-on-surface font-black">Popular</Text>
          <TouchableOpacity className="flex-row items-center gap-1">
            <Text className="text-sm font-bold text-primary" style={{ fontFamily: 'Hanken Grotesk' }}>See more</Text>
            <Feather name="arrow-right" size={12} color="#006e2f" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={popularItems}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white rounded-lg p-3 mr-3 border border-secondary-100 shadow-ambient"
              style={{
                width: 150,
              }}
            >
              <View
                className="rounded-lg p-4 items-center mb-3 justify-center"
                style={{
                  minHeight: 100,
                  backgroundColor: '#f1f5f9',
                }}
              >
                <Feather name={item.icon} size={32} color="#006e2f" />
              </View>
              <Text className="label-sm text-on-surface font-bold mb-1 text-center" numberOfLines={2}>
                {item.name}
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="body-md text-primary font-black">
                  {item.price}
                </Text>
                <TouchableOpacity className="w-7 h-7 bg-primary-500 rounded-lg items-center justify-center">
                  <Feather name="plus" size={14} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
        />
      </View>

      <View className="h-6" />
    </ScrollView>
  );
}
