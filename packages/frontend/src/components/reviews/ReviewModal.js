import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { reseniaService } from "../../services/reseniaService";
import Button from "../ui/Button";
import { colors, borderRadius, spacing, shadows } from "../../theme/theme";

export default function ReviewModal({ visible, compra, onClose, onSuccess }) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [detalle, setDetalle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!compra) return null;

  const evento = compra.evento || {};

  const handleSubmit = async () => {
    if (!detalle.trim()) {
      setErrorMsg("Por favor, escribe un comentario sobre tu experiencia.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await reseniaService.crearResenia(evento.id, {
        puntuacion,
        detalle: detalle.trim(),
      });

      Alert.alert(
        "¡Reseña Publicada!",
        "Tu calificación y comentario fueron registrados con éxito. Ahora son visibles en el catálogo y perfil del organizador.",
        [
          {
            text: "Aceptar",
            onPress: () => {
              setDetalle("");
              setPuntuacion(5);
              onClose();
              if (onSuccess) onSuccess();
            },
          },
        ]
      );
    } catch (err) {
      setErrorMsg(err?.message || "No se pudo publicar la reseña");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Feather name="star" size={24} color="#eab308" />
            </View>
            <Text style={styles.title}>Calificar Evento (CU-09)</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {evento.nombre || "Espectáculo"}
            </Text>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color={colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Selector de Estrellas (1 a 5) */}
          <Text style={styles.sectionLabel}>Tu puntuación:</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= puntuacion;
              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => setPuntuacion(star)}
                  style={styles.starBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Calificar con ${star} estrella${star > 1 ? "s" : ""}`}
                >
                  <Feather
                    name="star"
                    size={32}
                    color={isFilled ? "#eab308" : colors.border}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.scoreText}>
            {puntuacion === 5 && "¡Excelente experiencia! (5/5)"}
            {puntuacion === 4 && "Muy buen evento (4/5)"}
            {puntuacion === 3 && "Bueno / Aceptable (3/5)"}
            {puntuacion === 2 && "Regular (2/5)"}
            {puntuacion === 1 && "Mala experiencia (1/5)"}
          </Text>

          {/* Comentario escrito */}
          <Text style={styles.sectionLabel}>Tu opinión detallada:</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Comparte con la comunidad qué te pareció el sonido, la puntualidad, la sala o los artistas..."
            placeholderTextColor={colors.textSubtle}
            multiline
            numberOfLines={4}
            value={detalle}
            onChangeText={setDetalle}
            maxLength={300}
            accessibilityLabel="Comentario escrito sobre el evento"
          />
          <Text style={styles.charCount}>{detalle.length} / 300 caracteres</Text>

          {/* Acciones */}
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1 }}
              disabled={submitting}
            />
            <Button
              title="Publicar Opinión"
              variant="primary"
              onPress={handleSubmit}
              loading={submitting}
              style={{ flex: 1.3 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorBg,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "600",
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  starBtn: {
    padding: 4,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#854d0e",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  textArea: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 13,
    color: colors.text,
    height: 90,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: "right",
    marginTop: 4,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
