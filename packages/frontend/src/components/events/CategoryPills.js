import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, borderRadius, shadows } from "../../theme/theme";

const CATEGORY_ICONS = {
  TODAS: "grid",
  recitales: "music",
  teatro: "film",
  festivales: "sun",
  conferencias: "mic",
  deportes: "activity",
};

export default function CategoryPills({
  categorias = [],
  selectedCategoriaId = "TODAS",
  onSelectCategoria,
}) {
  const allCategories = [
    { id: "TODAS", nombre: "Todas" },
    ...categorias,
  ];

  const getIconName = (nombre, id) => {
    if (id === "TODAS") return "grid";
    const lower = (nombre || "").toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (lower.includes(key)) return icon;
    }
    return "tag";
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {allCategories.map((cat) => {
          const isSelected = selectedCategoriaId === cat.id;
          const iconName = getIconName(cat.nombre, cat.id);

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                isSelected ? styles.pillActive : styles.pillInactive,
              ]}
              onPress={() => onSelectCategoria(cat.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filtrar por categoría ${cat.nombre}`}
            >
              <Feather
                name={iconName}
                size={15}
                color={isSelected ? colors.textInverse : colors.textMuted}
                style={styles.pillIcon}
              />
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextActive : styles.pillTextInactive,
                ]}
                numberOfLines={1}
              >
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.xs,
  },
  scrollContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44, // Pauta WCAG tamaño táctil
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    ...shadows.sm,
  },
  pillInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 13,
  },
  pillTextActive: {
    color: colors.textInverse,
    fontWeight: "700",
  },
  pillTextInactive: {
    color: colors.text,
    fontWeight: "600",
  },
});
