import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Badge from "../ui/Badge";
import { colors, spacing, borderRadius, shadows } from "../../theme/theme";

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80";

export default function EventCard({
  evento,
  onPress,
  categoriaNombre,
}) {
  const imageUrl =
    Array.isArray(evento?.multimedia) && evento.multimedia.length > 0 && evento.multimedia[0]
      ? evento.multimedia[0]
      : DEFAULT_EVENT_IMAGE;

  // Formato de fecha legible
  const formatDate = (isoString) => {
    try {
      if (!isoString) return "Fecha a confirmar";
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "Fecha a confirmar";
      const fechaTexto = d.toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      const horaTexto = d.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${fechaTexto.toUpperCase()} · ${horaTexto} HS`;
    } catch {
      return "Fecha a confirmar";
    }
  };

  const precioMinimo = evento?.precioMinimo ?? 0;
  const precioTexto =
    precioMinimo === 0
      ? "Gratis"
      : `Desde $${Number(precioMinimo).toLocaleString("es-AR")}`;

  const cupoDisponible = evento?.cupoTotalDisponible ?? 0;
  const estaAgotado = cupoDisponible <= 0;

  const reputacion = evento?.puntajePromedio || evento?.organizador?.reputacion || 0;
  const tieneReputacion = reputacion > 0;

  const catLabel = evento?.categoria?.nombre || categoriaNombre || "Evento";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Evento: ${evento?.nombre}. Precio: ${precioTexto}. Fecha: ${formatDate(evento?.fecha)}`}
    >
      {/* Portada del Evento */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Badge de Categoría flotante */}
        <View style={styles.categoryBadgeWrapper}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText} numberOfLines={1}>
              {catLabel}
            </Text>
          </View>
        </View>

        {/* Badge de Cupo / Agotado */}
        <View style={styles.quotaBadgeWrapper}>
          <Badge
            label={estaAgotado ? "Agotado" : `${cupoDisponible} cupos`}
            variant={estaAgotado ? "error" : "success"}
          />
        </View>
      </View>

      {/* Contenido / Información */}
      <View style={styles.body}>
        {/* Fecha y Reputación */}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{formatDate(evento?.fecha)}</Text>
          <View style={styles.ratingBadge}>
            <Feather name="star" size={13} color="#eab308" />
            <Text style={styles.ratingText}>
              {tieneReputacion ? reputacion.toFixed(1) : "Nuevo"}
            </Text>
          </View>
        </View>

        {/* Título del Evento */}
        <Text style={styles.title} numberOfLines={2}>
          {evento?.nombre}
        </Text>

        {/* Descripción corta */}
        {evento?.descripcion ? (
          <Text style={styles.description} numberOfLines={2}>
            {evento.descripcion}
          </Text>
        ) : null}

        {/* Separador */}
        <View style={styles.divider} />

        {/* Footer: Precio y Call to action */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Entradas</Text>
            <Text style={styles.priceValue}>{precioTexto}</Text>
          </View>

          <View style={styles.actionArrow}>
            <Text style={styles.actionArrowText}>Ver entradas</Text>
            <Feather name="chevron-right" size={16} color={colors.primaryDark} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
  imageWrapper: {
    width: "100%",
    height: 170,
    backgroundColor: colors.surfaceAlt,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryBadgeWrapper: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quotaBadgeWrapper: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  body: {
    padding: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
    letterSpacing: 0.4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#854d0e",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSubtle,
    textTransform: "uppercase",
  },
  priceValue: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.text,
  },
  actionArrow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    gap: 2,
  },
  actionArrowText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
  },
});
