import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, borderRadius, shadows } from "../../theme/theme";

export default function Card({ children, style, elevation = "sm" }) {
  return (
    <View style={[styles.card, shadows[elevation] || shadows.sm, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
});
