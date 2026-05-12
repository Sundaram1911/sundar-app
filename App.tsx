// --- App.tsx ---
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { store } from "./src/store";
import HomeScreen from "./src/screens/HomeScreen";
import CartScreen from "./src/screens/CartScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LayoutProvider from "./src/components/LayoutProvider";
import ProductDetailsScreen from "./src/screens/ProductDetailsScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import SearchScreen from "./src/screens/SearchScreen";
import AuthScreen from "./src/screens/AuthScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootState } from "./src/store";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ff3f6c", // Myntra-like Pink
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "HomeTab") iconName = "home";
          else if (route.name === "SearchTab") iconName = "search";
          else if (route.name === "CartTab") iconName = "shopping-cart";
          else if (route.name === "ProfileTab") iconName = "person";

          return <MaterialIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        options={{ tabBarLabel: "Home" }}
      >
        {(props) => (
          <LayoutProvider title="Myntra" navigation={props.navigation}>
            <HomeScreen {...props} />
          </LayoutProvider>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ tabBarLabel: "Search" }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ tabBarLabel: "Cart" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}
function RootNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          {/* ✅ App has bottom tab footer */}
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
