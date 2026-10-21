import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { colors, borderRadius, spacing } from "../theme/theme";

export default function ProfileScreen() {
  const { user, isOrganizador, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("¿Estás seguro de que deseas cerrar tu sesión?")) {
        logout();
      }
    } else {
      Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar tu sesión?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar Sesión", style: "destructive", onPress: logout },
      ]);
    }
  };

  const initials = `${user?.nombre?.[0] || ""}${user?.apellido?.[0] || ""}`.toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header del Perfil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "U"}</Text>
        </View>
        <Text style={styles.name}>
          {user?.nombre} {user?.apellido}
        </Text>
        <Badge
          label={isOrganizador ? "Organizador de Eventos" : "Comprador de Entradas"}
          variant={user?.rol}
        />
      </View>

      {/* Detalles de la Cuenta */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Información de la Cuenta</Text>

        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.compradorBg }]}>
            <Feather name="mail" size={18} color={colors.comprador} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Correo Electrónico</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
            <Feather name="shield" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Rol en la Plataforma</Text>
            <Text style={styles.infoValue}>{user?.rol}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.organizadorBg }]}>
            <Feather name="key" size={18} color={colors.organizador} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Identificador Único</Text>
            <Text style={styles.infoValueSmall}>{user?.id}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceAlt }]}>
            <Feather name="calendar" size={18} color={colors.textMuted} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Fecha de Registro</Text>
            <Text style={styles.infoValue}>
              {user?.fechaCreacion ? new Date(user.fechaCreacion).toLocaleDateString() : "Hoy"}
            </Text>
          </View>
        </View>
      </Card>

      {/* Botón de Logout */}
      <Button
        title="Cerrar Sesión"
        variant="danger"
        icon={<Feather name="log-out" size={18} color={colors.error} />}
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    alignItems: "center",
    marginVertical: 18,
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  card: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginTop: 1,
  },
  infoValueSmall: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  logoutBtn: {
    marginTop: 10,
    marginBottom: 30,
  },
});
