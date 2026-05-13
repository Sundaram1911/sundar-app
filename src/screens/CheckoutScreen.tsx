// --- src/screens/CheckoutScreen.tsx ---
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { clearCart } from "../store/slices/cartSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { MEDIA_URL } from "../config/env";
import { ENDPOINTS } from "../config/endpoints";
import api from "../store/api";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CheckoutScreen({ navigation }: any) {
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) * item.quantity),
    0
  );

  const auth = useAppSelector((state) => state.auth);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new" | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: auth.user?.name || "",
    email: auth.user?.email || "",
    phone: (auth.user as any)?.phone || "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`${ENDPOINTS.AUTH.PROFILE}?populate=address`);
        const userData = res.data.data;
        if (userData) {
          const userAddresses = userData.address || [];
          setFormData(prev => ({
            ...prev,
            name: userData.name || prev.name,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone,
          }));

          if (userAddresses.length > 0) {
            setSelectedAddressId(userAddresses[0].id);
            setFormData(prev => ({
              ...prev,
              name: userAddresses[0].fullName || prev.name,
              phone: userAddresses[0].phone || prev.phone,
              address: userAddresses[0].addressLine1,
            }));
          } else {
            setSelectedAddressId("new");
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };

    fetchUserProfile();
  }, []);

  const paymentOptions = [
    { id: "upi", label: "UPI" },
    { id: "card", label: "Credit / Debit Card" },
    { id: "netbanking", label: "Net Banking" },
    { id: "cod", label: "Cash on Delivery" },
  ];

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be 10 digits";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const placeOrder = async () => {
    const orderItems = cartItems.map(item => {
      const baseProductId = typeof item.id === 'string' ? item.id.split('-')[0] : item.id;
      const variantId = item.variantDetails?.id || null;

      return {
        quantity: item.quantity,
        price: Number(item.price),
        productIdId: Number(baseProductId),
        productVariantIdId: variantId ? Number(variantId) : undefined,
      };
    });

    try {
      let finalAddressId = selectedAddressId;

      if (selectedAddressId === "new") {
        const addressData = {
          fullName: formData.name,
          phone: formData.phone,
          addressLine1: formData.address,
          userIdId: auth.user?.id,
          addressId: `ADDR-${Date.now()}`,
        };
        const addressRes = await api.post(ENDPOINTS.ADDRESSES, addressData);
        finalAddressId = addressRes.data.id || addressRes.data.data?.id;
      }

      const orderData = {
        amount: totalPrice.toString(),
        totalAmount: totalPrice,
        address: formData.address,
        name: formData.name,
        phone: formData.phone,
        userIdId: auth.user?.id,
        addressIdId: finalAddressId,
        paymentStatus: selectedPayment === "cod" ? "pending" : "paid",
        orderStatus: "placed",
        orderItems: orderItems,
      };

      const response = await api.post(ENDPOINTS.ORDERS, orderData);

      console.log("Order Creation Response:", response.data);

      // Simulate API success
      Alert.alert(
        "Order Placed! 🎉",
        `Your order has been placed successfully with ${selectedPayment?.toUpperCase()}!`,
        [
          {
            text: "View Orders",
            onPress: () => {
              dispatch(clearCart());
              navigation.navigate("MainTabs", { screen: "HomeTab" });
            },
          },
          {
            text: "Go to Home",
            onPress: () => {
              dispatch(clearCart());
              navigation.popToTop();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Order placement error:", error);
      const errorMessage = error.response?.data?.message || "Failed to place order. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleCheckout = () => {
    if (!selectedPayment) {
      Alert.alert("Payment Required", "Please select a payment method");
      return;
    }

    if (validateForm()) {
      placeOrder();
    } else {
      Alert.alert("Form Error", "Please fill in all required fields correctly");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Custom header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#ddd",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", marginLeft: 12 }}>
          Checkout
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Cart Items */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <FlatList
          data={cartItems}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() => {
                  const baseId = typeof item.id === 'string' ? item.id.split('-')[0] : item.id;
                  navigation.navigate("ProductDetails", { productId: baseId });
                }}
              >
                <Image source={{ uri: item.productImages?.[0]?._media?.productImages?.[0]?.relativeUri ? `${MEDIA_URL}/${item.productImages[0]._media.productImages[0].relativeUri}` : undefined }} style={styles.image} />
              </TouchableOpacity>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>

                {item.variantDetails && (
                  <Text style={styles.variantInfo}>
                    Size: {item.variantDetails.size} | Color: {item.variantDetails.color}
                  </Text>
                )}

                <Text style={styles.price}>
                  ₹{item.price} × {item.quantity}
                </Text>
                <Text style={styles.subtotal}>
                  Subtotal: ₹{Number(item.price) * item.quantity}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Delivery Address Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Addresses")}>
            <Text style={styles.manageBtnText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addressSelector}>
          {auth.user?.address?.map((addr: any) => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressBox, selectedAddressId === addr.id && styles.selectedAddressBox]}
              onPress={() => {
                setSelectedAddressId(addr.id);
                setFormData(prev => ({ 
                  ...prev, 
                  name: addr.fullName || prev.name,
                  phone: addr.phone || prev.phone,
                  address: addr.addressLine1 
                }));
                setFormErrors({}); // Clear errors when selecting an existing address
              }}
            >
              <Text style={styles.addressBoxTitle} numberOfLines={1}>{addr.fullName}</Text>
              <Text style={styles.addressBoxText} numberOfLines={2}>{addr.addressLine1}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addressBox, styles.addNewBox, selectedAddressId === "new" && styles.selectedAddressBox]}
            onPress={() => {
              setSelectedAddressId("new");
              setFormData(prev => ({ ...prev, address: "" }));
              setFormErrors({});
            }}
          >
            <MaterialIcons name="add" size={20} color={selectedAddressId === "new" ? "#ff3f6c" : "#666"} />
            <Text style={[styles.addNewText, selectedAddressId === "new" && { color: "#ff3f6c" }]}>Add New</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Delivery Form */}
        {selectedAddressId === "new" && (
          <View style={styles.formView}>
            <Text style={styles.formTitle}>New Address Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
              />
              {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, formErrors.phone && styles.inputError]}
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Delivery Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea, formErrors.address && styles.inputError]}
                placeholder="Enter complete delivery address"
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {formErrors.address && <Text style={styles.errorText}>{formErrors.address}</Text>}
            </View>
          </View>
        )}

        {/* Payment Options */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentHeading}>Payment Options</Text>
          {paymentOptions.map((option) => {
            const isSelected = selectedPayment === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => setSelectedPayment(option.id)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                <Text style={styles.radio}>{isSelected ? "◉" : "○"}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.total}>Total: ₹{totalPrice}</Text>
          <TouchableOpacity
            style={styles.placeOrderBtn}
            onPress={handleCheckout}
          >
            <Text style={styles.placeOrderText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  manageBtnText: {
    fontSize: 14,
    color: "#ff3f6c",
    fontWeight: "600",
  },
  addressSelector: {
    marginBottom: 16,
  },
  addressBox: {
    width: 160,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
  },
  selectedAddressBox: {
    borderColor: "#ff3f6c",
    backgroundColor: "#FFF1F2",
  },
  addressBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  addressBoxText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },
  addNewBox: {
    alignItems: "center",
    borderStyle: "dashed",
    flexDirection: "column",
  },
  addNewText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  info: { flex: 1, justifyContent: "center" },
  name: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  variantInfo: { fontSize: 12, color: "#666", marginBottom: 4 },
  price: { fontSize: 14, color: "#e91e63", marginBottom: 2 },
  subtotal: { fontSize: 12, color: "#777" },

  formView: {
    borderColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  inputError: {
    borderColor: "#e91e63",
  },
  textArea: {
    height: 80,
    paddingTop: 10,
  },
  errorText: {
    color: "#e91e63",
    fontSize: 12,
    marginTop: 4,
  },

  paymentBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  paymentHeading: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: 5,
  },
  optionSelected: {
    backgroundColor: "#f0f8ff",
  },
  optionText: { fontSize: 16 },
  radio: { fontSize: 20 },

  footer: { paddingTop: 16, paddingBottom: 32 },
  total: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "right" },
  placeOrderBtn: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  placeOrderText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});