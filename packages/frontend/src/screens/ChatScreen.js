import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";
import { chatService } from "../services/chatService";
import { compraService } from "../services/compraService";
import Badge from "../components/ui/Badge";
import { colors, spacing, borderRadius, shadows } from "../theme/theme";

const POLLING_INTERVAL_MS = 4000;

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();

  const { compraId, compra: initialCompra, evento, comprador } = route.params || {};

  const [compra, setCompra] = useState(initialCompra || null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const flatListRef = useRef(null);

  // Cargar estado de la compra si no vino completo
  const cargarCompra = useCallback(async () => {
    if (!compraId) return;
    try {
      const data = await compraService.obtenerCompraPorId(compraId);
      if (data) setCompra(data);
    } catch {
      // Si falla, se mantiene la compra inicial
    }
  }, [compraId]);

  // Cargar historial de mensajes
  const cargarMensajes = useCallback(
    async (isSilent = false) => {
      if (!compraId) return;
      if (!isSilent && !refreshing) setLoading(true);

      try {
        const data = await chatService.obtenerHistorial(compraId);
        const list = Array.isArray(data) ? data : [];
        setMensajes(list);
        setError(null);
      } catch (err) {
        if (!isSilent) {
          setError(err?.message || "No se pudo obtener el historial de mensajes.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [compraId, refreshing]
  );

  // Carga inicial y polling periódico cada 4 segundos
  useEffect(() => {
    cargarMensajes();
    cargarCompra();

    const interval = setInterval(() => {
      cargarMensajes(true);
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [cargarMensajes, cargarCompra]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarMensajes(true);
    cargarCompra();
  };

  const handleEnviarMensaje = async () => {
    const texto = nuevoMensaje.trim();
    if (!texto || enviando) return;

    setEnviando(true);
    setError(null);

    try {
      const nuevoMsg = await chatService.enviarMensaje(compraId, texto);
      setNuevoMensaje("");

      // Incorporar mensaje localmente y autoscroll
      setMensajes((prev) => [...prev, nuevoMsg]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      setError(err?.message || "No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  const isChatCerrado =
    compra?.estado === "CANCELADA" || compra?.estado === "REEMBOLSADA";

  const formatHora = (isoString) => {
    try {
      if (!isoString) return "";
      const d = new Date(isoString);
      return d.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const renderMensajeItem = ({ item }) => {
    const esMio = item.usuarioId === user?.id;
    const nombreRemitente = esMio
      ? "Tú"
      : item.remitente?.nombre
      ? `${item.remitente.nombre} ${item.remitente.apellido || ""}`.trim()
      : "Usuario";

    const rolRemitente = esMio
      ? null
      : item.remitente?.rol === "ORGANIZADOR"
      ? "Organizador"
      : "Comprador";

    return (
      <View
        style={[
          styles.mensajeFila,
          esMio ? styles.mensajeFilaPropio : styles.mensajeFilaAjeno,
        ]}
      >
        <View
          style={[
            styles.burbuja,
            esMio ? styles.burbujaPropia : styles.burbujaAjena,
          ]}
        >
          {/* Remitente info para mensajes ajenos */}
          {!esMio && (
            <View style={styles.remitenteHeader}>
              <Text style={styles.remitenteNombre}>{nombreRemitente}</Text>
              {rolRemitente && (
                <View style={styles.rolChip}>
                  <Text style={styles.rolChipText}>{rolRemitente}</Text>
                </View>
              )}
            </View>
          )}

          {/* Texto del Mensaje */}
          <Text
            style={[
              styles.mensajeTexto,
              esMio ? styles.mensajeTextoPropio : styles.mensajeTextoAjeno,
            ]}
          >
            {item.mensaje}
          </Text>

          {/* Timestamp */}
          <Text
            style={[
              styles.mensajeHora,
              esMio ? styles.mensajeHoraPropia : styles.mensajeHoraAjena,
            ]}
          >
            {formatHora(item.fechaCreacion)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header Superior del Chat */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Volver a la pantalla anterior"
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {evento?.nombre || "Chat del Evento"}
            </Text>
            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>
                Compra #{compraId?.slice(0, 8) || "N/A"}
              </Text>
              {comprador?.nombre && (
                <Text style={styles.headerSubtitle}>
                  {" "}· {comprador.nombre} {comprador.apellido || ""}
                </Text>
              )}
            </View>
          </View>

          {compra?.estado && (
            <Badge
              label={compra.estado}
              variant={
                compra.estado === "CONFIRMADA"
                  ? "success"
                  : compra.estado === "UTILIZADA"
                  ? "primary"
                  : compra.estado === "PENDIENTE"
                  ? "warning"
                  : "danger"
              }
            />
          )}
        </View>

        {/* Banner si el chat está cerrado */}
        {isChatCerrado && (
          <View style={styles.closedChatBanner}>
            <Feather name="alert-triangle" size={16} color={colors.danger} />
            <Text style={styles.closedChatBannerText}>
              El chat se encuentra cerrado debido a que la compra fue{" "}
              {compra?.estado?.toLowerCase()}.
            </Text>
          </View>
        )}

        {/* Error banner si falló el envío */}
        {error && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={14} color={colors.danger} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Lista de Mensajes con Scroll y Polling */}
        {loading && !refreshing && mensajes.length === 0 ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primaryDark} />
            <Text style={styles.loadingText}>Cargando mensajes del chat...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={(item) => item.id || String(Math.random())}
            renderItem={renderMensajeItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primaryDark]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Feather name="message-square" size={32} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>Inicia la Conversación</Text>
                <Text style={styles.emptyDescription}>
                  Consulta cualquier duda sobre el espectáculo, las ubicaciones o el acceso al evento.
                </Text>
              </View>
            }
          />
        )}

        {/* Barra Inferior de Entrada de Mensaje */}
        {!isChatCerrado ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={colors.textMuted}
              value={nuevoMensaje}
              onChangeText={setNuevoMensaje}
              multiline
              maxLength={500}
              accessibilityLabel="Escribir mensaje de chat"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!nuevoMensaje.trim() || enviando) && styles.sendButtonDisabled,
              ]}
              onPress={handleEnviarMensaje}
              disabled={!nuevoMensaje.trim() || enviando}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensaje"
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Feather name="send" size={18} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.chatDisabledBar}>
            <Feather name="lock" size={14} color={colors.textMuted} />
            <Text style={styles.chatDisabledText}>Conversación finalizada</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
    ...shadows.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  closedChatBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#fef2f2",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
  },
  closedChatBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger,
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#fef2f2",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  mensajeFila: {
    marginVertical: 4,
    flexDirection: "row",
  },
  mensajeFilaPropio: {
    justifyContent: "flex-end",
  },
  mensajeFilaAjeno: {
    justifyContent: "flex-start",
  },
  burbuja: {
    maxWidth: "80%",
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  burbujaPropia: {
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: borderRadius.xs,
  },
  burbujaAjena: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: borderRadius.xs,
  },
  remitenteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  remitenteNombre: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  rolChip: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  rolChipText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  mensajeTexto: {
    fontSize: 14,
    lineHeight: 20,
  },
  mensajeTextoPropio: {
    color: "#ffffff",
  },
  mensajeTextoAjeno: {
    color: colors.text,
  },
  mensajeHora: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  mensajeHoraPropia: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  mensajeHoraAjena: {
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  chatDisabledBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chatDisabledText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
});
