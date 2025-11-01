// --- src/components/CustomDrawer.tsx ---
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomDrawer(props: any) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.title}>Myntra</Text>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate("Home")}>
        <Text style={styles.menuText}>Products</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate("Cart")}>
        <Text style={styles.menuText}>Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate("Trends")}>
        <Text style={styles.menuText}>Trends</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  title: { fontSize: 22, fontWeight: "700" },
  menuItem: { padding: 16 },
  menuText: { fontSize: 16 },
});
