import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Badge from "../ui/Badge";
import { colors, borderRadius, spacing, shadows } from "../../theme/theme";

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80";

export default function PurchaseCard({
  compra,
  onViewTicket,
  onOpenChat,
  onRequestRefund,
  onOpenReview,
  onPayPending,
}) {
  const evento = compra.evento || {};
  const tipoEntrada = compra.tipoEntrada || {};
  const estado = compra.estado || "CONFIRMADA";

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

  const imageUrl =
    Array.isArray(evento.multimedia) && evento.multimedia.length > 0
      ? evento.multimedia[0]
      : DEFAULT_EVENT_IMAGE;

  // Estado badge variant
  const getBadgeVariant = (st) => {
    switch (st) {
      case "CONFIRMADA":
        return "success";
      case "UTILIZADA":
        return "organizador";
      case "PENDIENTE":
        return "warning";
      case "CANCELADA":
      case "REEMBOLSADA":
        return "error";
      default:
        return "default";
    }
  };

  // CU-01: Cálculo de días faltantes en compras confirmadas
  const diasFaltantes = compra.diasFaltantes;
  const showCountdown = estado === "CONFIRMADA" && diasFaltantes !== undefined && diasFaltantes !== null;

  const getCountdownLabel = () => {
    if (diasFaltantes > 1) return `⏱️ Faltan ${diasFaltantes} días para el evento`;
    if (diasFaltantes === 1) return `⏱️ ¡Falta solo 1 día para el evento!`;
    if (diasFaltantes === 0) return `🎉 ¡El evento es hoy!`;
    return `Evento finalizado`;
  };

  // CU-07, CU-08: Puede cancelar si es CONFIRMADA y el evento no se realizó
  const puedeReembolsar =
    estado === "CONFIRMADA" &&
    evento.fecha &&
    new Date(evento.fecha) > new Date();

  return (
    <View style={styles.card}>
      {/* Header con Imagen de fondo / avatar */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.headerInfo}>
          <View style={styles.badgeRow}>
            <Badge label={estado} variant={getBadgeVariant(estado)} />
            <Text style={styles.purchaseId}>#{compra.id ? compra.id.slice(0, 8) : ""}</Text>
          </View>
          <Text style={styles.eventName} numberOfLines={2}>
            {evento.nombre || "Espectáculo"}
          </Text>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={12} color={colors.primaryDark} />
            <Text style={styles.eventDate}>{formatDate(evento.fecha)}</Text>
          </View>
        </View>
      </View>

      {/* CU-01: Badge destacado de días faltantes */}
      {showCountdown && (
        <View style={styles.countdownBanner}>
          <Feather name="clock" size={15} color={colors.primaryDark} />
          <Text style={styles.countdownText}>{getCountdownLabel()}</Text>
        </View>
      )}

      {/* Cuerpo del ticket */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>SECTOR</Text>
            <Text style={styles.infoValue}>{tipoEntrada.nombre || "Entrada General"}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>CANTIDAD</Text>
            <Text style={styles.infoValue}>{compra.cantidad || 1} u.</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>TOTAL</Text>
            <Text style={styles.infoValuePrice}>
              ${Number(compra.total || 0).toLocaleString("es-AR")}
            </Text>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.divider} />

        {/* Acciones Contextuales */}
        <View style={styles.actionsContainer}>
          {/* Si está pendiente de pago */}
          {estado === "PENDIENTE" && onPayPending && (
            <TouchableOpacity
              style={styles.payPendingBtn}
              onPress={() => onPayPending(compra)}
              accessibilityRole="button"
              accessibilityLabel="Completar pago pendiente"
            >
              <Feather name="credit-card" size={14} color={colors.textInverse} />
              <Text style={styles.payPendingBtnText}>Pagar Ahora (15 min)</Text>
            </TouchableOpacity>
          )}

          {/* Si está confirmada o utilizada: Ver ticket QR */}
          {(estado === "CONFIRMADA" || estado === "UTILIZADA") && (
            <TouchableOpacity
              style={styles.ticketBtn}
              onPress={() => onViewTicket(compra)}
              accessibilityRole="button"
              accessibilityLabel="Ver entrada y código QR"
            >
              <Feather name="maximize" size={14} color={colors.primaryDark} />
              <Text style={styles.ticketBtnText}>Ver Entrada / QR</Text>
            </TouchableOpacity>
          )}

          {/* Chat con organizador (CU-05) */}
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => onOpenChat(compra)}
            accessibilityRole="button"
            accessibilityLabel="Abrir chat de la compra con el organizador"
          >
            <Feather name="message-square" size={14} color={colors.text} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>

          {/* Calificar evento si fue utilizada (CU-09) */}
          {estado === "UTILIZADA" && (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => onOpenReview(compra)}
              accessibilityRole="button"
              accessibilityLabel="Puntuar y dejar reseña al evento"
            >
              <Feather name="star" size={14} color="#eab308" />
              <Text style={styles.reviewBtnText}>Calificar (CU-09)</Text>
            </TouchableOpacity>
          )}

          {/* Cancelar y Reembolsar (CU-07, CU-08) */}
          {puedeReembolsar && (
            <TouchableOpacity
              style={styles.refundBtn}
              onPress={() => onRequestRefund(compra)}
              accessibilityRole="button"
              accessibilityLabel="Cancelar compra y solicitar reembolso"
            >
              <Feather name="rotate-ccw" size={13} color={colors.error} />
              <Text style={styles.refundBtnText}>Reembolso</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  purchaseId: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSubtle,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  countdownBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(85, 210, 51, 0.2)",
  },
  countdownText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  cardBody: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSubtle,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  infoValuePrice: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.primaryDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    alignItems: "center",
  },
  payPendingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  payPendingBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textInverse,
  },
  ticketBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  ticketBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.12)",
    borderWidth: 1,
    borderColor: "#eab308",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#854d0e",
  },
  refundBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  refundBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.error,
  },
});
