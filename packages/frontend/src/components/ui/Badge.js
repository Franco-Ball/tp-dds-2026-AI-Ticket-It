import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, borderRadius } from "../../theme/theme";

export default function Badge({ label, variant = "default", style, textStyle }) {
  const isComprador = variant === "COMPRADOR" || variant === "comprador";
  const isOrganizador = variant === "ORGANIZADOR" || variant === "organizador";
  const isSuccess = variant === "success";

  return (
    <View
      style={[
        styles.badge,
        isComprador && styles.badgeComprador,
        isOrganizador && styles.badgeOrganizador,
        isSuccess && styles.badgeSuccess,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isComprador && styles.textComprador,
          isOrganizador && styles.textOrganizador,
          isSuccess && styles.textSuccess,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeComprador: {
    backgroundColor: colors.compradorBg,
    borderColor: "rgba(2, 132, 199, 0.3)",
  },
  badgeOrganizador: {
    backgroundColor: colors.organizadorBg,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  badgeSuccess: {
    backgroundColor: colors.successBg,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  textComprador: {
    color: colors.comprador,
  },
  textOrganizador: {
    color: colors.organizador,
  },
  textSuccess: {
    color: colors.success,
  },
});
