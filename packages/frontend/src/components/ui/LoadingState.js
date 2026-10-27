import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing, borderRadius } from "../../theme/theme";

export default function LoadingState({ message = "Cargando eventos..." }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerWrapper: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textMuted,
    textAlign: "center",
  },
});
