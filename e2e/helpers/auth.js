/**
 * Helper utilities para autenticación y navegación E2E
 */

export const CREDENTIALS = {
  comprador: {
    email: "comprador@demo.com",
    password: "comprador123",
    name: "Carlos Comprador",
  },
  organizador: {
    email: "organizador@demo.com",
    password: "organizador123",
    name: "Olga Organizadora",
  },
};

export async function loginAs(page, role = "comprador") {
  const creds = CREDENTIALS[role];
  if (!creds) throw new Error(`Rol desconocido: ${role}`);

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Si ya estamos autenticados, cerramos sesión primero
  const logoutBtn = page.locator("text=Cerrar Sesión");
  if (await logoutBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await logout(page);
  }

  // Verificar si estamos en la pantalla de login
  const emailInput = page.locator('input[placeholder="ejemplo@correo.com"]');
  await emailInput.waitFor({ state: "visible", timeout: 10000 });

  await emailInput.fill(creds.email);
  const passwordInput = page.locator('input[placeholder="Tu contraseña"]');
  await passwordInput.fill(creds.password);

  const submitButton = page.locator('text=Entrar a la plataforma');
  await submitButton.click();

  // Esperar a que cargue la interfaz principal según rol
  if (role === "comprador") {
    await page.locator("text=Explorar").first().waitFor({ state: "visible", timeout: 10000 });
  } else {
    await page.locator("text=Mis Eventos").first().waitFor({ state: "visible", timeout: 10000 });
  }
}

export async function logout(page) {
  // Navegar a la pestaña Mi Perfil
  const profileTab = page.locator("text=Mi Perfil").first();
  if (await profileTab.isVisible().catch(() => false)) {
    await profileTab.click();
  }

  // Presionar botón Cerrar Sesión en la pantalla
  const logoutBtn = page.locator("text=Cerrar Sesión").first();
  await logoutBtn.waitFor({ state: "visible", timeout: 10000 });
  await logoutBtn.click();

  // Confirmar en el modal de confirmación
  const dialogConfirm = page.locator('text="¿Cerrar Sesión?"').locator("..").locator('text="Cerrar Sesión"').last();
  await dialogConfirm.waitFor({ state: "visible", timeout: 5000 });
  await dialogConfirm.click();

  // Esperar a ver la pantalla de login
  await page.locator('input[placeholder="ejemplo@correo.com"]').waitFor({ state: "visible", timeout: 10000 });
}
