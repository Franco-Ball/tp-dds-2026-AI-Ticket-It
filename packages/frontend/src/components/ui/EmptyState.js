import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Button from "./Button";
import { colors, spacing, borderRadius } from "../../theme/theme";

export default function EmptyState({
  icon = "search",
  title = "No se encontraron eventos",
  description = "No hay espectáculos que coincidan con los filtros de búsqueda aplicados. Intenta con otros términos o categorías.",
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={32} color={colors.primaryDark} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <View style={styles.buttonWrapper}>
          <Button
            title={actionLabel}
            onPress={onAction}
            icon="x"
            variant="outline"
          />
        </View>
      )}
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
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  buttonWrapper: {
    minWidth: 170,
  },
});
