// --- src/screens/HomeScreen.tsx ---
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart, decreaseQuantity } from "../store/slices/cartSlice";
import products from "../data/product.json";
import { fetchProducts } from "../store/slices/productSlice";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 12;

export default function HomeScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { items, loading, page, hasMore } = useAppSelector(state => state.product);
  // ✅ Get qty for a product
  const getQuantity = (id: string) => {
    const item = cartItems.find((p) => p.id === id);
    return item ? item.quantity : 0;
  };

  // ✅ Total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

const [visibleProducts, setVisibleProducts] = useState(items.slice(0, 6));
const [currentPage,setCurrentPage]=useState(1);
const loadMore = () => {
  const nextPage = page + 1;
  const newData = items.slice(0, nextPage * 10);
  setVisibleProducts(newData);
  setCurrentPage(nextPage);
};

useEffect(() => {
  console.log(items)
  dispatch(fetchProducts({ page: currentPage, limit: 10 }));
}, []);
  return (
    <View style={styles.container}>
      <FlatList
        //data={products}
        data={visibleProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const qty = getQuantity(item.id.toString());

          return (
            <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}>
            <View style={styles.card}>
              <Image source={{ uri: item._media?.images?.[0]._full_url }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.price}>₹{item.price}</Text>

                {/* {qty === 0 ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => dispatch(addToCart(item))}
                  >
                    <Text style={styles.buttonText}>Add to Cart</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => dispatch(decreaseQuantity(item.id))}
                    >
                      <Text style={styles.qtyText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyCount}>{qty}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => dispatch(addToCart(item))}
                    >
                      <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )} */}
              </View>
            </View>
            </TouchableOpacity>
          );
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          visibleProducts.length < items.length ? (
            <Text style={{ textAlign: "center", padding: 10 }}>Loading more...</Text>
          ) : null
        }
      />

      {/* ✅ Floating Cart Button with total qty */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate("Cart")}
      >
        <Text style={styles.cartButtonText}>🛒</Text>

        {totalItems > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f5f5f5",
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    width: CARD_WIDTH,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
  },
  info: {
    padding: 10,
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
  button: {
    backgroundColor: "#e91e63",
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtn: {
    backgroundColor: "#e91e63",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  qtyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  qtyCount: {
    fontSize: 15,
    fontWeight: "600",
    marginHorizontal: 10,
  },
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
