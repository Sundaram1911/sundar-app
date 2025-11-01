// --- src/components/LayoutProvider.tsx ---
import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import Header from "./Header";
import { SafeAreaView } from "react-native-safe-area-context";
type Props = {
  children: ReactNode;
  title?: string;
  navigation?:any;
};

export default function LayoutProvider({ children, title,navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Header title={title || "App"} navigation={navigation}/>
      <View style={styles.content}>{children}</View>
      {/* <Footer navigation={navigation}/> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { flex: 1 },
});
