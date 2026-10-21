export const colors = {
  // Verde oficial de la cátedra (extraído del logo de AI Ticket It)
  primary: "#55d233",
  primaryDark: "#43a925",
  primaryLight: "rgba(85, 210, 51, 0.12)",
  primaryGlow: "rgba(85, 210, 51, 0.35)",

  // Fondos y superficies estilo Clean & Bright
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceAlt: "#f1f5f9",

  // Textos y contrastes
  text: "#111827",
  textMuted: "#64748b",
  textSubtle: "#94a3b8",
  textInverse: "#ffffff",

  // Bordes
  border: "#e2e8f0",
  borderFocus: "#55d233",

  // Roles
  comprador: "#0284c7",
  compradorBg: "rgba(2, 132, 199, 0.1)",
  organizador: "#f59e0b",
  organizadorBg: "rgba(245, 158, 11, 0.1)",

  // Estados semánticos
  error: "#ef4444",
  errorBg: "rgba(239, 68, 68, 0.1)",
  success: "#10b981",
  successBg: "rgba(16, 185, 129, 0.1)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const borderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  glow: {
    shadowColor: "#55d233",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
};
