import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ConfirmModal from "../components/ui/ConfirmModal";
import { eventoService } from "../services/eventoService";
import { compraService } from "../services/compraService";
import { reseniaService } from "../services/reseniaService";
import { colors, borderRadius, spacing, shadows } from "../theme/theme";

export default function ProfileScreen() {
  const { user, isOrganizador, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Métricas reales del dominio según el rol
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metrics, setMetrics] = useState({
    eventosCount: 0,
    reputacion: null,
    totalResenias: 0,
    comprasCount: 0,
    comprasConfirmadas: 0,
    comprasUtilizadas: 0,
    proximoEvento: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function cargarMetricasDominio() {
      if (!user?.id) return;
      try {
        if (isOrganizador) {
          const [eventos, reseniasInfo] = await Promise.all([
            eventoService.listarEventosPorOrganizador(user.id).catch(() => []),
            reseniaService.listarPorOrganizador(user.id).catch(() => null),
          ]);

          if (isMounted) {
            setMetrics((prev) => ({
              ...prev,
              eventosCount: Array.isArray(eventos) ? eventos.length : 0,
              reputacion: reseniasInfo?.reputacion ?? 5,
              totalResenias: reseniasInfo?.totalResenias ?? 0,
            }));
          }
        } else {
          const compras = await compraService.obtenerMisCompras().catch(() => []);
          if (isMounted && Array.isArray(compras)) {
            const confirmadas = compras.filter((c) => c.estado === "CONFIRMADA");
            const utilizadas = compras.filter((c) => c.estado === "UTILIZADA");
            const proximo = confirmadas.find((c) => c.diasFaltantes != null);

            setMetrics((prev) => ({
              ...prev,
              comprasCount: compras.length,
              comprasConfirmadas: confirmadas.length,
              comprasUtilizadas: utilizadas.length,
              proximoEvento: proximo || null,
            }));
          }
        }
      } catch {
        // En caso de error de red, mantener estados por defecto
      } finally {
        if (isMounted) {
          setLoadingMetrics(false);
        }
      }
    }

    cargarMetricasDominio();
    return () => {
      isMounted = false;
    };
  }, [user?.id, isOrganizador]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const initials = `${user?.nombre?.[0] || ""}${user?.apellido?.[0] || ""}`.toUpperCase();

  const formatearFecha = (isoString) => {
    if (!isoString) return "No disponible";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "No disponible";
      return d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "No disponible";
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Hero con Avatar Elevado */}
      <View style={styles.heroCard}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatar, isOrganizador ? styles.avatarOrg : styles.avatarComp]}>
            <Text style={styles.avatarText}>{initials || "U"}</Text>
          </View>
        </View>

        <Text style={styles.name}>
          {user?.nombre} {user?.apellido}
        </Text>

        <View style={styles.badgeWrapper}>
          <Badge
            label={isOrganizador ? "ORGANIZADOR DE EVENTOS" : "COMPRADOR DE ENTRADAS"}
            variant={user?.rol}
          />
        </View>
      </View>

      {/* 2. Resumen Métrico del Dominio (KPIs Reales) */}
      <View style={styles.statsContainer}>
        {loadingMetrics ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator size="small" color={colors.primaryDark} />
            <Text style={styles.loadingStatsText}>Cargando actividad...</Text>
          </View>
        ) : isOrganizador ? (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: colors.primaryLight }]}>
                <Feather name="calendar" size={18} color={colors.primaryDark} />
              </View>
              <Text style={styles.statNumber}>{metrics.eventosCount}</Text>
              <Text style={styles.statLabel}>Espectáculos</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: colors.organizadorBg }]}>
                <Feather name="star" size={18} color={colors.organizador} />
              </View>
              <Text style={styles.statNumber}>
                {metrics.reputacion != null ? `${Number(metrics.reputacion).toFixed(1)} ★` : "—"}
              </Text>
              <Text style={styles.statLabel}>Reputación</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: colors.compradorBg }]}>
                <Feather name="message-circle" size={18} color={colors.comprador} />
              </View>
              <Text style={styles.statNumber}>{metrics.totalResenias}</Text>
              <Text style={styles.statLabel}>Opiniones</Text>
            </View>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: colors.primaryLight }]}>
                <Feather name="shopping-bag" size={18} color={colors.primaryDark} />
              </View>
              <Text style={styles.statNumber}>{metrics.comprasCount}</Text>
              <Text style={styles.statLabel}>Compras</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: colors.compradorBg }]}>
                <Feather name="check-circle" size={18} color={colors.comprador} />
              </View>
              <Text style={styles.statNumber}>{metrics.comprasConfirmadas}</Text>
              <Text style={styles.statLabel}>Confirmadas</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: colors.organizadorBg }]}>
                <Feather name="award" size={18} color={colors.organizador} />
              </View>
              <Text style={styles.statNumber}>{metrics.comprasUtilizadas}</Text>
              <Text style={styles.statLabel}>Asistidas</Text>
            </View>
          </View>
        )}
      </View>

      {/* 3. Próximo Espectáculo Confirmado (Si aplica a Comprador) */}
      {!isOrganizador && metrics.proximoEvento && (
        <Card style={styles.nextEventBanner}>
          <View style={styles.nextEventHeader}>
            <Feather name="clock" size={16} color={colors.primaryDark} />
            <Text style={styles.nextEventTitle}>Próximo Espectáculo Confirmado:</Text>
          </View>
          <Text style={styles.nextEventName} numberOfLines={1}>
            {metrics.proximoEvento.evento?.nombre}
          </Text>
          <View style={styles.nextEventFooter}>
            <Text style={styles.nextEventCountdown}>
              ⏱️ {metrics.proximoEvento.diasFaltantes === 0 ? "¡El evento es hoy!" : `Faltan ${metrics.proximoEvento.diasFaltantes} días`}
            </Text>
          </View>
        </Card>
      )}

      {/* 4. Información Detallada de la Cuenta */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="user-check" size={16} color={colors.primaryDark} />
          <Text style={styles.cardTitle}>Información de la Cuenta</Text>
        </View>

        {/* Email */}
        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.compradorBg }]}>
            <Feather name="mail" size={18} color={colors.comprador} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Correo Electrónico</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Rol */}
        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.organizadorBg }]}>
            <Feather name="shield" size={18} color={colors.organizador} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Rol en la Plataforma</Text>
            <Text style={styles.infoValue}>{user?.rol}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ID de usuario */}
        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceAlt }]}>
            <Feather name="hash" size={18} color={colors.textMuted} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Identificador Único</Text>
            <Text style={styles.infoValueSmall}>{user?.id}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Fecha de registro */}
        <View style={styles.infoRow}>
          <View style={[styles.iconBox, { backgroundColor: "#faf5ff" }]}>
            <Feather name="calendar" size={18} color="#9333ea" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Fecha de Registro</Text>
            <Text style={styles.infoValue}>{formatearFecha(user?.fechaCreacion)}</Text>
          </View>
        </View>
      </Card>

      {/* 5. Botón de Logout */}
      <View style={styles.logoutWrapper}>
        <Button
          title="Cerrar Sesión"
          variant="danger"
          icon={<Feather name="log-out" size={18} color={colors.error} />}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </View>

      {/* Modal de Confirmación */}
      <ConfirmModal
        visible={showLogoutModal}
        title="¿Cerrar Sesión?"
        message="¿Estás seguro de que deseas salir? Tendrás que volver a ingresar tus credenciales para acceder."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        isDanger
        icon={<Feather name="log-out" size={26} color={colors.error} />}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
    paddingBottom: spacing.xxl,
  },

  // 1. Hero Card
  heroCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  avatarWrapper: {
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    ...shadows.md,
  },
  avatarOrg: {
    backgroundColor: colors.primaryDark,
  },
  avatarComp: {
    backgroundColor: colors.comprador,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 6,
  },
  badgeWrapper: {
    marginTop: 2,
  },

  // 2. Grid de Estadísticas
  statsContainer: {
    marginBottom: spacing.md,
  },
  statsLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingStatsText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // 3. Banner Próximo Evento
  nextEventBanner: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  nextEventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  nextEventTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nextEventName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  nextEventFooter: {
    flexDirection: "row",
  },
  nextEventCountdown: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  // 4. Card Información
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  infoValueSmall: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },

  // 5. Logout
  logoutWrapper: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  logoutBtn: {
    width: "100%",
  },
});
