import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import HeaderLogo from "../components/ui/HeaderLogo";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { colors, borderRadius, spacing } from "../theme/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Logo Oficial de la Cátedra */}
        <HeaderLogo size={120} />

        {/* Tarjeta de Formulario */}
        <Card style={styles.card}>
          <Text style={styles.title}>Iniciar Sesión</Text>

          {error ? (
            <View style={styles.errorAlert}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorAlertText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Feather name="mail" size={18} color={colors.textMuted} />}
          />

          <Input
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Feather name="lock" size={18} color={colors.textMuted} />}
          />

          <Button
            title="Entrar a la plataforma"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footerLinkWrapper}>
            <Text style={styles.footerText}>¿No tienes una cuenta aún? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.footerLink}>Crear cuenta gratis</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Sección de Accesos Rápidos para evaluación de cátedra */}
        <View style={styles.quickAccessSection}>
          <View style={styles.quickAccessHeader}>
            <Feather name="zap" size={14} color={colors.organizador} />
            <Text style={styles.quickAccessTitle}>Credenciales rápidas de prueba:</Text>
          </View>

          <View style={styles.quickAccessRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.quickAccessCard}
              onPress={() => handleQuickLogin("comprador@demo.com", "comprador123")}
            >
              <Feather name="user-check" size={16} color={colors.comprador} />
              <View style={styles.quickAccessText}>
                <Text style={styles.quickAccessName}>Comprador</Text>
                <Text style={styles.quickAccessEmail}>comprador@demo.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.quickAccessCard}
              onPress={() => handleQuickLogin("organizador@demo.com", "organizador123")}
            >
              <Feather name="user-check" size={16} color={colors.organizador} />
              <View style={styles.quickAccessText}>
                <Text style={styles.quickAccessName}>Organizador</Text>
                <Text style={styles.quickAccessEmail}>organizador@demo.com</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    paddingTop: Platform.OS === "android" ? spacing.xl : spacing.md,
    justifyContent: "center",
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
  },

  card: {
    padding: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorBg,
    padding: 10,
    borderRadius: borderRadius.sm,
    marginBottom: 14,
    gap: 8,
  },
  errorAlertText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "600",
    flex: 1,
  },
  submitBtn: {
    marginTop: 6,
  },
  footerLinkWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  quickAccessSection: {
    marginTop: 8,
  },
  quickAccessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  quickAccessRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickAccessCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 10,
    gap: 8,
  },
  quickAccessText: {
    flex: 1,
  },
  quickAccessName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  quickAccessEmail: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
});
