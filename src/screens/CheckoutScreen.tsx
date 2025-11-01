// --- src/screens/CheckoutScreen.tsx ---
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { clearCart } from "../store/slices/cartSlice";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen({ navigation }: any) {
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) * item.quantity),
    0
  );

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const paymentOptions = [
    { id: "upi", label: "UPI" },
    { id: "card", label: "Credit / Debit Card" },
    { id: "netbanking", label: "Net Banking" },
    { id: "cod", label: "Cash on Delivery" },
  ];

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

      <View style={{ flex: 1, padding: 16 }}>
        {/* Cart Items */}
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item._media?.images?.[0]._full_url }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>
                  ₹{item.price} × {item.quantity}
                </Text>
                <Text style={styles.subtotal}>
                  Subtotal: ₹{ Number(item.price) * item.quantity}
                </Text>
              </View>
            </View>
          )}
        />

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
            style={[styles.placeOrderBtn, !selectedPayment && { opacity: 0.5 }]}
            disabled={!selectedPayment}
            onPress={() => {
              alert(
                `Order placed successfully with ${
                  selectedPayment?.toUpperCase() || ""
                }! 🎉`
              );
              dispatch(clearCart());
              navigation.navigate("Home");
            }}
          >
            <Text style={styles.placeOrderText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  price: { fontSize: 14, color: "#e91e63", marginBottom: 2 },
  subtotal: { fontSize: 12, color: "#777" },

  paymentBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  paymentHeading: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal:10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius:5
  },
  optionSelected: {
    backgroundColor: "#f0f8ff",
  },
  optionText: { fontSize: 16 },
  radio: { fontSize: 20 },

  footer: { paddingTop: 16 },
  total: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "right" },
  placeOrderBtn: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  placeOrderText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
