import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { colors, borderRadius, shadows } from "../../theme/theme";

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle,
}) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[size],
        isPrimary && styles.primary,
        isOutline && styles.outline,
        isDanger && styles.danger,
        isSecondary && styles.secondary,
        disabled && styles.disabled,
        isPrimary && !disabled && shadows.glow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isSecondary ? colors.primary : "#ffffff"} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              styles.textBase,
              styles[`text_${size}`],
              isPrimary && styles.textPrimary,
              isOutline && styles.textOutline,
              isDanger && styles.textDanger,
              isSecondary && styles.textSecondary,
              disabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    marginRight: 8,
  },
  // Tamaños
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // Variantes
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  // Tipografías
  textBase: {
    fontWeight: "700",
    textAlign: "center",
  },
  text_sm: {
    fontSize: 13,
  },
  text_md: {
    fontSize: 15,
  },
  text_lg: {
    fontSize: 16,
  },
  textPrimary: {
    color: "#ffffff",
  },
  textOutline: {
    color: colors.primaryDark,
  },
  textSecondary: {
    color: colors.text,
  },
  textDanger: {
    color: colors.error,
  },
  textDisabled: {
    color: colors.textSubtle,
  },
});
