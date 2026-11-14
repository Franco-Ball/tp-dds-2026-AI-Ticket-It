import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { categoriaService } from "../services/categoriaService";
import { eventoService } from "../services/eventoService";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import DateTimePickerModal from "../components/ui/DateTimePickerModal";
import { colors, spacing, borderRadius } from "../theme/theme";

const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80";

export default function CreateEventScreen() {
  const navigation = useNavigation();

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [multimediaUrl, setMultimediaUrl] = useState(DEFAULT_COVER_IMAGE);

  // Categorías de la API
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Tipos de entrada dinámicos (CU-04)
  const [tiposEntrada, setTiposEntrada] = useState([
    { id: "1", nombre: "Entrada General", precio: 15000, cupoTotal: 100, descripcion: "Acceso general" },
  ]);

  // Formulario para nuevo tipo de entrada
  const [nuevoNombreTier, setNuevoNombreTier] = useState("");
  const [nuevoPrecioTier, setNuevoPrecioTier] = useState("");
  const [nuevoCupoTier, setNuevoCupoTier] = useState("");
  const [nuevaDescTier, setNuevaDescTier] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showManualDateInput, setShowManualDateInput] = useState(false);

  // Formato legible para la tarjeta de selección
  const formatearFechaHumana = (isoDate) => {
    if (!isoDate) return "Seleccionar fecha en el calendario...";
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      const datePart = d.toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const timePart = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} hs`;
      return `${datePart.charAt(0).toUpperCase() + datePart.slice(1)} · ${timePart}`;
    } catch {
      return isoDate;
    }
  };

  // Cargar categorías disponibles
  useEffect(() => {
    async function loadCategorias() {
      try {
        const data = await categoriaService.listarCategorias();
        if (Array.isArray(data) && data.length > 0) {
          setCategorias(data);
          setCategoriaId(data[0].id);
        }
      } catch {
        // En caso de falla, fallback
      } finally {
        setLoadingCategorias(false);
      }
    }
    loadCategorias();

    // Fecha por defecto: en 30 días a las 21:00 hs
    const fechaDefecto = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    fechaDefecto.setHours(21, 0, 0, 0);
    setFecha(fechaDefecto.toISOString().slice(0, 16));
  }, []);

  // Agregar tipo de entrada personalizado
  const agregarTierPersonalizado = () => {
    if (!nuevoNombreTier.trim()) {
      Alert.alert("Campo requerido", "Ingresa el nombre del tipo de entrada.");
      return;
    }
    const precioNum = Number(nuevoPrecioTier);
    if (isNaN(precioNum) || precioNum < 0) {
      Alert.alert("Precio inválido", "El precio debe ser un número mayor o igual a 0.");
      return;
    }
    const cupoNum = parseInt(nuevoCupoTier, 10);
    if (isNaN(cupoNum) || cupoNum <= 0) {
      Alert.alert("Cupo inválido", "El cupo total debe ser un número entero mayor a 0.");
      return;
    }

    const nuevo = {
      id: Date.now().toString(),
      nombre: nuevoNombreTier.trim(),
      precio: precioNum,
      cupoTotal: cupoNum,
      descripcion: nuevaDescTier.trim(),
    };

    setTiposEntrada((prev) => [...prev, nuevo]);
    setNuevoNombreTier("");
    setNuevoPrecioTier("");
    setNuevoCupoTier("");
    setNuevaDescTier("");
  };

  // Eliminar tipo de entrada
  const eliminarTier = (id) => {
    if (tiposEntrada.length <= 1) {
      Alert.alert("Requisito", "El evento debe poseer al menos un tipo de entrada disponible.");
      return;
    }
    setTiposEntrada((prev) => prev.filter((t) => t.id !== id));
  };

  // Atajos rápidos de fecha
  const setFechaRelativa = (dias) => {
    const d = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
    d.setHours(21, 0, 0, 0);
    setFecha(d.toISOString().slice(0, 16));
  };

  // Calcular capacidad total
  const capacidadTotal = tiposEntrada.reduce((sum, t) => sum + (Number(t.cupoTotal) || 0), 0);

  // Enviar formulario al backend
  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!nombre.trim()) {
      setErrorMsg("El nombre del evento es obligatorio.");
      return;
    }
    if (!descripcion.trim()) {
      setErrorMsg("La descripción del evento es obligatoria.");
      return;
    }
    if (!categoriaId) {
      setErrorMsg("Debes seleccionar una categoría válida.");
      return;
    }
    if (!fecha) {
      setErrorMsg("Debes especificar la fecha de realización.");
      return;
    }
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime()) || fechaObj <= new Date()) {
      setErrorMsg("La fecha del evento debe ser una fecha futura válida.");
      return;
    }
    if (tiposEntrada.length === 0) {
      setErrorMsg("Debes configurar al menos un tipo de entrada.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoriaId,
        fecha: fechaObj.toISOString(),
        multimedia: multimediaUrl ? [multimediaUrl.trim()] : [],
        tiposEntrada: tiposEntrada.map((t) => ({
          nombre: t.nombre,
          precio: Number(t.precio),
          cupoTotal: Number(t.cupoTotal),
          descripcion: t.descripcion || "",
        })),
      };

      await eventoService.crearEvento(payload);

      setNombre("");
      setDescripcion("");

      if (Platform.OS === "web") {
        navigation.navigate("EventsTab");
      } else {
        Alert.alert(
          "¡Evento Publicado con Éxito!",
          `El evento '${nombre}' ya se encuentra disponible en el catálogo con ${capacidadTotal} entradas en venta.`,
          [
            {
              text: "Ver mis eventos",
              onPress: () => {
                navigation.navigate("EventsTab");
              },
            },
          ]
        );
      }
    } catch (err) {
      setErrorMsg(err?.message || "Ocurrió un error al publicar el evento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Publicar Nuevo Evento</Text>
          <Text style={styles.headerSubtitle}>
            Crea tu espectáculo, segmenta los niveles de entrada y gestiona tus cupos.
          </Text>
        </View>

        {errorMsg && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* 1. Información General */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Información General</Text>

          <Text style={styles.label}>Título del Evento *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Lollapalooza 2026 - Día 1"
            placeholderTextColor={colors.textSubtle}
            value={nombre}
            onChangeText={setNombre}
            accessibilityLabel="Nombre del evento"
          />

          <Text style={styles.label}>Categoría *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categorias.map((cat) => {
              const active = categoriaId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catOption, active && styles.catOptionActive]}
                  onPress={() => setCategoriaId(cat.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.catOptionText, active && styles.catOptionTextActive]}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Fecha y Hora del Evento *</Text>

          {/* Selector de Calendario y Horario Interactivo */}
          <TouchableOpacity
            style={styles.datePickerTrigger}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Abrir calendario para seleccionar fecha y hora"
          >
            <View style={styles.datePickerIconBox}>
              <Feather name="calendar" size={20} color={colors.primaryDark} />
            </View>
            <View style={styles.datePickerTextWrapper}>
              <Text style={styles.datePickerTitle}>
                {formatearFechaHumana(fecha)}
              </Text>
              <Text style={styles.datePickerSubtitle}>
                Toca para abrir el calendario y seleccionar horario
              </Text>
            </View>
            <View style={styles.datePickerActionBtn}>
              <Feather name="calendar" size={14} color={colors.primaryDark} />
              <Text style={styles.datePickerActionText}>Elegir</Text>
            </View>
          </TouchableOpacity>

          {/* Atajos de fecha y opción de edición manual */}
          <View style={styles.quickDateContainer}>
            <View style={styles.quickDateRow}>
              <Text style={styles.quickDateLabel}>Atajos:</Text>
              <TouchableOpacity style={styles.quickDateBtn} onPress={() => setFechaRelativa(7)}>
                <Text style={styles.quickDateBtnText}>+7 días</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDateBtn} onPress={() => setFechaRelativa(30)}>
                <Text style={styles.quickDateBtnText}>+1 mes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDateBtn} onPress={() => setFechaRelativa(60)}>
                <Text style={styles.quickDateBtnText}>+2 meses</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.manualToggleBtn}
              onPress={() => setShowManualDateInput((prev) => !prev)}
            >
              <Feather name="edit-2" size={11} color={colors.textMuted} />
              <Text style={styles.manualToggleText}>
                {showManualDateInput ? "Ocultar texto" : "Escribir texto"}
              </Text>
            </TouchableOpacity>
          </View>

          {showManualDateInput && (
            <View style={styles.manualDateBox}>
              <TextInput
                style={styles.inputSmall}
                placeholder="AAAA-MM-DDTHH:mm"
                placeholderTextColor={colors.textSubtle}
                value={fecha}
                onChangeText={setFecha}
                accessibilityLabel="Fecha y hora de realización manual"
              />
            </View>
          )}

          <Text style={styles.label}>Descripción del Espectáculo *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalla artistas invitados, accesos, restricciones de edad y horarios..."
            placeholderTextColor={colors.textSubtle}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            accessibilityLabel="Descripción del evento"
          />
        </Card>

        {/* 2. Portada e Imagen Multimedia */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Imagen de Portada</Text>
          <Text style={styles.sublabel}>Ingresa la URL directa de la imagen del espectáculo (opcional):</Text>

          <Text style={styles.label}>URL directa de la imagen</Text>
          <TextInput
            style={styles.input}
            placeholder="https://ejemplo.com/imagen.jpg"
            placeholderTextColor={colors.textSubtle}
            value={multimediaUrl}
            onChangeText={setMultimediaUrl}
            autoCapitalize="none"
            accessibilityLabel="URL de imagen del evento"
          />
        </Card>

        {/* 3. Tipos de Entrada Segmentados (CU-04) */}
        <Card style={styles.sectionCard}>
          <View style={styles.tiersCardHeader}>
            <View>
              <Text style={styles.sectionTitle}>3. Tipos de Entrada y Cupos</Text>
              <Text style={styles.sublabel}>
                Define precios y cupos por sector para distintos presupuestos.
              </Text>
            </View>
            <Badge label={`Total: ${capacidadTotal} cupos`} variant="primary" />
          </View>

          {/* Lista de entradas añadidas */}
          <View style={styles.tiersAddedList}>
            {tiposEntrada.map((tier, index) => (
              <View key={tier.id || index} style={styles.tierAddedItem}>
                <View style={styles.tierItemContent}>
                  <View style={styles.tierTop}>
                    <Text style={styles.tierItemName}>{tier.nombre}</Text>
                    <Text style={styles.tierItemPrice}>
                      ${Number(tier.precio).toLocaleString("es-AR")}
                    </Text>
                  </View>
                  <View style={styles.tierBottom}>
                    <Text style={styles.tierItemQuota}>
                      Cupo: {tier.cupoTotal} entradas
                    </Text>
                    {tier.descripcion ? (
                      <Text style={styles.tierItemDesc} numberOfLines={1}>
                        · {tier.descripcion}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => eliminarTier(tier.id)}
                  style={styles.trashBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar tipo de entrada ${tier.nombre}`}
                >
                  <Feather name="trash-2" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Formulario para añadir nivel personalizado */}
          <View style={styles.customTierBox}>
            <Text style={styles.customTierBoxTitle}>+ Crear Nivel Personalizado</Text>

            <View style={styles.customTierRow}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.tinyLabel}>Nombre del Sector</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Ej: Campo Delantero"
                  placeholderTextColor={colors.textSubtle}
                  value={nuevoNombreTier}
                  onChangeText={setNuevoNombreTier}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tinyLabel}>Precio ($)</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="20000"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="numeric"
                  value={nuevoPrecioTier}
                  onChangeText={setNuevoPrecioTier}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tinyLabel}>Cupo</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="80"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="numeric"
                  value={nuevoCupoTier}
                  onChangeText={setNuevoCupoTier}
                />
              </View>
            </View>

            <Text style={styles.tinyLabel}>Descripción opcional</Text>
            <TextInput
              style={styles.inputSmall}
              placeholder="Ej: Ingreso por puerta 3, incluye vaso conmemorativo"
              placeholderTextColor={colors.textSubtle}
              value={nuevaDescTier}
              onChangeText={setNuevaDescTier}
            />

            <TouchableOpacity style={styles.addTierBtn} onPress={agregarTierPersonalizado}>
              <Feather name="plus-circle" size={16} color={colors.primaryDark} />
              <Text style={styles.addTierBtnText}>Añadir Nivel de Entrada</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Botón de Publicación */}
        <View style={styles.submitWrapper}>
          <Button
            title="Publicar Evento Oficial"
            onPress={handleSubmit}
            loading={submitting}
            icon={<Feather name="upload-cloud" size={18} color="#ffffff" />}
            variant="primary"
          />
        </View>
      </ScrollView>

      {/* Modal de Calendario y Horario */}
      <DateTimePickerModal
        visible={showDatePicker}
        initialDate={fecha}
        onConfirm={(nuevaFecha) => setFecha(nuevaFecha)}
        onClose={() => setShowDatePicker(false)}
      />
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: "600",
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  tinyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSubtle,
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.text,
  },
  inputSmall: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  catScroll: {
    marginVertical: 4,
  },
  catOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
  },
  catOptionActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  catOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  catOptionTextActive: {
    color: colors.textInverse,
    fontWeight: "700",
  },
  quickDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 4,
  },
  quickDateLabel: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: "600",
  },
  quickDateBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
  },
  quickDateBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  tiersCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  tiersAddedList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tierAddedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierItemContent: {
    flex: 1,
  },
  tierTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tierItemName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  tierItemPrice: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  tierBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  tierItemQuota: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  tierItemDesc: {
    fontSize: 11,
    color: colors.textSubtle,
    marginLeft: 4,
    flex: 1,
  },
  trashBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  customTierBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
  },
  customTierBoxTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  customTierRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  addTierBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
    marginTop: 4,
  },
  addTierBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  submitWrapper: {
    marginTop: spacing.sm,
  },
  datePickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: 2,
    marginBottom: 4,
  },
  datePickerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  datePickerTextWrapper: {
    flex: 1,
  },
  datePickerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  datePickerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  datePickerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  datePickerActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  quickDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  manualToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  manualToggleText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  manualDateBox: {
    marginTop: spacing.xs,
  },
});
