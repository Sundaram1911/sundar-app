import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, Button, TouchableOpacity } from "react-native";
import Swiper from "react-native-swiper";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart, decreaseQuantity, removeFromCart } from "../store/slices/cartSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { MEDIA_URL } from "../config/env";

export default function ProductDetailsScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();
  const { productId } = route.params;
  const { items, loading, page, hasMore } = useAppSelector(state => state.product);
  const product = items.find((p) => String(p.id) === String(productId));
  
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product?.productVariants && product.productVariants.length > 0 
      ? product.productVariants[0] 
      : null
  );

  const cartItems = useAppSelector((state) => state.cart.items);
  const activeProductId = selectedVariant ? `${product?.id}-${selectedVariant.id}` : product?.id;
  const existingItem = cartItems.find((item) => item.id === activeProductId);
  const existingQty = existingItem ? existingItem.quantity : 0;
  
  const [qty, setQty] = useState(existingQty);
  
  useEffect(() => {
    if (existingQty !== qty) {
      setQty(existingQty);
    }
  }, [existingQty]);
  
  const displayPrice = selectedVariant ? selectedVariant.price : product?.price;

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
        <Swiper 
          showsPagination={true} 
          height={400} 
          autoplay={true}
          activeDotColor="#ff3f6c"
          dotColor="#d3d3d3"
        >
          {product.productImages?.[0]?._media?.productImages?.map((img, index) => (
            <View key={index} style={styles.slide}>
              <Image source={{ uri: img.relativeUri ? `${MEDIA_URL}/${img.relativeUri}` : undefined }} style={styles.image} />
            </View>
          ))}
        </Swiper>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₹{displayPrice}</Text>
        {(() => {
          const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
          return (
            <Text style={[
              styles.stockDetail,
              currentStock <= 0 ? styles.outOfStock : currentStock <= 5 ? styles.lowStock : null
            ]}>
              {currentStock <= 0 ? 'Out of Stock' : currentStock <= 5 ? `Hurry! Only ${currentStock} left` : `${currentStock} in stock`}
            </Text>
          );
        })()}
        {product.discount && <Text style={styles.discount}>{product.discount}% off</Text>}
        <Text style={styles.description}>{product.description}</Text>
      </View>

      {/* Variants Selection */}
      {product.productVariants && product.productVariants.length > 0 && (
        <View style={styles.variantsContainer}>
          <Text style={styles.sectionTitle}>Select Variant</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantScroll}>
            {product.productVariants.map((variant: any) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <TouchableOpacity 
                  key={variant.id} 
                  style={[styles.variantBox, isSelected && styles.selectedVariantBox]}
                  onPress={() => setSelectedVariant(variant)}
                >
                  <Text style={[styles.variantText, isSelected && styles.selectedVariantText]}>
                    {variant.color} - {variant.size}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.cartContainer}>
      {qty === 0 ? (
        <TouchableOpacity
          style={[styles.addButton, (selectedVariant ? selectedVariant.stock : product.stock) <= 0 && styles.disabledButton]}
          disabled={(selectedVariant ? selectedVariant.stock : product.stock) <= 0}
          onPress={() => {
            const cartProduct = selectedVariant 
              ? { ...product, id: activeProductId, price: selectedVariant.price, sku: selectedVariant.sku, variantDetails: selectedVariant } as any
              : product;
            dispatch(addToCart({ ...cartProduct, quantity: 1 }));
            setQty(1);
          }}
        >
          <Text style={styles.addButtonText}>
            {(selectedVariant ? selectedVariant.stock : product.stock) <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => {
              if (qty > 1) {
                setQty(qty - 1);
                dispatch(decreaseQuantity(activeProductId!));
              } else {
                setQty(0);
                dispatch(removeFromCart(activeProductId!));
              }
            }}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, (selectedVariant ? selectedVariant.stock : product.stock) <= qty && styles.disabledQtyBtn]}
            disabled={(selectedVariant ? selectedVariant.stock : product.stock) <= qty}
            onPress={() => {
              setQty(qty + 1);
              const cartProduct = selectedVariant 
                ? { ...product, id: activeProductId, price: selectedVariant.price, sku: selectedVariant.sku, variantDetails: selectedVariant } as any
                : product;
              dispatch(addToCart(cartProduct));
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
            onPress={() => navigation.navigate("MainTabs", { screen: "CartTab" })}
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
  backBtn: { margin: 16,position:'absolute',zIndex:9, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sliderContainer: { height: 400 },
  slide: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' },
  image: { width: "100%", height: 380, resizeMode: "contain" },
  infoContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  price: { fontSize: 18, fontWeight: "600", color: "#000", marginBottom: 4 },
  stockDetail: { fontSize: 13, fontWeight: "600", color: "#10B981", marginBottom: 8 },
  lowStock: { color: "#F59E0B" },
  outOfStock: { color: "#EF4444" },
  discount: { fontSize: 14, color: "green", marginBottom: 8 },
  description: { fontSize: 14, color: "#555", marginBottom:4 },
  variantsContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  variantScroll: { paddingVertical: 4 },
  variantBox: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#fff"
  },
  selectedVariantBox: {
    borderColor: "#ff3f6c",
    backgroundColor: "#fff0f5"
  },
  variantText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444"
  },
  selectedVariantText: {
    color: "#ff3f6c"
  },
  cartContainer: { marginTop: 0, flexDirection: "row", justifyContent: "center" },
  addButton: { flex: 1, backgroundColor: "#ff3f6c", padding: 12, borderRadius: 6, alignItems: "center" ,marginHorizontal:12},
  disabledButton: { backgroundColor: "#ccc" },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  qtyContainer: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { padding: 10, backgroundColor: "#eee", borderRadius: 4 },
  disabledQtyBtn: { opacity: 0.5 },
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
