import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function HeaderLogo({ size = 110, style }) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("../../../assets/logo.png")}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  logo: {
    alignSelf: "center",
  },
});
