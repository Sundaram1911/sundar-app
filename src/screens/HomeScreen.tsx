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
  RefreshControl,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart, decreaseQuantity } from "../store/slices/cartSlice";
import { fetchProducts } from "../store/slices/productSlice";
import axios from "axios";
import { API_URL, MEDIA_URL } from "../config/env";
import { ENDPOINTS } from "../config/endpoints";
import { ScrollView } from "react-native";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 12;

export default function HomeScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { items, loading, page, hasMore } = useAppSelector(state => state.product);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Get qty for a product
  const getQuantity = (id: string) => {
    const item = cartItems.find((p) => p.id === id);
    return item ? item.quantity : 0;
  };

  // ✅ Total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ Load initial products only once when component mounts
  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts({ page: 1, limit: 10 }));
    }

    // ✅ Load categories
    setLoadingCategories(true);
    axios.get(`${API_URL}${ENDPOINTS.CATEGORIES}`)
      .then(res => {
        const fetchedCategories = res.data.data.records;
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0]);
        }
      })
      .catch(err => console.error("Failed fetching categories", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);

    Promise.all([
      dispatch(fetchProducts({ page: 1, limit: 10 })),
      axios.get(`${API_URL}${ENDPOINTS.CATEGORIES}`).then(res => {
        const fetchedCategories = res.data.data.records;
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0]);
        }
      })
    ])
      .catch(err => console.error("Refresh failed", err))
      .finally(() => setRefreshing(false));
  }, [dispatch]);

  const loadMore = () => {
    if (!isLoadingMore && !loading && hasMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      dispatch(fetchProducts({ page: nextPage, limit: 10 })).finally(() => {
        setIsLoadingMore(false);
      });
    }
  };

  // ✅ Get visible products based on current page and selected category
  const filteredItems = selectedCategory
    ? items.filter((p) => p.categoryId?.id === selectedCategory.id)
    : items;
  const visibleProducts = filteredItems.slice(0, currentPage * 10);

  return (
    <View style={styles.container}>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#ff3f6c"]} />}
        data={visibleProducts}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const qty = getQuantity(item.id?.toString() || "");
          const firstImage = item.productImages?.[0]?._media?.productImages?.[0];
          const imageUrl = firstImage?.relativeUri ? `${MEDIA_URL}/${firstImage.relativeUri}` : undefined;

          return (
            <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}>
              <View style={styles.card}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    {(() => {
                      const variants = item.productVariants;
                      const totalStock = Array.isArray(variants) && variants.length > 0 
                        ? variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
                        : (item.stock || 0);
                      
                      return (
                        <Text style={[
                          styles.stockText,
                          totalStock <= 0 ? styles.outOfStock : totalStock <= 5 ? styles.lowStock : null
                        ]}>
                          {totalStock <= 0 ? 'Out of Stock' : `${totalStock} left`}
                        </Text>
                      );
                    })()}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        //onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.categoriesSection}>
            {/* <Text style={styles.sectionTitle}>Categories</Text> */}
            {loadingCategories ? (
              <Text style={{ padding: 10 }}>Loading categories...</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryPill, isSelected && styles.selectedCategoryPill]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            {/* <Text style={[styles.sectionTitle, { marginTop: 15, marginBottom: 10 }]}>All Products</Text> */}
          </View>
        }
        ListFooterComponent={
          isLoadingMore || loading ? (
            <Text style={{ textAlign: "center", padding: 10 }}>Loading more...</Text>
          ) : null
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f5f5f5",
  },
  categoriesSection: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 4,
    color: "#333",
  },
  categoryScroll: {
    paddingVertical: 10,
  },
  categoryPill: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginLeft: 0,
  },
  selectedCategoryPill: {
    backgroundColor: "#ff3f6c",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  selectedCategoryText: {
    color: "#fff",
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
    height: 240,
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
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  stockText: {
    fontSize: 10,
    color: "#10B981", // Green for in stock
    fontWeight: "600",
  },
  lowStock: {
    color: "#F59E0B", // Orange for low stock
  },
  outOfStock: {
    color: "#EF4444", // Red for out of stock
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
});