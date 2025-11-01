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
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawer from "./src/components/CustomDrawer";
import SearchScreen from "./src/screens/SearchScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      {/* Now HomeScreen is inside Drawer */}
      <Drawer.Screen name="Home">
        {(props) => (
          <LayoutProvider title="Myntra" navigation={props.navigation}>
            <HomeScreen {...props} />
          </LayoutProvider>
        )}
      </Drawer.Screen>

      {/* Add other drawer screens if needed */}
      <Drawer.Screen name="Search" component={SearchScreen} />
      <Drawer.Screen name="Checkout" component={CheckoutScreen} />
    </Drawer.Navigator>
  );
}
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* ✅ Home has global header/footer */}
             <Stack.Screen name="Drawer" component={DrawerNavigator} />
            <Stack.Screen
              name="Home"
              children={({ navigation }) => (
                <LayoutProvider title="Myntra" navigation={navigation}>
                  <HomeScreen navigation={navigation}/>
                </LayoutProvider>
              )}
            />
            <Stack.Screen name="Search" component={SearchScreen} />
            {/* Here we let React Navigation inject navigation automatically */}
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
