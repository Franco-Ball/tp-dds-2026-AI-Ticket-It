import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { colors, borderRadius, spacing, shadows } from "../../theme/theme";

export default function TicketQRModal({ visible, compra, onClose }) {
  if (!compra) return null;

  const evento = compra.evento || {};
  const tipoEntrada = compra.tipoEntrada || {};

  const formatDate = (isoString) => {
    try {
      if (!isoString) return "Fecha a confirmar";
      const d = new Date(isoString);
      return d.toLocaleDateString("es-AR", {
        weekday: "short",
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

  const ticketCode = (compra.id || "TICKET-000").toUpperCase();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header del Ticket */}
            <View style={styles.ticketTop}>
              <View style={styles.brandRow}>
                <View style={styles.brandLogo}>
                  <Feather name="tag" size={16} color={colors.textInverse} />
                </View>
                <Text style={styles.brandTitle}>AI TICKET IT</Text>
              </View>
              <Badge
                label={compra.estado || "CONFIRMADA"}
                variant={compra.estado === "UTILIZADA" ? "organizador" : "success"}
              />
            </View>

            {/* Información del Evento */}
            <View style={styles.eventInfoSection}>
              <Text style={styles.eventName}>{evento.nombre || "Evento"}</Text>
              <View style={styles.metaRow}>
                <Feather name="calendar" size={14} color={colors.primaryDark} />
                <Text style={styles.metaText}>{formatDate(evento.fecha)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Feather name="map-pin" size={14} color={colors.primaryDark} />
                <Text style={styles.metaText}>Estadio / Sala Principal (Buenos Aires)</Text>
              </View>
            </View>

            {/* Perforación visual estilo ticket */}
            <View style={styles.perforationWrapper}>
              <View style={styles.perforationHoleLeft} />
              <View style={styles.perforationDottedLine} />
              <View style={styles.perforationHoleRight} />
            </View>

            {/* Código QR Simulado */}
            <View style={styles.qrSection}>
              <View style={styles.qrBox}>
                <Feather name="maximize" size={120} color={colors.text} style={styles.qrIcon} />
                <View style={styles.qrCenterBadge}>
                  <Feather name="check" size={24} color={colors.primaryDark} />
                </View>
              </View>
              <Text style={styles.ticketCodeText}>{ticketCode}</Text>
              <Text style={styles.qrInstruction}>
                Presenta este código en la entrada del evento para validar tu acceso.
              </Text>
            </View>

            {/* Desglose de Entrada */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>SECTOR</Text>
                <Text style={styles.detailValue}>{tipoEntrada.nombre || "General"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>CANTIDAD</Text>
                <Text style={styles.detailValue}>{compra.cantidad || 1} entrada(s)</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>TOTAL PAGADO</Text>
                <Text style={styles.detailValue}>
                  ${Number(compra.total || 0).toLocaleString("es-AR")}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>COMPRA ID</Text>
                <Text style={styles.detailValue}>#{compra.id ? compra.id.slice(0, 8) : "N/A"}</Text>
              </View>
            </View>

            <View style={styles.closeBtnWrapper}>
              <Button title="Cerrar Entrada" variant="secondary" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    width: "100%",
    maxWidth: 380,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  ticketTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 0.5,
  },
  eventInfoSection: {
    marginBottom: spacing.md,
  },
  eventName: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  metaText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  perforationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: -spacing.lg,
    marginVertical: spacing.md,
  },
  perforationHoleLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    marginLeft: -12,
  },
  perforationDottedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    marginHorizontal: 8,
  },
  perforationHoleRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    marginRight: -12,
  },
  qrSection: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  qrBox: {
    width: 160,
    height: 160,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: spacing.sm,
  },
  qrIcon: {
    opacity: 0.85,
  },
  qrCenterBadge: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  ticketCodeText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.text,
    marginBottom: 4,
  },
  qrInstruction: {
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailItem: {
    width: "45%",
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSubtle,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  closeBtnWrapper: {
    marginTop: spacing.xs,
  },
});
