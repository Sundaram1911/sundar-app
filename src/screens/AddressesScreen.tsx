import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { fetchUserProfile } from "../store/slices/authSlice";
import api from "../store/api";
import { ENDPOINTS } from "../config/endpoints";

interface Address {
  id: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
}

export default function AddressesScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const loadProfile = () => {
    dispatch(fetchUserProfile());
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAddAddress = async () => {
    // Basic validation
    if (!formData.fullName || !formData.addressLine1 || !formData.phone || !formData.pincode) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        userIdId: Number(user?.id),
      };

      if (editingId) {
        await api.put(`${ENDPOINTS.ADDRESSES}/${editingId}`, payload);
        Alert.alert("Success", "Address updated successfully!");
      } else {
        await api.post(ENDPOINTS.ADDRESSES, payload);
        Alert.alert("Success", "Address added successfully!");
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        fullName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: "",
      });
      loadProfile();
    } catch (error: any) {
      console.error("Add address error:", error);
      Alert.alert("Error", "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (id: number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`${ENDPOINTS.ADDRESSES}/${id}`);
              loadProfile();
            } catch (error) {
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <Text style={styles.cardName}>{item.fullName}</Text>
        <Text style={styles.cardText}>{item.addressLine1}</Text>
        <Text style={styles.cardText}>{item.city}, {item.state} - {item.pincode}</Text>
        <Text style={styles.cardPhone}>📞 {item.phone}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity 
          onPress={() => handleEditAddress(item)}
          style={styles.actionBtn}
        >
          <MaterialIcons name="edit" size={22} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDeleteAddress(item.id)}
          style={styles.actionBtn}
        >
          <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!showForm ? (
          <>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => {
                setEditingId(null);
                setFormData({
                  fullName: "",
                  phone: "",
                  addressLine1: "",
                  city: "",
                  state: "",
                  pincode: "",
                });
                setShowForm(true);
              }}
            >
              <MaterialIcons name="add" size={20} color="#ff3f6c" />
              <Text style={styles.addBtnText}>Add New Address</Text>
            </TouchableOpacity>

            <FlatList
              data={user?.address as any[]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderAddressItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="location-off" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No addresses saved yet</Text>
                </View>
              }
            />
          </>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingId ? "Edit Address" : "Add New Address"}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Address (House No, Building, Street) *"
              multiline
              numberOfLines={3}
              value={formData.addressLine1}
              onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="City *"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="State *"
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pincode *"
              keyboardType="number-pad"
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
            />

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn}
                onPress={handleAddAddress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    padding: 16,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  addBtnText: {
    color: "#ff3f6c",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addressInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  cardPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    fontWeight: "600",
  },
  cardActions: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBtn: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9CA3AF",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    marginBottom: 0,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
