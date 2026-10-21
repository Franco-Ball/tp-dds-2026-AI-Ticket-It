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
import RoleSelectorCard from "../components/ui/RoleSelectorCard";
import { colors, borderRadius, spacing } from "../theme/theme";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("COMPRADOR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
        rol,
      });
    } catch (err) {
      setError(err.message || "Error al registrar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderLogo size={100} />

        <Card style={styles.card}>
          <Text style={styles.title}>Crear Cuenta</Text>

          {error ? (
            <View style={styles.errorAlert}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorAlertText}>{error}</Text>
            </View>
          ) : null}

          {/* Selector interactivo de Rol con verde de la cátedra */}
          <RoleSelectorCard selectedRole={rol} onSelectRole={setRol} />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input
                label="Nombre"
                placeholder="Carlos"
                value={nombre}
                onChangeText={setNombre}
                icon={<Feather name="user" size={18} color={colors.textMuted} />}
              />
            </View>
            <View style={styles.rowSpacer} />
            <View style={styles.flex1}>
              <Input
                label="Apellido"
                placeholder="Gómez"
                value={apellido}
                onChangeText={setApellido}
                icon={<Feather name="user" size={18} color={colors.textMuted} />}
              />
            </View>
          </View>

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
            label="Contraseña (mínimo 6 caracteres)"
            placeholder="Tu contraseña secreta"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Feather name="lock" size={18} color={colors.textMuted} />}
          />

          <Button
            title="Completar Registro"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footerLinkWrapper}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta creada? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: Platform.OS === "android" ? spacing.xl : spacing.md,
  },
  card: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  flex1: {
    flex: 1,
  },
  rowSpacer: {
    width: 10,
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
    marginTop: 8,
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
});
