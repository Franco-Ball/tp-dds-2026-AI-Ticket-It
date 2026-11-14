import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, borderRadius, shadows } from "../../theme/theme";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const POPULAR_TIMES = ["19:00", "20:00", "20:30", "21:00", "21:30", "22:00"];

export default function DateTimePickerModal({
  visible,
  initialDate,
  onConfirm,
  onClose,
}) {
  // Parsear fecha inicial
  const parseInitial = () => {
    let d = new Date(initialDate);
    if (isNaN(d.getTime())) {
      d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      d.setHours(21, 0, 0, 0);
    }
    return d;
  };

  const [selectedDate, setSelectedDate] = useState(parseInitial);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [selectedHour, setSelectedHour] = useState(selectedDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState(selectedDate.getMinutes());

  // Sincronizar cuando cambia la fecha inicial o se abre el modal
  useEffect(() => {
    if (visible) {
      const d = parseInitial();
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setSelectedHour(d.getHours());
      setSelectedMinute(d.getMinutes());
    }
  }, [visible, initialDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Navegar al mes anterior
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  // Navegar al mes siguiente
  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // No permitir retroceder a meses que ya pasaron
  const isPrevMonthDisabled = () => {
    const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const viewMonthDate = new Date(viewYear, viewMonth, 1);
    return viewMonthDate <= currentMonthDate;
  };

  // Manejar selección de día
  const handleSelectDay = (day) => {
    const newDate = new Date(viewYear, viewMonth, day, selectedHour, selectedMinute);
    setSelectedDate(newDate);
  };

  // Manejar hora rápida
  const handleSelectPopularTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    setSelectedHour(h);
    setSelectedMinute(m);
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      h,
      m
    );
    setSelectedDate(newDate);
  };

  // Ajustar hora con stepper
  const adjustHour = (delta) => {
    let newH = (selectedHour + delta + 24) % 24;
    setSelectedHour(newH);
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      newH,
      selectedMinute
    );
    setSelectedDate(newDate);
  };

  // Ajustar minutos con stepper (+/- 15 min)
  const adjustMinute = (delta) => {
    let newM = (selectedMinute + delta + 60) % 60;
    setSelectedMinute(newM);
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      newM
    );
    setSelectedDate(newDate);
  };

  // Atajos rápidos (+ días)
  const applyQuickOffset = (days) => {
    const target = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    target.setHours(selectedHour, selectedMinute, 0, 0);
    setSelectedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  // Confirmar y emitir valor final en formato ISO / YYYY-MM-DDTHH:mm
  const handleConfirm = () => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const hh = String(selectedHour).padStart(2, "0");
    const mm = String(selectedMinute).padStart(2, "0");
    const formatted = `${y}-${m}-${d}T${hh}:${mm}`;
    onConfirm(formatted);
    onClose();
  };

  // Formato legible para resumen inferior
  const humanDatePreview = selectedDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Generar celdas del calendario
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Domingo
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarDays = [];
  // Celdas vacías al inicio del mes
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ key: `empty-${i}`, empty: true });
  }
  // Días del mes
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const cellDate = new Date(viewYear, viewMonth, d);
    cellDate.setHours(0, 0, 0, 0);
    const isPast = cellDate < today;
    const isSelected =
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === d;
    const isToday =
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === d;

    calendarDays.push({
      key: `day-${d}`,
      day: d,
      empty: false,
      isPast,
      isSelected,
      isToday,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header del Modal */}
          <View style={styles.header}>
            <View style={styles.headerIconBox}>
              <Feather name="calendar" size={20} color={colors.primaryDark} />
            </View>
            <View style={styles.headerTextWrapper}>
              <Text style={styles.title}>Seleccionar Fecha y Hora</Text>
              <Text style={styles.subtitle}>
                Define el día y horario en que iniciará el espectáculo
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar selector de fecha"
            >
              <Feather name="x" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Navegación de Mes */}
            <View style={styles.monthNavRow}>
              <TouchableOpacity
                style={[styles.monthNavBtn, isPrevMonthDisabled() && styles.monthNavBtnDisabled]}
                onPress={handlePrevMonth}
                disabled={isPrevMonthDisabled()}
                accessibilityRole="button"
                accessibilityLabel="Mes anterior"
              >
                <Feather
                  name="chevron-left"
                  size={20}
                  color={isPrevMonthDisabled() ? colors.textSubtle : colors.text}
                />
              </TouchableOpacity>

              <Text style={styles.monthTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>

              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={handleNextMonth}
                accessibilityRole="button"
                accessibilityLabel="Mes siguiente"
              >
                <Feather name="chevron-right" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Cabecera de Días de la Semana */}
            <View style={styles.weekdaysRow}>
              {WEEKDAY_NAMES.map((name, idx) => (
                <View key={idx} style={styles.weekdayCell}>
                  <Text style={styles.weekdayText}>{name}</Text>
                </View>
              ))}
            </View>

            {/* Grilla de Días del Mes */}
            <View style={styles.daysGrid}>
              {calendarDays.map((cell) => {
                if (cell.empty) {
                  return <View key={cell.key} style={styles.dayCellPlaceholder} />;
                }

                return (
                  <TouchableOpacity
                    key={cell.key}
                    style={[
                      styles.dayCell,
                      cell.isSelected && styles.dayCellSelected,
                      cell.isToday && !cell.isSelected && styles.dayCellToday,
                      cell.isPast && styles.dayCellDisabled,
                    ]}
                    onPress={() => !cell.isPast && handleSelectDay(cell.day)}
                    disabled={cell.isPast}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Día ${cell.day} de ${MONTH_NAMES[viewMonth]}`}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        cell.isSelected && styles.dayTextSelected,
                        cell.isToday && !cell.isSelected && styles.dayTextToday,
                        cell.isPast && styles.dayTextDisabled,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Atajos Rápidos */}
            <View style={styles.shortcutsSection}>
              <Text style={styles.sectionSmallLabel}>Atajos de fecha:</Text>
              <View style={styles.shortcutsRow}>
                <TouchableOpacity
                  style={styles.shortcutChip}
                  onPress={() => applyQuickOffset(7)}
                >
                  <Text style={styles.shortcutChipText}>+7 días</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shortcutChip}
                  onPress={() => applyQuickOffset(15)}
                >
                  <Text style={styles.shortcutChipText}>+15 días</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shortcutChip}
                  onPress={() => applyQuickOffset(30)}
                >
                  <Text style={styles.shortcutChipText}>+1 mes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shortcutChip}
                  onPress={() => applyQuickOffset(60)}
                >
                  <Text style={styles.shortcutChipText}>+2 meses</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Selector de Horario */}
            <View style={styles.timeSection}>
              <View style={styles.timeHeader}>
                <Feather name="clock" size={16} color={colors.primaryDark} />
                <Text style={styles.timeSectionTitle}>Horario de Inicio</Text>
              </View>

              {/* Steppers de Hora y Minuto */}
              <View style={styles.stepperContainer}>
                {/* Horas */}
                <View style={styles.stepperBox}>
                  <Text style={styles.stepperLabel}>Hora</Text>
                  <View style={styles.stepperControl}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => adjustHour(-1)}
                      accessibilityRole="button"
                      accessibilityLabel="Restar una hora"
                    >
                      <Feather name="minus" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>
                      {String(selectedHour).padStart(2, "0")}
                    </Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => adjustHour(1)}
                      accessibilityRole="button"
                      accessibilityLabel="Sumar una hora"
                    >
                      <Feather name="plus" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.stepperSeparator}>:</Text>

                {/* Minutos */}
                <View style={styles.stepperBox}>
                  <Text style={styles.stepperLabel}>Minutos</Text>
                  <View style={styles.stepperControl}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => adjustMinute(-15)}
                      accessibilityRole="button"
                      accessibilityLabel="Restar 15 minutos"
                    >
                      <Feather name="minus" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>
                      {String(selectedMinute).padStart(2, "0")}
                    </Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => adjustMinute(15)}
                      accessibilityRole="button"
                      accessibilityLabel="Sumar 15 minutos"
                    >
                      <Feather name="plus" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Horarios Habituales */}
              <Text style={styles.popularTimesLabel}>Horarios recomendados para eventos:</Text>
              <View style={styles.popularTimesRow}>
                {POPULAR_TIMES.map((timeStr) => {
                  const isCurrentTime =
                    selectedHour === Number(timeStr.split(":")[0]) &&
                    selectedMinute === Number(timeStr.split(":")[1]);
                  return (
                    <TouchableOpacity
                      key={timeStr}
                      style={[
                        styles.timeChip,
                        isCurrentTime && styles.timeChipActive,
                      ]}
                      onPress={() => handleSelectPopularTime(timeStr)}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          isCurrentTime && styles.timeChipTextActive,
                        ]}
                      >
                        {timeStr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer de Confirmación */}
          <View style={styles.footer}>
            <View style={styles.previewBox}>
              <Feather name="check-circle" size={16} color={colors.primaryDark} />
              <Text style={styles.previewText} numberOfLines={1}>
                {humanDatePreview} a las {String(selectedHour).padStart(2, "0")}:{String(selectedMinute).padStart(2, "0")} hs
              </Text>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Feather name="check" size={16} color={colors.textInverse} />
                <Text style={styles.confirmBtnText}>Confirmar Fecha y Hora</Text>
              </TouchableOpacity>
            </View>
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
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    ...shadows.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  headerTextWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Navegación de mes
  monthNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: spacing.sm,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  monthNavBtnDisabled: {
    opacity: 0.35,
  },

  // Días de la semana
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  // Grilla de días
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  dayCellPlaceholder: {
    width: "14.285%",
    aspectRatio: 1,
  },
  dayCell: {
    width: "14.285%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.primaryDark,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  dayTextSelected: {
    color: "#ffffff",
    fontWeight: "800",
  },
  dayTextToday: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
  dayTextDisabled: {
    color: colors.textSubtle,
  },

  // Atajos rápidos
  shortcutsSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionSmallLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  shortcutsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  shortcutChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryDark,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // Selector de horario
  timeSection: {
    marginBottom: spacing.md,
  },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
  },
  timeSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  stepperBox: {
    alignItems: "center",
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 4,
  },
  stepperControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    minWidth: 38,
    textAlign: "center",
  },
  stepperSeparator: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textMuted,
    marginTop: 16,
  },
  popularTimesLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  popularTimesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryDark,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  timeChipTextActive: {
    color: colors.primaryDark,
    fontWeight: "800",
  },

  // Footer
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
  },
  previewText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryDark,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textInverse,
  },
});

