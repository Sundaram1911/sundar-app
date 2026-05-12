// --- src/screens/CartScreen.tsx ---
import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart, decreaseQuantity, removeFromCart, updateCartVariant } from "../store/slices/cartSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { MEDIA_URL } from "../config/env";

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
                <TouchableOpacity 
                  onPress={() => {
                    const baseId = typeof item.id === 'string' ? item.id.split('-')[0] : item.id;
                    navigation.navigate("ProductDetails", { productId: baseId });
                  }}
                >
                  <Image 
                    source={{ 
                      uri: (() => {
                        const relativeUri = item.productImages?.[0]?._media?.productImages?.[0]?.relativeUri;
                        return relativeUri ? `${MEDIA_URL}/${relativeUri}` : undefined;
                      })()
                    }} 
                    style={styles.image} 
                  />
                </TouchableOpacity>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  
                  {item.variantDetails && (
                    <Text style={styles.selectedVariantInfo}>
                      Selected: {item.variantDetails.color} - {item.variantDetails.size}
                    </Text>
                  )}

                  {item.productVariants && item.productVariants.length > 0 && (
                    <View>
                      <Text style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Change Variant:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantScroll}>
                        {item.productVariants.map((variant: any) => {
                          const isSelected = item.variantDetails?.id === variant.id;
                          return (
                            <TouchableOpacity 
                              key={variant.id} 
                              style={[styles.variantBox, isSelected && styles.selectedVariantBox]}
                              onPress={() => {
                                if (!isSelected) {
                                  dispatch(updateCartVariant({ oldId: item.id, newVariant: variant }));
                                }
                              }}
                            >
                              <Text style={[styles.variantText, isSelected && styles.selectedVariantText]}>
                                {variant.color}-{variant.size}
                              </Text>
                            </TouchableOpacity>
                          )
                        })}
                      </ScrollView>
                    </View>
                  )}

                  <View style={styles.priceStockRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    {(() => {
                      const currentStock = item.variantDetails?.stock ?? item.stock ?? 0;
                      return (
                        <Text style={[
                          styles.stockText,
                          currentStock <= 0 ? styles.outOfStock : currentStock <= 5 ? styles.lowStock : null
                        ]}>
                          {currentStock <= 0 ? 'Out of Stock' : currentStock <= 5 ? `Only ${currentStock} left` : 'In Stock'}
                        </Text>
                      );
                    })()}
                  </View>
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
              Total: ₹{totalPrice} ({items.reduce((acc, curr) => acc + curr.quantity, 0)} units)
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
  selectedVariantInfo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ff3f6c",
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    color: "#e91e63",
    fontWeight: "700",
  },
  priceStockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stockText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  lowStock: {
    color: "#F59E0B",
  },
  outOfStock: {
    color: "#EF4444",
  },
  variantScroll: { paddingVertical: 4, marginBottom: 6, maxWidth: 200 },
  variantBox: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: "#fff"
  },
  selectedVariantBox: {
    borderColor: "#ff3f6c",
    backgroundColor: "#fff0f5"
  },
  variantText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444"
  },
  selectedVariantText: {
    color: "#ff3f6c"
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
