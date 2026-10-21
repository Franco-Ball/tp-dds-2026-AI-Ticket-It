import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, borderRadius, shadows } from "../../theme/theme";

export default function RoleSelectorCard({ selectedRole, onSelectRole }) {
  const isComprador = selectedRole === "COMPRADOR";
  const isOrganizador = selectedRole === "ORGANIZADOR";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tu perfil de usuario:</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectRole("COMPRADOR")}
          style={[
            styles.card,
            isComprador && styles.cardSelected,
            isComprador && shadows.sm,
          ]}
        >
          <View style={[styles.iconCircle, isComprador && styles.iconCircleSelected]}>
            <Feather
              name="shopping-bag"
              size={20}
              color={isComprador ? "#ffffff" : colors.comprador}
            />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.cardTitle, isComprador && styles.cardTitleSelected]}>
              Comprador
            </Text>
            <Text style={styles.cardSubtitle}>Asistir a eventos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectRole("ORGANIZADOR")}
          style={[
            styles.card,
            isOrganizador && styles.cardSelected,
            isOrganizador && shadows.sm,
          ]}
        >
          <View style={[styles.iconCircle, isOrganizador && styles.iconCircleSelected]}>
            <Feather
              name="calendar"
              size={20}
              color={isOrganizador ? "#ffffff" : colors.organizador}
            />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.cardTitle, isOrganizador && styles.cardTitleSelected]}>
              Organizador
            </Text>
            <Text style={styles.cardSubtitle}>Publicar eventos</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    gap: 10,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconCircleSelected: {
    backgroundColor: colors.primary,
  },
  textContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  cardTitleSelected: {
    color: colors.primaryDark,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
