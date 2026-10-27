import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Button from "../ui/Button";
import { colors, spacing, borderRadius, shadows } from "../../theme/theme";

export const SORT_OPTIONS = [
  {
    id: "fecha_asc",
    sortBy: "fecha",
    order: "asc",
    label: "Fecha del evento (Más próximos)",
    icon: "calendar",
  },
  {
    id: "precio_asc",
    sortBy: "precio",
    order: "asc",
    label: "Precio: Menor a Mayor",
    icon: "arrow-up-right",
  },
  {
    id: "precio_desc",
    sortBy: "precio",
    order: "desc",
    label: "Precio: Mayor a Menor",
    icon: "arrow-down-right",
  },
  {
    id: "puntaje_desc",
    sortBy: "puntaje",
    order: "desc",
    label: "Mejor puntuación de organizador",
    icon: "star",
  },
];

export default function SortModal({
  visible,
  currentSort = { sortBy: "fecha", order: "asc" },
  onClose,
  onApplySort,
}) {
  const findActiveId = (sort) => {
    const found = SORT_OPTIONS.find(
      (opt) => opt.sortBy === sort.sortBy && opt.order === sort.order
    );
    return found ? found.id : "fecha_asc";
  };

  const [selectedId, setSelectedId] = useState(findActiveId(currentSort));

  const handleApply = () => {
    const option = SORT_OPTIONS.find((opt) => opt.id === selectedId);
    if (option) {
      onApplySort({ sortBy: option.sortBy, order: option.order });
    }
    onClose();
  };

  const handleReset = () => {
    setSelectedId("fecha_asc");
    onApplySort({ sortBy: "fecha", order: "asc" });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>Ordenar Eventos</Text>
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar ventana de ordenamiento"
                style={styles.closeBtn}
              >
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Elige el criterio de orden para explorar el catálogo de espectáculos.
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {SORT_OPTIONS.map((option) => {
              const isSelected = selectedId === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => setSelectedId(option.id)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={option.label}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        isSelected && styles.iconCircleSelected,
                      ]}
                    >
                      <Feather
                        name={option.icon}
                        size={16}
                        color={isSelected ? colors.primaryDark : colors.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.footer}>
            <View style={styles.btnCol}>
              <Button
                title="Restablecer"
                onPress={handleReset}
                variant="outline"
              />
            </View>
            <View style={styles.btnCol}>
              <Button
                title="Aplicar Orden"
                onPress={handleApply}
                variant="primary"
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    ...shadows.md,
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  optionsList: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52, // WCAG Pauta 6 tamaño táctil
    backgroundColor: colors.surface,
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  iconCircleSelected: {
    backgroundColor: "rgba(85, 210, 51, 0.2)",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  optionLabelSelected: {
    fontWeight: "700",
    color: colors.text,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.textSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  radioCircleSelected: {
    borderColor: colors.primaryDark,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  btnCol: {
    flex: 1,
  },
});
