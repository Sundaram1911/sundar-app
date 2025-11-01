import { DrawerNavigationProp } from "@react-navigation/drawer";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type DrawerParamList = {
  Home: undefined;
};

interface HeaderProps {
  title: string;
  navigation:any;
}
// Stack screens (root stack)
type RootStackParamList = {
  Drawer: undefined;
  Search: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Checkout: undefined;
};
type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
export default function Header({ title }: HeaderProps) {
  //const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Text style={styles.menuIcon}>≡</Text>
      </TouchableOpacity>

      <Text style={styles.title}>INK & IRON</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <Text style={styles.icon}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  main:{
    color:'#000',
    paddingHorizontal:20
  },
  title: { fontSize: 22, fontWeight: "700" },
  menuIcon: { fontSize: 36,marginTop:-6 },
  icon: { fontSize: 20 },
});
