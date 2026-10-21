import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { colors, borderRadius, spacing } from "../theme/theme";

export default function HomeScreen() {
  const { user, isOrganizador } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Banner de Bienvenida */}
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroGreeting}>¡Bienvenido a Ticket It!</Text>
            <Text style={styles.heroName}>
              {user?.nombre} {user?.apellido}
            </Text>
          </View>
          <Badge
            label={isOrganizador ? "Organizador" : "Comprador"}
            variant={user?.rol}
          />
        </View>

        <Text style={styles.heroDescription}>
          {isOrganizador
            ? "Gestiona tus eventos, controla cupos en tiempo real y supervisa tus ventas de entradas."
            : "Descubre espectáculos, adquiere entradas con un solo clic y gestiona tus reservas de forma segura."}
        </Text>
      </Card>

      {/* Tarjeta de Estado del Sprint 2 */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>Sprint 2 Completado</Text>
          </View>
          <Text style={styles.techText}>React Native + Expo</Text>
        </View>

        <Text style={styles.sectionSubtitle}>Infraestructura Mobile y UX/UI Oficial</Text>

        <View style={styles.checklist}>
          <View style={styles.checkItem}>
            <Feather name="check-circle" size={18} color={colors.primary} />
            <View style={styles.checkText}>
              <Text style={styles.checkTitle}>Aplicación Nativa en React Native</Text>
              <Text style={styles.checkDesc}>Ejecución en Expo Go, emulador móvil y web</Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <Feather name="check-circle" size={18} color={colors.primary} />
            <View style={styles.checkText}>
              <Text style={styles.checkTitle}>Identidad Visual de la Cátedra</Text>
              <Text style={styles.checkDesc}>Logo oficial y paleta Clean & Bright (#55d233)</Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <Feather name="check-circle" size={18} color={colors.primary} />
            <View style={styles.checkText}>
              <Text style={styles.checkTitle}>Sesión Persistente con AsyncStorage</Text>
              <Text style={styles.checkDesc}>Autenticación JWT y control de roles nativo</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Acciones del Sprint 3 */}
      <Text style={styles.sectionTitle}>Próximos Pasos (Sprint 3)</Text>

      {isOrganizador ? (
        <Card style={styles.actionCard}>
          <View style={[styles.actionIconCircle, { backgroundColor: colors.organizadorBg }]}>
            <Feather name="plus-circle" size={22} color={colors.organizador} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Publicación de Eventos (Sprint 3)</Text>
            <Text style={styles.actionDesc}>
              Creación de espectáculos con entradas segmentadas (General, Platea, VIP).
            </Text>
          </View>
        </Card>
      ) : (
        <Card style={styles.actionCard}>
          <View style={[styles.actionIconCircle, { backgroundColor: colors.compradorBg }]}>
            <Feather name="compass" size={22} color={colors.comprador} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Explorar Catálogo (Sprint 3)</Text>
            <Text style={styles.actionDesc}>
              Búsqueda en tiempo real, filtros por categoría y ordenamiento por precio y puntaje.
            </Text>
          </View>
        </Card>
      )}
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
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    padding: 20,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  heroDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 10,
  },
  statusCard: {
    padding: 18,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  techText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  checklist: {
    gap: 12,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkText: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  checkDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10,
    marginTop: 4,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  actionDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});
