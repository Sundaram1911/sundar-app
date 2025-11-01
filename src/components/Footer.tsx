// --- src/components/Footer.tsx ---
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
type FooterProps = { navigation: any };
export default function Footer({ navigation }: FooterProps) {

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.btn}>
        <Text style={styles.btnText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.btn}>
        <Text style={styles.btnText}>Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log("Profile clicked")} style={styles.btn}>
        <Text style={styles.btnText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  btn: {
    alignItems: "center",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
