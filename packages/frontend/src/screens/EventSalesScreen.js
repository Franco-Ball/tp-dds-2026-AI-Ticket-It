import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

import { compraService } from "../services/compraService";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { colors, spacing, borderRadius, shadows } from "../theme/theme";

export default function EventSalesScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventoId } = route.params || {};

  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("TODAS");

  // Validación de entrada en puerta (Marcar UTILIZADA)
  const [selectedTicketToValidate, setSelectedTicketToValidate] = useState(null);
  const [validateModalVisible, setValidateModalVisible] = useState(false);
  const [validating, setValidating] = useState(false);

  const cargarVentas = useCallback(async (isRefresh = false) => {
    if (!eventoId) return;
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const data = await compraService.obtenerComprasDeEvento(eventoId);
      setSalesData(data);
    } catch (err) {
      setError(err?.message || "No se pudieron obtener las ventas del evento");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventoId]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarVentas(true);
  };

  const handleOpenValidatePrompt = (compra) => {
    setSelectedTicketToValidate(compra);
    setValidateModalVisible(true);
  };

  const handleConfirmValidate = async () => {
    if (!selectedTicketToValidate) return;
    setValidating(true);
    try {
      await compraService.actualizarEstadoCompra(selectedTicketToValidate.id, {
        estado: "UTILIZADA",
        motivo: "Entrada validada en puerta por el organizador",
      });

      setValidateModalVisible(false);
      setSelectedTicketToValidate(null);
      Alert.alert(
        "¡Entrada Validada con Éxito!",
        "La entrada ha sido marcada como UTILIZADA. El comprador ahora está habilitado para calificar el evento (CU-09)."
      );
      cargarVentas(true);
    } catch (err) {
      Alert.alert("Error al validar", err?.message || "No se pudo actualizar el estado de la entrada");
    } finally {
      setValidating(false);
    }
  };

  const handleOpenChat = (compra) => {
    navigation.navigate("Chat", {
      compraId: compra.id,
      evento: salesData?.evento,
      comprador: compra.comprador,
    });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <LoadingState message="Cargando métricas y ventas del evento..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !salesData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ErrorState
            title="Error al cargar ventas"
            message={error || "No se encontró información del evento."}
            onRetry={cargarVentas}
          />
        </View>
      </SafeAreaView>
    );
  }

  const evento = salesData?.evento || route.params?.evento || { id: salesData?.eventoId || eventoId, nombre: salesData?.nombreEvento || "Evento" };
  const resumen = salesData?.resumen || {
    totalRecaudado: salesData?.totalRecaudado || 0,
    totalEntradasVendidas: salesData?.totalEntradasVendidas || 0,
    totalCupoDisponible: (salesData?.cuposPorTipoEntrada || []).reduce((acc, t) => acc + (t.cupoDisponible || 0), 0),
  };
  const cuposPorTipoEntrada = salesData?.cuposPorTipoEntrada || [];
  const compras = salesData?.compras || [];

  const comprasFiltradas = (compras || []).filter((c) => {
    if (statusFilter === "TODAS") return true;
    if (statusFilter === "CANCELADA") {
      return c.estado === "CANCELADA" || c.estado === "REEMBOLSADA";
    }
    return c.estado === statusFilter;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Botón Volver y Título */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver a mis eventos"
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarText}>
          <Text style={styles.screenTitle}>Panel de Ventas (CU-02)</Text>
          <Text style={styles.eventName} numberOfLines={1}>
            {evento.nombre}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => cargarVentas(true)}
          accessibilityRole="button"
          accessibilityLabel="Actualizar métricas"
        >
          <Feather name="refresh-cw" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Tarjetas Métricas Resumen */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>
            ${Number(resumen?.totalRecaudado || 0).toLocaleString("es-AR")}
          </Text>
          <Text style={styles.metricSub}>Recaudación Total</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{resumen?.totalEntradasVendidas || 0}</Text>
          <Text style={styles.metricSub}>Entradas Vendidas</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{resumen?.totalCupoDisponible || 0}</Text>
          <Text style={styles.metricSub}>Cupos Restantes</Text>
        </View>
      </View>

      {/* CU-02: Desglose de Cupos por Tipo de Entrada */}
      <Card style={styles.tiersSectionCard}>
        <View style={styles.sectionHeader}>
          <Feather name="pie-chart" size={16} color={colors.primaryDark} />
          <Text style={styles.sectionHeading}>Cupos por Tipo de Entrada (CU-02)</Text>
        </View>

        <View style={styles.tiersList}>
          {(cuposPorTipoEntrada || []).map((t) => {
            const vendidos = t.entradasVendidas || 0;
            const disponibles = t.cupoDisponible || 0;
            const total = t.cupoTotal || 1;
            const porcentaje = Math.min(100, Math.round((vendidos / total) * 100));

            return (
              <View key={t.tipoEntradaId || t.nombre} style={styles.tierItem}>
                <View style={styles.tierTopRow}>
                  <Text style={styles.tierName}>{t.nombre}</Text>
                  <Text style={styles.tierPrice}>
                    ${Number(t.precio || 0).toLocaleString("es-AR")}
                  </Text>
                </View>

                {/* Barra de progreso de cupos */}
                <View style={styles.progressBarWrapper}>
                  <View style={[styles.progressBarFill, { width: `${porcentaje}%` }]} />
                </View>

                <View style={styles.tierStatsRow}>
                  <Text style={styles.tierStatsText}>
                    Vendidas: <Text style={{ fontWeight: "800", color: colors.text }}>{vendidos}</Text>
                  </Text>
                  <Badge
                    label={`${disponibles} disponibles`}
                    variant={disponibles > 0 ? "success" : "error"}
                  />
                  <Text style={styles.tierStatsText}>
                    Capacidad: <Text style={{ fontWeight: "700" }}>{total}</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Encabezado de la lista de Compradores */}
      <View style={styles.buyersHeaderRow}>
        <Text style={styles.buyersTitle}>
          Asistentes y Compras ({comprasFiltradas.length})
        </Text>
      </View>

      {/* Filtros por estado */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {[
          { id: "TODAS", label: "Todas" },
          { id: "CONFIRMADA", label: "Confirmadas" },
          { id: "UTILIZADA", label: "Utilizadas" },
          { id: "CANCELADA", label: "Canceladas / Reembolsos" },
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterPill, statusFilter === f.id && styles.filterPillActive]}
            onPress={() => setStatusFilter(f.id)}
          >
            <Text
              style={[
                styles.filterPillText,
                statusFilter === f.id && styles.filterPillTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {comprasFiltradas.length === 0 ? (
          <FlatList
            data={[]}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <EmptyState
                icon="users"
                title="Sin compras registradas"
                description="Aún no se registran compras para este evento en el estado seleccionado."
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
            data={comprasFiltradas}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => {
              const comprador = item.comprador || {};
              const tipo = item.tipoEntrada || {};
              const esConfirmada = item.estado === "CONFIRMADA";

              return (
                <View style={styles.buyerCard}>
                  <View style={styles.buyerTop}>
                    <View style={styles.buyerAvatar}>
                      <Text style={styles.buyerInitials}>
                        {comprador.nombre ? comprador.nombre.charAt(0) : "C"}
                        {comprador.apellido ? comprador.apellido.charAt(0) : "P"}
                      </Text>
                    </View>

                    <View style={styles.buyerDetails}>
                      <Text style={styles.buyerName}>
                        {comprador.nombre} {comprador.apellido}
                      </Text>
                      <Text style={styles.buyerEmail}>{comprador.email}</Text>
                    </View>

                    <Badge
                      label={item.estado}
                      variant={
                        item.estado === "CONFIRMADA"
                          ? "success"
                          : item.estado === "UTILIZADA"
                          ? "organizador"
                          : "error"
                      }
                    />
                  </View>

                  <View style={styles.ticketSummaryBox}>
                    <View style={styles.ticketSummaryCol}>
                      <Text style={styles.ticketSummaryLabel}>SECTOR</Text>
                      <Text style={styles.ticketSummaryVal}>{tipo.nombre || "General"}</Text>
                    </View>
                    <View style={styles.ticketSummaryCol}>
                      <Text style={styles.ticketSummaryLabel}>CANTIDAD</Text>
                      <Text style={styles.ticketSummaryVal}>{item.cantidad} entrada(s)</Text>
                    </View>
                    <View style={styles.ticketSummaryCol}>
                      <Text style={styles.ticketSummaryLabel}>TOTAL</Text>
                      <Text style={styles.ticketSummaryPrice}>
                        ${Number(item.total).toLocaleString("es-AR")}
                      </Text>
                    </View>
                  </View>

                  {/* Acciones del Organizador */}
                  <View style={styles.buyerActions}>
                    {/* Botón de Validación de Acceso en Puerta */}
                    {esConfirmada && (
                      <TouchableOpacity
                        style={styles.validateBtn}
                        onPress={() => handleOpenValidatePrompt(item)}
                        accessibilityRole="button"
                        accessibilityLabel="Validar entrada en puerta como UTILIZADA"
                      >
                        <Feather name="check-circle" size={14} color={colors.textInverse} />
                        <Text style={styles.validateBtnText}>Validar Acceso (Puerta)</Text>
                      </TouchableOpacity>
                    )}

                    {/* Chat con Comprador (CU-06) */}
                    <TouchableOpacity
                      style={styles.chatBuyerBtn}
                      onPress={() => handleOpenChat(item)}
                      accessibilityRole="button"
                      accessibilityLabel="Abrir chat con el comprador"
                    >
                      <Feather name="message-square" size={14} color={colors.text} />
                      <Text style={styles.chatBuyerBtnText}>Chat Comprador</Text>
                    </TouchableOpacity>
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

        {/* Modal Confirmación de Check-in (UTILIZADA) */}
        <ConfirmModal
          visible={validateModalVisible}
          title="Validar Entrada en Puerta"
          message={`¿Confirmas el ingreso de ${selectedTicketToValidate?.comprador?.nombre} ${selectedTicketToValidate?.comprador?.apellido}? La entrada quedará registrada como UTILIZADA.`}
          confirmText={validating ? "Validando..." : "Confirmar Ingreso"}
          cancelText="Cancelar"
          isDanger={false}
          onConfirm={handleConfirmValidate}
          onCancel={() => {
            setValidateModalVisible(false);
            setSelectedTicketToValidate(null);
          }}
        />
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarText: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  eventName: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: "700",
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    ...shadows.sm,
  },
  metricVal: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  metricSub: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  tiersSectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  tiersList: {
    gap: spacing.md,
  },
  tierItem: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tierName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginVertical: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primaryDark,
  },
  tierStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  tierStatsText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  buyersHeaderRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  buyersTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  filterScroll: {
    marginVertical: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  filterPillActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  filterPillTextActive: {
    color: colors.textInverse,
    fontWeight: "700",
  },
  buyerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  buyerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  buyerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  buyerInitials: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  buyerDetails: {
    flex: 1,
  },
  buyerName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  buyerEmail: {
    fontSize: 12,
    color: colors.textMuted,
  },
  ticketSummaryBox: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  ticketSummaryCol: {
    flex: 1,
  },
  ticketSummaryLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textSubtle,
  },
  ticketSummaryVal: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginTop: 1,
  },
  ticketSummaryPrice: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.primaryDark,
    marginTop: 1,
  },
  buyerActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  validateBtn: {
    flex: 1.3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDark,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  validateBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textInverse,
  },
  chatBuyerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  chatBuyerBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
});

