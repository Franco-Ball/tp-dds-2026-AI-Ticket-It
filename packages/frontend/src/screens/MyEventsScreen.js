import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";
import { eventoService } from "../services/eventoService";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import { colors, spacing, borderRadius, shadows } from "../theme/theme";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80";

export default function MyEventsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargarMisEventos = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const data = await eventoService.listarEventosPorOrganizador(user.id);
      if (Array.isArray(data)) {
        setEventos(data);
      } else {
        setEventos([]);
      }
    } catch (err) {
      setError(err?.message || "No se pudieron obtener tus eventos publicados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    cargarMisEventos();
  }, [cargarMisEventos]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarMisEventos(true);
  };

  // Métricas acumuladas del organizador
  const totalEventos = eventos.length;
  const totalCapacidad = eventos.reduce(
    (sum, ev) => sum + (Number(ev.cupoTotalDisponible) || 0),
    0
  );

  const formatDate = (isoString) => {
    try {
      if (!isoString) return "Fecha a confirmar";
      const d = new Date(isoString);
      return d.toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha a confirmar";
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Resumen métrico del organizador */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{totalEventos}</Text>
          <Text style={styles.metricLabel}>Eventos Activos</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{totalCapacidad}</Text>
          <Text style={styles.metricLabel}>Entradas en Venta</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {user?.reputacion ? user.reputacion.toFixed(1) : "5.0"}
          </Text>
          <Text style={styles.metricLabel}>Reputación</Text>
        </View>
      </View>

      {/* Título de sección y botón para publicar */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Tus Espectáculos Publicados</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate("CreateEventTab")}
          accessibilityRole="button"
          accessibilityLabel="Publicar nuevo evento"
        >
          <Feather name="plus" size={16} color={colors.textInverse} />
          <Text style={styles.createBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            {renderHeader()}
            <LoadingState message="Cargando tus eventos..." />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            {renderHeader()}
            <ErrorState message={error} onRetry={() => cargarMisEventos()} />
          </View>
        ) : eventos.length === 0 ? (
          <FlatList
            data={[]}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <EmptyState
                icon="calendar"
                title="Aún no has publicado eventos"
                description="Comienza a publicar espectáculos para vender entradas y gestionar tus cupos en tiempo real."
                actionLabel="+ Publicar Mi Primer Evento"
                onAction={() => navigation.navigate("CreateEventTab")}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primaryDark]}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => {
              const img =
                Array.isArray(item.multimedia) && item.multimedia.length > 0
                  ? item.multimedia[0]
                  : DEFAULT_IMAGE;

              const tiersCount = item.tiposEntrada?.length || 0;

              return (
                <View style={styles.eventItemCard}>
                  <Image source={{ uri: img }} style={styles.eventImage} resizeMode="cover" />

                  <View style={styles.eventItemBody}>
                    <View style={styles.eventTopRow}>
                      <Text style={styles.eventDate}>{formatDate(item.fecha)}</Text>
                      <Badge label="En Venta" variant="success" />
                    </View>

                    <Text style={styles.eventName} numberOfLines={2}>
                      {item.nombre}
                    </Text>

                    <Text style={styles.eventTiersInfo}>
                      {tiersCount} {tiersCount === 1 ? "sector" : "sectores"} configurados ·{" "}
                      {item.cupoTotalDisponible} cupos disponibles
                    </Text>

                    {/* Acciones del Organizador */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.detailBtn}
                        onPress={() =>
                          navigation.navigate("EventDetail", { eventoId: item.id })
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Ver detalle público del evento"
                      >
                        <Feather name="eye" size={14} color={colors.text} />
                        <Text style={styles.detailBtnText}>Ver Detalle</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.salesBtn}
                        onPress={() =>
                          navigation.navigate("EventSales", {
                            eventoId: item.id,
                            evento: item,
                          })
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Gestionar ventas y cupos"
                      >
                        <Feather name="bar-chart-2" size={14} color={colors.primaryDark} />
                        <Text style={styles.salesBtnText}>Ventas y Cupos</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primaryDark]}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  metricsBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  metricDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textInverse,
  },
  eventItemCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  eventImage: {
    width: "100%",
    height: 140,
    backgroundColor: colors.surfaceAlt,
  },
  eventItemBody: {
    padding: spacing.md,
  },
  eventTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
    textTransform: "uppercase",
  },
  eventName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  eventTiersInfo: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  detailBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  salesBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  salesBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 420,
    ...shadows.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  modalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.organizadorBg,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  modalEventName: {
    fontSize: 13,
    color: colors.textMuted,
  },
  modalCloseBtn: {
    padding: spacing.xs,
  },
  modalNotice: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  featuresList: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
});
