import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, Button, TouchableOpacity } from "react-native";
import Swiper from "react-native-swiper";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart } from "../store/slices/cartSlice";
import  products  from "../data/product.json"; // your products array
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetailsScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();
  const { productId } = route.params;
  const { items, loading, page, hasMore } = useAppSelector(state => state.product);
  const product = items.find((p) => p.id === productId);
  const cartItems = useAppSelector((state) => state.cart.items);
  const existingItem = cartItems.find((item) => item.id === product?.id);
  const existingQty = existingItem ? existingItem.quantity : 0;
  const [qty, setQty] = useState(existingQty);
  useEffect(() => {
    if (existingQty !== qty) {
      setQty(existingQty);
    }
  }, [existingQty]);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={{ fontSize: 20 }}>←</Text>
      </TouchableOpacity>

      {/* Image Slider */}
      <View style={styles.sliderContainer}>
        <Swiper showsPagination={true} height={300}>
          {product._media?.images.map((img, index) => (
            <Image key={index} source={{ uri: img._full_url }} style={styles.image} />
          ))}
        </Swiper>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price}</Text>
        {product.discount && <Text style={styles.discount}>{product.discount}% off</Text>}
        <Text style={styles.description}>{product.description}</Text>
      </View>
      <View style={styles.cartContainer}>
      {qty === 0 ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            dispatch(addToCart({ ...product, quantity: 1 }));
            setQty(1);
          }}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => {
              if (qty > 1) {
                setQty(qty - 1);
                dispatch(addToCart({ ...product, quantity: qty - 1 }));
              } else {
                setQty(0);
                // remove from cart logic
              }
            }}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => {
              setQty(qty + 1);
              dispatch(addToCart({ ...product, quantity: qty + 1 }));
            }}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
    </View>
  )}
  </View>
    </ScrollView>
         <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("Cart")}
          >
            <Text style={styles.cartButtonText}>🛒</Text>
    
            {cartItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backBtn: { margin: 16,position:'absolute',zIndex:9 },
  sliderContainer: { height: 560 },
  image: { width: "100%", height: 560, resizeMode: "cover" },
  infoContainer: { padding: 16 },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  price: { fontSize: 18, fontWeight: "600", color: "#000", marginBottom: 4 },
  discount: { fontSize: 14, color: "green", marginBottom: 8 },
  description: { fontSize: 14, color: "#555", marginBottom:12 },
  cartContainer: { marginTop: 0, flexDirection: "row", justifyContent: "center" },
  addButton: { flex: 1, backgroundColor: "#ff3f6c", padding: 12, borderRadius: 6, alignItems: "center" ,marginHorizontal:12},
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  qtyContainer: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { padding: 10, backgroundColor: "#eee", borderRadius: 4 },
  qtyBtnText: { fontSize: 18, fontWeight: "700" },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: "600" },
  cartButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
  },
  cartButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  badge: {
  position: "absolute",
  top: -6,
  right: -6,
  backgroundColor: "red",
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
},
badgeText: {
  color: "#fff",
  fontSize: 9,
  fontWeight: "700",
},

});
