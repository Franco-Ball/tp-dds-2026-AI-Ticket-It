import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.js";

test.describe("E2E Suite D: Checkout de Compra en 2 Pasos y Ticket QR (CU-12, CU-01)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "comprador");
  });

  test("E2E-08: Flujo de compra con reserva de cupo, pago y emisión de Ticket QR", async ({ page }) => {
    // 1. Abrir detalle de evento desde el catálogo
    const eventCard = page.locator("text=Coldplay - Music of the Spheres").first();
    await eventCard.waitFor({ state: "visible", timeout: 10000 });
    await eventCard.click();

    // 2. Abrir modal de compra
    const buyBtn = page.locator("text=Comprar Entradas").first();
    await buyBtn.waitFor({ state: "visible", timeout: 10000 });
    await buyBtn.click();

    // 3. Paso 1: Selección de ubicación y cantidad
    const step1Title = page.locator("text=Adquirir Entradas (1/2)");
    await expect(step1Title).toBeVisible();

    // Sumar una entrada
    const plusBtn = page.locator('[aria-label="Sumar una entrada"]').first();
    if (await plusBtn.isVisible().catch(() => false)) {
      await plusBtn.click();
    }

    // Continuar al pago (crea reserva de 15 min en PENDIENTE)
    const continueBtn = page.locator("text=Continuar al Pago").first();
    await continueBtn.click();

    // 4. Paso 2: Pago simulado
    const step2Title = page.locator("text=Confirmar Pago (2/2)");
    await expect(step2Title).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Cupo reservado temporalmente por 15 minutos")).toBeVisible();

    // Seleccionar medio de pago y confirmar
    const paymentMethod = page.locator("text=Tarjeta de Crédito / Débito").first();
    await paymentMethod.click();

    const payBtn = page.locator("text=Pagar y Confirmar Entradas").first();
    await payBtn.click();

    // 5. Paso 3: Éxito y navegación a Mis Compras
    await expect(page.locator("text=¡Compra Confirmada!")).toBeVisible({ timeout: 10000 });
    const viewPurchasesBtn = page.locator("text=Ver en Mis Compras").first();
    await viewPurchasesBtn.click();

    // 6. Verificar en Mis Compras
    await expect(page.locator("text=Mis Compras y Entradas").first()).toBeVisible();
    await expect(page.locator("text=/Faltan \\d+ días para el evento/").first()).toBeVisible({ timeout: 5000 });

    // 7. Visualizar Ticket QR Digital
    const qrBtn = page.locator("text=Ver Entrada / QR").first();
    await qrBtn.waitFor({ state: "visible" });
    await qrBtn.click();

    // Verificar modal del ticket
    await expect(page.locator("text=Presenta este código en la entrada")).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[role="dialog"]').locator("text=Coldplay - Music of the Spheres")).toBeVisible();

    // Cerrar modal del ticket
    const closeTicketBtn = page.locator("text=Cerrar Entrada").first();
    await closeTicketBtn.click();
    await expect(page.locator("text=Presenta este código en la entrada")).toHaveCount(0);
  });
});
