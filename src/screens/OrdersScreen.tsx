import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../store/api";
import { MEDIA_URL } from "../config/env";
import { ENDPOINTS } from "../config/endpoints";
import { useAppSelector } from "../store/hooks";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  productId: {
    id: number;
    name: string;
    productImages: any[];
  };
  productVariantId?: {
    id: number;
    size: string;
    color: string;
  };
}

interface Order {
  id: number;
  orderId: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  address: string;
  orderItems: OrderItem[];
  orderNumber: string;
}

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("Auth user", JSON.stringify(auth));
      // Query with population of orderItems and nested products/variants
      // SolidXAI supports up to 2 levels of nested populate
      const response = await api.get(ENDPOINTS.ORDERS, {
        params: {
          "populate[0]": "orderItems.productId",
          "populate[1]": "orderItems.productVariantId",
          "populate[2]": "orderItems.productId.productImages",
          "populateMedia[0]": "orderItems.productId.productImages.productImages",
          "filters[userId.id]": auth.user?.id,
          sort: "createdAt:DESC",
        }
      });
      setOrders(response.data.data.records);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "placed": return "#3B82F6"; // Blue
      case "delivered": return "#10B981"; // Green
      case "cancelled": return "#EF4444"; // Red
      default: return "#6B7280"; // Gray
    }
  };

  const renderOrderItem = (item: OrderItem) => {
    // productImages may not be populated (requires 3-level deep join)
    const imageUrl = item.productId?.productImages?.[0]?.relativeUri
      ? `${MEDIA_URL}/${item.productId.productImages[0].relativeUri}`
      : null;

    return (
      <View key={item.id} style={styles.itemRow}>
        <Image
          source={imageUrl ? { uri: imageUrl } : { uri: "https://via.placeholder.com/100" }}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.productId?.name || 'Product'}</Text>
          {item.productVariantId && (
            <Text style={styles.itemVariant}>
              {item.productVariantId.size} / {item.productVariantId.color}
            </Text>
          )}
          <Text style={styles.itemPrice}>₹{item.price} × {item.quantity}</Text>
        </View>
      </View>
    );
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus) }]}>
            {item.orderStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      {item.address && (
        <View style={styles.addressSection}>
          <MaterialIcons name="location-on" size={14} color="#6B7280" />
          <Text style={styles.addressText} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      )}

      <View style={styles.itemsList}>
        {item.orderItems?.map(renderOrderItem)}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{item.totalAmount}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-basket" size={80} color="#DDD" />
          <Text style={styles.emptyText}>No orders found</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("MainTabs", { screen: "HomeTab" })}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  addressSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 12,
    color: "#4B5563",
    marginLeft: 4,
    flex: 1,
    lineHeight: 18,
  },
  itemsList: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  itemVariant: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ff3f6c",
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
