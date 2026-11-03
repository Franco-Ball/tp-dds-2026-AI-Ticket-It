import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers/auth.js";

test.describe("E2E Suite A: Autenticación, Roles y Navegación Base", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Limpiar localStorage antes de cada prueba para arrancar desde estado limpio
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test("E2E-01: Rechazo de credenciales inválidas (Camino Triste)", async ({ page }) => {
    const emailInput = page.locator('input[placeholder="ejemplo@correo.com"]');
    await emailInput.waitFor({ state: "visible" });
    await emailInput.fill("usuario_inexistente@demo.com");

    const passwordInput = page.locator('input[placeholder="Tu contraseña"]');
    await passwordInput.fill("clave_incorrecta_123");

    const submitBtn = page.locator("text=Entrar a la plataforma");
    await submitBtn.click();

    // Debe mostrar la alerta visual de error
    const alertError = page.locator("text=/Credenciales inválidas/i");
    await expect(alertError).toBeVisible({ timeout: 5000 });
  });

  test("E2E-02: Inicio de sesión exitoso como Comprador y navegación de tabs", async ({ page }) => {
    await loginAs(page, "comprador");

    // Verificar las 3 pestañas del rol Comprador
    await expect(page.locator("text=Explorar").first()).toBeVisible();
    await expect(page.locator("text=Mis Compras").first()).toBeVisible();
    await expect(page.locator("text=Mi Perfil").first()).toBeVisible();

    // Verificar que no ve las pestañas de Organizador
    await expect(page.locator("text=Mis Eventos")).toHaveCount(0);
    await expect(page.locator("text=Publicar")).toHaveCount(0);

    // Navegar a Mi Perfil y verificar datos
    await page.locator("text=Mi Perfil").first().click();
    await expect(page.locator("text=Carlos Comprador")).toBeVisible();
    await expect(page.locator("text=comprador@demo.com")).toBeVisible();

    // Cerrar sesión
    await logout(page);
  });

  test("E2E-03: Inicio de sesión exitoso como Organizador y navegación de tabs", async ({ page }) => {
    await loginAs(page, "organizador");

    // Verificar las 3 pestañas del rol Organizador
    await expect(page.locator("text=Mis Eventos").first()).toBeVisible();
    await expect(page.locator("text=Publicar").first()).toBeVisible();
    await expect(page.locator("text=Mi Perfil").first()).toBeVisible();

    // Verificar que no ve las pestañas de Comprador
    await expect(page.locator("text=Explorar")).toHaveCount(0);
    await expect(page.locator("text=Mis Compras")).toHaveCount(0);

    // Navegar a Mi Perfil y verificar datos del organizador
    await page.locator("text=Mi Perfil").first().click();
    await expect(page.locator("text=Olga Organizadora")).toBeVisible();
    await expect(page.locator("text=organizador@demo.com")).toBeVisible();

    // Cerrar sesión
    await logout(page);
  });
});
