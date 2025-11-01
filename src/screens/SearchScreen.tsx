import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import products from "../data/product.json"; // your products array
import { useAppSelector } from "../store/hooks";

export default function SearchScreen({ navigation }: any) {
  const { items, loading, page, hasMore } = useAppSelector(state => state.product);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(items);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim() === "") {
      setFiltered(items);
    } else {
      setFiltered(
        items.filter((item) =>
          item.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔙 Back + Search Input */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Search products..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>

      {/* Results */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
          >
            <Image source={{ uri:item._media?.images?.[0]._full_url }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.noResult}>No products found</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  backArrow: {
    fontSize: 22,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  card: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  image: { width: 60, height: 60, borderRadius: 6, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  price: { fontSize: 14, color: "#555" },
  noResult: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#777" },
});
