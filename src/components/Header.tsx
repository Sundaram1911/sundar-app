import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { logout } from "../store/slices/authSlice";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isGuest = user?.id === "guest";

  return (
    <View style={styles.container}>
      {/* Left side: Search */}
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={() => (navigation as any).navigate("MainTabs", { screen: "SearchTab" })}>
          <Text style={styles.icon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Center: Logo */}
      <View style={styles.logoContainer} pointerEvents="none">
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Right side: Login/Profile */}
      <View style={styles.rightIcons}>
        {isGuest ? (
          <TouchableOpacity onPress={() => dispatch(logout())} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => (navigation as any).navigate("MainTabs", { screen: "ProfileTab" })}>
            <Text style={styles.icon}>👤</Text>
          </TouchableOpacity>
        )}
      </View>
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
  leftContainer: {
    width: 80, // Fixed width for symmetry
    alignItems: "flex-start",
  },
  rightIcons: {
    width: 80, // Fixed width for symmetry
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  loginBtn: {
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 6,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  main: {
    color: '#000',
    paddingHorizontal: 20
  },
  logoContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 44,
    width: 120,
  },
  icon: {
    fontSize: 20
  },
});