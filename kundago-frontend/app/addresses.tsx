import '@/global.css';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, FlatList, Alert, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useThemeColors } from '@/constants/theme';
import { api } from '@/lib/api';

type Address = {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
};

const emptyForm = {
  fullName: '',
  phone: '',
  address: '',
  landmark: '',
};

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const c = useThemeColors();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data?.data?.addresses || []);
    } catch {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalVisible(true);
  };

  const openEdit = (addr: Address) => {
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      landmark: addr.landmark || '',
    });
    setEditingId(addr._id);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.address) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form };
      if (!body.landmark) delete body.landmark;
      if (editingId) {
        await api.put(`/addresses/${editingId}`, body);
      } else {
        await api.post('/addresses', body);
      }
      setModalVisible(false);
      fetchAddresses();
    } catch {
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/addresses/${id}`);
            fetchAddresses();
          } catch {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View className="bg-surface-container rounded-lg p-4 mb-3 shadow-ambient">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="body-md font-bold text-on-surface mb-1">{item.fullName}</Text>
          <Text className="body-md text-on-surface-variant">{item.address}</Text>
          {item.landmark && (
            <Text className="body-md text-on-surface-variant">Landmark: {item.landmark}</Text>
          )}
          <Text className="body-md text-on-surface-variant mt-1">{item.phone}</Text>
        </View>
        <View className="gap-2">
          <TouchableOpacity onPress={() => openEdit(item)} className="w-8 h-8 bg-primary-50 rounded-lg items-center justify-center">
            <Feather name="edit-2" size={16} color={c.primary.DEFAULT} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)} className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center">
            <Feather name="trash-2" size={16} color={c.error.DEFAULT} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ paddingTop: insets.top }} className="bg-surface flex-1">
      <View className="px-4 pt-4 pb-3 bg-surface">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={c.onSurface} />
          </TouchableOpacity>
          <Text className="headline-md text-on-surface font-black">Saved Addresses</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="body-md text-on-surface-variant">Loading...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Feather name="map-pin" size={28} color={c.primary.DEFAULT} />
          </View>
          <Text className="headline-md text-on-surface font-black mb-2">No Addresses Yet</Text>
          <Text className="body-md text-on-surface-variant text-center mb-6">
            Add a delivery address to get started
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openCreate}
            className="bg-primary rounded-lg px-6 py-3"
          >
            <Text className="body-md font-bold text-white">Add Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddress}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
        />
      )}

      {addresses.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openCreate}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-ambient"
        >
          <Feather name="plus" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior="padding" className="flex-1 bg-surface">
          <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={24} color={c.onSurface} />
                </TouchableOpacity>
                <Text className="headline-md text-on-surface font-black">
                  {editingId ? 'Edit Address' : 'New Address'}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={saving}
                className="bg-primary rounded-lg px-4 py-2"
              >
                <Text className="body-md font-bold text-white">{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>

            <Text className="label-sm text-on-surface-variant mb-1">Full Name *</Text>
            <TextInput
              className="bg-surface-container rounded-lg px-4 py-3 mb-4 text-on-surface"
              placeholderTextColor={c.onSurfaceVariant}
              value={form.fullName}
              placeholder="John Doe"
              onChangeText={(v) => setForm({ ...form, fullName: v })}
            />

            <Text className="label-sm text-on-surface-variant mb-1">Phone *</Text>
            <TextInput
              className="bg-surface-container rounded-lg px-4 py-3 mb-4 text-on-surface"
              placeholderTextColor={c.onSurfaceVariant}
              keyboardType="phone-pad"
              value={form.phone}
              placeholder="+234 800 000 0000"
              onChangeText={(v) => setForm({ ...form, phone: v })}
            />

            <Text className="label-sm text-on-surface-variant mb-1">Delivery Address *</Text>
            <TextInput
              className="bg-surface-container rounded-lg px-4 py-3 mb-4 text-on-surface"
              placeholderTextColor={c.onSurfaceVariant}
              value={form.address}
              placeholder="123 Main Street, City"
              multiline
              onChangeText={(v) => setForm({ ...form, address: v })}
            />

            <Text className="label-sm text-on-surface-variant mb-1">Landmark</Text>
            <TextInput
              className="bg-surface-container rounded-lg px-4 py-3 mb-4 text-on-surface"
              placeholderTextColor={c.onSurfaceVariant}
              value={form.landmark}
              placeholder="Near the market, opposite the church"
              onChangeText={(v) => setForm({ ...form, landmark: v })}
            />

            <View className="h-8" />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
