import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { logout, fetchUserProfile } from "../store/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { AppDispatch } from "../store";

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const isGuest = user?.id === "guest";

  React.useEffect(() => {
    // If we have an email but no name, sync the profile
    if (user?.email && !user?.name && !isGuest) {
      dispatch(fetchUserProfile());
    }
  }, [user?.email, user?.name, isGuest, dispatch]);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => {
            dispatch(logout());
            (navigation as any).navigate("Auth"); 
          } 
        }
      ]
    );
  };

  const handleLogin = () => {
    (navigation as any).navigate("Auth");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
              </Text>
            )}
          </View>
          
          <Text style={styles.userName}>{user?.name || "Anonymous User"}</Text>
          {isGuest ? <Text style={styles.guestBadge}>GUEST MODE</Text> : null}
          
          {!isGuest ? (
            <View style={styles.detailsContainer}>
              {user?.email ? <Text style={styles.userInfo}>📧 {user.email}</Text> : null}
              {user?.phone ? <Text style={styles.userInfo}>📱 {user.phone}</Text> : null}
              {user?.id ? <Text style={styles.userInfo}>🆔 {user.id.substring(0, 8)}...</Text> : null}
            </View>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => (navigation as any).navigate("Orders")}
          >
            <Text style={styles.menuItemText}>📦 My Orders</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>❤️ Wishlist</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>⚙️ Settings</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {isGuest ? (
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Create Account / Sign In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    width: 60,
  },
  backText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ED4C67",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  guestBadge: {
    backgroundColor: "#E5E7EB",
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 8,
    alignItems: "center",
    gap: 4,
  },
  userInfo: {
    fontSize: 14,
    color: "#6B7280",
  },
  actionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  arrowIcon: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  loginBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutBtnText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "bold",
  },
});
