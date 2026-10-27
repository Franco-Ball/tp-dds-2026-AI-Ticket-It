import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

import { eventoService } from "../services/eventoService";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { colors, spacing, borderRadius, shadows } from "../theme/theme";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80";

export default function EventDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventoId } = route.params || {};

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal preliminar de compra (acordado en grill-me)
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(1);

  const cargarDetalle = async () => {
    if (!eventoId) {
      setError("No se proporcionó el identificador del evento.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await eventoService.obtenerEventoPorId(eventoId);
      setEvento(data);
    } catch (err) {
      setError(err?.message || "No se pudo cargar el detalle del evento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [eventoId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <LoadingState message="Cargando detalles del espectáculo..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !evento) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ErrorState
            title="Error al cargar evento"
            message={error || "El evento solicitado no existe."}
            onRetry={cargarDetalle}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Cálculos de fecha y precios
  const formatDate = (isoString) => {
    try {
      if (!isoString) return "Fecha a confirmar";
      const d = new Date(isoString);
      return d.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha a confirmar";
    }
  };

  const images =
    Array.isArray(evento.multimedia) && evento.multimedia.length > 0
      ? evento.multimedia
      : [DEFAULT_IMAGE];

  const tiposEntrada = Array.isArray(evento.tiposEntrada) ? evento.tiposEntrada : [];
  const selectedTier = tiposEntrada[selectedTierIndex] || tiposEntrada[0];
  const maxQuota = selectedTier?.cupoDisponible ?? 1;
  const precioUnitario = selectedTier?.precio ?? 0;
  const precioTotalCalculado = precioUnitario * ticketQuantity;
  const estaAgotado = (evento.cupoTotalDisponible ?? 0) <= 0;

  const reputacion = evento.organizador?.reputacion ?? evento.puntajePromedio ?? 0;
  const totalResenias = evento.organizador?.totalResenias ?? 0;
  const reseniasAnteriores = Array.isArray(evento.reseniasAnteriores)
    ? evento.reseniasAnteriores
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header con Imagen de Portada y Botón Volver */}
          <View style={styles.heroWrapper}>
            <Image
              source={{ uri: images[0] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Volver a la pantalla anterior"
            >
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.categoryBadgeWrapper}>
              <Badge
                label={evento.categoria?.nombre || "Espectáculo"}
                variant="primary"
              />
            </View>
          </View>

          {/* Información Principal del Evento */}
          <View style={styles.mainInfoSection}>
            <Text style={styles.eventTitle}>{evento.nombre}</Text>

            {/* Fecha y Horario */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconCircle}>
                <Feather name="calendar" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Fecha y Horario</Text>
                <Text style={styles.infoValue}>{formatDate(evento.fecha)}</Text>
              </View>
            </View>

            {/* Ubicación */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconCircle}>
                <Feather name="map-pin" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Lugar del Evento</Text>
                <Text style={styles.infoValue}>Estadio / Sala Principal (Buenos Aires)</Text>
              </View>
            </View>

            {/* Cupos globales */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconCircle}>
                <Feather name="users" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Disponibilidad Total</Text>
                <Text style={styles.infoValue}>
                  {estaAgotado
                    ? "Entradas completamente agotadas"
                    : `${evento.cupoTotalDisponible} entradas disponibles en total`}
                </Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Acerca del Evento</Text>
            <Text style={styles.descriptionText}>
              {evento.descripcion || "Sin descripción proporcionada."}
            </Text>
          </Card>

          {/* Tipos de Entrada Disponibles (CU-04, CU-12) */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tipos de Entrada</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona tu ubicación preferida. Los cupos se reservan al iniciar la compra.
            </Text>

            <View style={styles.tiersList}>
              {tiposEntrada.map((tier) => {
                const cupoDisp = tier.cupoDisponible ?? tier.cupoTotal ?? 0;
                const tierAgotado = cupoDisp <= 0;

                return (
                  <View key={tier.id || tier.nombre} style={styles.tierItem}>
                    <View style={styles.tierHeader}>
                      <View style={styles.tierNameWrapper}>
                        <Text style={styles.tierName}>{tier.nombre}</Text>
                        {tier.descripcion ? (
                          <Text style={styles.tierDesc}>{tier.descripcion}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.tierPrice}>
                        ${Number(tier.precio).toLocaleString("es-AR")}
                      </Text>
                    </View>

                    <View style={styles.tierFooter}>
                      <Badge
                        label={tierAgotado ? "Agotado" : `${cupoDisp} disponibles`}
                        variant={tierAgotado ? "error" : "success"}
                      />
                      <Text style={styles.tierCupoTotal}>
                        Capacidad: {tier.cupoTotal}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Sección del Organizador y Reseñas Previas (CU-10) */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Organizado por</Text>

            <View style={styles.organizerRow}>
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerInitials}>
                  {evento.organizador?.nombre?.charAt(0) || "O"}
                  {evento.organizador?.apellido?.charAt(0) || "R"}
                </Text>
              </View>

              <View style={styles.organizerInfo}>
                <View style={styles.organizerNameRow}>
                  <Text style={styles.organizerName}>
                    {evento.organizador?.nombre} {evento.organizador?.apellido}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={11} color={colors.textInverse} />
                  </View>
                </View>

                <Text style={styles.organizerEmail}>{evento.organizador?.email}</Text>

                <View style={styles.reputationScoreRow}>
                  <Feather name="star" size={14} color="#eab308" />
                  <Text style={styles.reputationScore}>
                    {reputacion > 0 ? reputacion.toFixed(1) : "Nuevo"}
                  </Text>
                  <Text style={styles.reputationCount}>
                    ({totalResenias} {totalResenias === 1 ? "opinión" : "opiniones"})
                  </Text>
                </View>
              </View>
            </View>

            {/* Opiniones de eventos anteriores (CU-10) */}
            {reseniasAnteriores.length > 0 ? (
              <View style={styles.reviewsContainer}>
                <Text style={styles.reviewsSubtitle}>Opiniones de asistentes anteriores:</Text>
                {reseniasAnteriores.map((resenia, idx) => (
                  <View key={resenia.id || idx} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewStars}>
                        {[...Array(5)].map((_, i) => (
                          <Feather
                            key={i}
                            name="star"
                            size={12}
                            color={i < (resenia.puntuacion || 5) ? "#eab308" : colors.border}
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(resenia.fecha).toLocaleDateString("es-AR")}
                      </Text>
                    </View>
                    <Text style={styles.reviewComment}>&ldquo;{resenia.detalle}&rdquo;</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noReviewsText}>
                Este organizador aún no posee reseñas históricas registradas.
              </Text>
            )}
          </Card>
        </ScrollView>

        {/* Barra Flotante de Compra (CTA) */}
        <View style={styles.stickyFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.footerPriceLabel}>Entradas desde</Text>
            <Text style={styles.footerPriceValue}>
              ${Number(evento.precioMinimo ?? 0).toLocaleString("es-AR")}
            </Text>
          </View>

          <View style={styles.buyButtonWrapper}>
            <Button
              title={estaAgotado ? "Agotado" : "Comprar Entradas"}
              onPress={() => setPurchaseModalVisible(true)}
              disabled={estaAgotado}
              icon="shopping-cart"
              variant="primary"
            />
          </View>
        </View>

        {/* Modal Preliminar de Selección de Compra (CU-12 preview) */}
        <Modal
          visible={purchaseModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPurchaseModalVisible(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPurchaseModalVisible(false)}
          >
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adquirir Entradas</Text>
                <TouchableOpacity
                  onPress={() => setPurchaseModalVisible(false)}
                  style={styles.modalCloseBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar modal de compra"
                >
                  <Feather name="x" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                {evento.nombre} · {formatDate(evento.fecha)}
              </Text>

              {/* Selector de Tipo de Entrada */}
              <Text style={styles.modalSectionLabel}>1. Selecciona la Ubicación:</Text>
              <View style={styles.tierSelectorList}>
                {tiposEntrada.map((tier, idx) => {
                  const isSelected = selectedTierIndex === idx;
                  const cupo = tier.cupoDisponible ?? tier.cupoTotal ?? 0;
                  const agotado = cupo <= 0;

                  return (
                    <TouchableOpacity
                      key={tier.id || tier.nombre}
                      style={[
                        styles.tierSelectOption,
                        isSelected && styles.tierSelectOptionActive,
                        agotado && styles.tierSelectOptionDisabled,
                      ]}
                      onPress={() => {
                        if (!agotado) {
                          setSelectedTierIndex(idx);
                          setTicketQuantity(1);
                        }
                      }}
                      disabled={agotado}
                      activeOpacity={0.7}
                    >
                      <View style={styles.tierSelectLeft}>
                        <Text
                          style={[
                            styles.tierSelectName,
                            isSelected && styles.tierSelectNameActive,
                          ]}
                        >
                          {tier.nombre}
                        </Text>
                        <Text style={styles.tierSelectQuota}>
                          {agotado ? "Agotado" : `${cupo} cupos restantes`}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.tierSelectPrice,
                          isSelected && styles.tierSelectPriceActive,
                        ]}
                      >
                        ${Number(tier.precio).toLocaleString("es-AR")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selector de Cantidad */}
              <Text style={styles.modalSectionLabel}>2. Cantidad de Entradas:</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={[styles.qtyButton, ticketQuantity <= 1 && styles.qtyButtonDisabled]}
                  onPress={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  disabled={ticketQuantity <= 1}
                  accessibilityLabel="Restar una entrada"
                >
                  <Feather name="minus" size={18} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.qtyDisplay}>
                  <Text style={styles.qtyDisplayText}>{ticketQuantity}</Text>
                  <Text style={styles.qtyDisplaySub}>
                    de {Math.min(maxQuota, 10)} máx.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.qtyButton,
                    ticketQuantity >= Math.min(maxQuota, 10) && styles.qtyButtonDisabled,
                  ]}
                  onPress={() =>
                    setTicketQuantity(Math.min(maxQuota, 10, ticketQuantity + 1))
                  }
                  disabled={ticketQuantity >= Math.min(maxQuota, 10)}
                  accessibilityLabel="Sumar una entrada"
                >
                  <Feather name="plus" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Total Calculado */}
              <View style={styles.totalSummaryCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total a Pagar:</Text>
                  <Text style={styles.totalValue}>
                    ${Number(precioTotalCalculado).toLocaleString("es-AR")}
                  </Text>
                </View>

                {/* Banner Sprint 6 */}
                <View style={styles.sprintBanner}>
                  <Feather name="info" size={15} color={colors.primaryDark} />
                  <Text style={styles.sprintBannerText}>
                    El procesamiento transaccional de pagos, emisión de QR y reserva de 15 min se activará en el Sprint 6.
                  </Text>
                </View>
              </View>

              {/* Confirmación */}
              <Button
                title="Entendido (Listo para Sprint 6)"
                onPress={() => setPurchaseModalVisible(false)}
                variant="primary"
                icon="check"
              />
            </Pressable>
          </Pressable>
        </Modal>
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
  scrollContent: {
    paddingBottom: 110,
  },
  heroWrapper: {
    width: "100%",
    height: 240,
    backgroundColor: colors.surfaceAlt,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  categoryBadgeWrapper: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
  },
  mainInfoSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSubtle,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  sectionCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  tiersList: {
    gap: spacing.sm,
  },
  tierItem: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  tierNameWrapper: {
    flex: 1,
    marginRight: spacing.sm,
  },
  tierName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  tierDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  tierPrice: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  tierFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  tierCupoTotal: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: "600",
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.organizadorBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.organizador,
    marginRight: spacing.md,
  },
  organizerInitials: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.organizador,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  organizerEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  reputationScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  reputationScore: {
    fontSize: 13,
    fontWeight: "800",
    color: "#854d0e",
  },
  reputationCount: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  reviewsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  reviewsSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewItem: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  reviewComment: {
    fontSize: 13,
    color: colors.text,
    fontStyle: "italic",
  },
  noReviewsText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.md,
  },
  priceContainer: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  buyButtonWrapper: {
    flex: 1.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    maxHeight: "85%",
  },
  sheetHandle: {
    width: 44,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tierSelectorList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tierSelectOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tierSelectOptionActive: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primaryLight,
  },
  tierSelectOptionDisabled: {
    opacity: 0.45,
  },
  tierSelectLeft: {
    flex: 1,
  },
  tierSelectName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  tierSelectNameActive: {
    color: colors.primaryDark,
  },
  tierSelectQuota: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tierSelectPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  tierSelectPriceActive: {
    color: colors.primaryDark,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  qtyButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  qtyButtonDisabled: {
    opacity: 0.35,
  },
  qtyDisplay: {
    alignItems: "center",
    minWidth: 90,
  },
  qtyDisplayText: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  qtyDisplaySub: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: "600",
  },
  totalSummaryCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  sprintBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  sprintBannerText: {
    fontSize: 11,
    color: colors.text,
    flex: 1,
    lineHeight: 16,
    fontWeight: "600",
  },
});
