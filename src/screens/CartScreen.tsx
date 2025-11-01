// --- src/screens/CartScreen.tsx ---
import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart, decreaseQuantity, removeFromCart } from "../store/slices/cartSlice";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen({ navigation }: any) {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Custom header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", marginLeft: 12 }}>Cart</Text>
      </View>
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item._media?.images?.[0]?._full_url }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>₹{item.price}</Text>
                  {/* Quantity controls */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => dispatch(decreaseQuantity(item.id))}
                  >
                    <Text style={styles.qtyText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyNumber}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => dispatch(addToCart(item))}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => dispatch(removeFromCart(item.id))}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* ✅ Sticky footer */}
          <View style={styles.footer}>
            <Text style={styles.totalText}>
              Total: ₹{totalPrice} ({items.length} items)
            </Text>
            <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={() => navigation.navigate("Checkout")}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
  },
  dText:{
    color:'#000',
    fontSize:24,
    fontWeight:'bold',
    paddingBottom:20
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: "#e91e63",
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: "#f44336",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop:5,
  },
  removeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    margin:3
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  qtyRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 0,
},
qtyButton: {
  backgroundColor: "#ddd",
  paddingHorizontal: 10,
  paddingVertical: 3,
  borderRadius: 6,
},
qtyText: {
  fontSize: 16,
  fontWeight: "600",
},
qtyNumber: {
  marginHorizontal: 10,
  fontSize: 14,
  fontWeight: "600",
}
});
