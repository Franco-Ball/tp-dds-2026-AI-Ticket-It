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
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { compraService } from "../services/compraService";
import PurchaseCard from "../components/purchases/PurchaseCard";
import TicketQRModal from "../components/purchases/TicketQRModal";
import ReviewModal from "../components/reviews/ReviewModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { colors, spacing, borderRadius } from "../theme/theme";

const STATUS_FILTERS = [
  { id: "TODAS", label: "Todas" },
  { id: "CONFIRMADA", label: "Confirmadas" },
  { id: "UTILIZADA", label: "Utilizadas" },
  { id: "CANCELADA", label: "Canceladas / Reembolsadas" },
];

export default function MyPurchasesScreen() {
  const navigation = useNavigation();

  const [compras, setCompras] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("TODAS");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modales
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);

  const [reviewCompra, setReviewCompra] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const [refundCompra, setRefundCompra] = useState(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const cargarCompras = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const data = await compraService.obtenerMisCompras();
      if (Array.isArray(data)) {
        setCompras(data);
      } else {
        setCompras([]);
      }
    } catch (err) {
      setError(err?.message || "No se pudieron obtener tus compras");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarCompras();
    }, [cargarCompras])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarCompras(true);
  };

  // Filtrado de compras
  const comprasFiltradas = compras.filter((c) => {
    if (selectedFilter === "TODAS") return true;
    if (selectedFilter === "CANCELADA") {
      return c.estado === "CANCELADA" || c.estado === "REEMBOLSADA";
    }
    return c.estado === selectedFilter;
  });

  // Manejador de Ticket QR
  const handleViewTicket = (compra) => {
    setSelectedTicket(compra);
    setTicketModalVisible(true);
  };

  // Manejador de Chat (CU-05)
  const handleOpenChat = (compra) => {
    navigation.navigate("Chat", {
      compraId: compra.id,
      evento: compra.evento,
    });
  };

  // Manejador de Reseñas (CU-09)
  const handleOpenReview = (compra) => {
    setReviewCompra(compra);
    setReviewModalVisible(true);
  };

  // Manejador de Reembolso (CU-07, CU-08)
  const handleRequestRefundPrompt = (compra) => {
    setRefundCompra(compra);
    setRefundModalVisible(true);
  };

  const handleConfirmRefund = async () => {
    if (!refundCompra) return;
    setRefundSubmitting(true);
    try {
      await compraService.actualizarEstadoCompra(refundCompra.id, {
        estado: "REEMBOLSADA",
        motivo: "Cancelación y reembolso solicitado por el comprador",
      });

      setRefundModalVisible(false);
      setRefundCompra(null);
      Alert.alert(
        "Reembolso Procesado",
        "La compra fue cancelada y el reembolso fue emitido exitosamente. El cupo de tus entradas fue liberado."
      );
      cargarCompras(true);
    } catch (err) {
      Alert.alert("Error al reembolsar", err?.message || "No se pudo procesar la cancelación");
    } finally {
      setRefundSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Título de la pantalla */}
      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>Mis Compras y Entradas</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => cargarCompras(true)}
          accessibilityRole="button"
          accessibilityLabel="Recargar compras"
        >
          <Feather name="refresh-cw" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>
      <Text style={styles.screenSubtitle}>
        Monitorea tus espectáculos confirmados, días faltantes y códigos de acceso.
      </Text>

      {/* Selector Horizontal de Estados (Clase 10) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {STATUS_FILTERS.map((f) => {
          const isActive = selectedFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedFilter(f.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            {renderHeader()}
            <LoadingState message="Cargando tus entradas..." />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            {renderHeader()}
            <ErrorState message={error} onRetry={() => cargarCompras()} />
          </View>
        ) : comprasFiltradas.length === 0 ? (
          <FlatList
            data={[]}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <EmptyState
                icon="shopping-bag"
                title="No se encontraron compras"
                description={
                  selectedFilter === "TODAS"
                    ? "Aún no has adquirido entradas. Explora el catálogo de espectáculos para conseguir tus tickets."
                    : "No tienes compras en este estado actualmente."
                }
                actionLabel={selectedFilter === "TODAS" ? "Explorar Catálogo" : "Ver Todas"}
                onAction={() => {
                  if (selectedFilter === "TODAS") {
                    navigation.navigate("ExploreTab");
                  } else {
                    setSelectedFilter("TODAS");
                  }
                }}
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
            renderItem={({ item }) => (
              <PurchaseCard
                compra={item}
                onViewTicket={handleViewTicket}
                onOpenChat={handleOpenChat}
                onRequestRefund={handleRequestRefundPrompt}
                onOpenReview={handleOpenReview}
              />
            )}
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

        {/* Modal de Ticket y Código QR */}
        <TicketQRModal
          visible={ticketModalVisible}
          compra={selectedTicket}
          onClose={() => {
            setTicketModalVisible(false);
            setSelectedTicket(null);
          }}
        />

        {/* Modal de Calificaciones (CU-09) */}
        <ReviewModal
          visible={reviewModalVisible}
          compra={reviewCompra}
          onClose={() => {
            setReviewModalVisible(false);
            setReviewCompra(null);
          }}
          onSuccess={() => cargarCompras(true)}
        />

        {/* Modal de Confirmación de Cancelación / Reembolso (CU-07, CU-08) */}
        <ConfirmModal
          visible={refundModalVisible}
          title="Cancelar Compra y Reembolsar"
          message={`¿Estás seguro de que deseas cancelar tu compra para '${refundCompra?.evento?.nombre}'? Se reintegrará el cupo disponible y tu entrada ya no será válida para ingresar.`}
          confirmText={refundSubmitting ? "Procesando..." : "Sí, Cancelar y Reembolsar"}
          cancelText="Mantener Entrada"
          isDanger={true}
          onConfirm={handleConfirmRefund}
          onCancel={() => {
            setRefundModalVisible(false);
            setRefundCompra(null);
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
  centerContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
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
  screenSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  filtersScroll: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textInverse,
    fontWeight: "700",
  },
});

