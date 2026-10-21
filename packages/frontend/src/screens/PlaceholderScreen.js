import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "../components/ui/Card";
import { colors, borderRadius, spacing } from "../theme/theme";

export default function PlaceholderScreen({ route }) {
  const title = route?.params?.title || "Módulo en Desarrollo";
  const sprint = route?.params?.sprint || "Sprint 3";
  const description =
    route?.params?.description ||
    "Esta sección será implementada en los siguientes sprints según la planificación de la cátedra.";

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.iconCircle}>
          <Feather name="layers" size={32} color={colors.primaryDark} />
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{sprint}</Text>
        </View>

        <Text style={styles.description}>{description}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    alignItems: "center",
    padding: 28,
    width: "100%",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryDark,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
