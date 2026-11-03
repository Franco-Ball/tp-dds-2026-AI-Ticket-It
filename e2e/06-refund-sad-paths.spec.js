import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers/auth.js";

test.describe("E2E Suite F: Cancelaciones, Reembolsos y Restricciones de Rol (CU-07, CU-08)", () => {
  test("E2E-12: Comprador solicita reembolso de compra confirmada (CU-07, CU-08)", async ({ page }) => {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await loginAs(page, "comprador");

    const purchasesTab = page.locator("text=Mis Compras").first();
    await purchasesTab.click();

    // Buscar una compra confirmada con botón Reembolso
    const refundBtn = page.locator("text=Reembolso").first();
    await refundBtn.waitFor({ state: "visible", timeout: 10000 });
    await refundBtn.click();

    // Confirmar en el modal de reembolso
    const confirmRefundBtn = page.locator("text=Sí, Cancelar y Reembolsar").first();
    await confirmRefundBtn.waitFor({ state: "visible", timeout: 5000 });
    await confirmRefundBtn.click();

    // Verificar que pasa a estado REEMBOLSADA
    await expect(page.locator("text=REEMBOLSADA").first()).toBeVisible({ timeout: 5000 });

    await logout(page);
  });

  test("E2E-13: Chat cerrado y bloqueado en compras canceladas o reembolsadas", async ({ page }) => {
    await loginAs(page, "comprador");

    const purchasesTab = page.locator("text=Mis Compras").first();
    await purchasesTab.click();

    // Ir a pestaña Canceladas / Reembolsadas
    const cancelTab = page.locator("text=Canceladas / Reembolsadas").first();
    await cancelTab.click();

    // Abrir el chat de una compra cancelada/reembolsada
    const chatBtn = page.locator("text=Chat").first();
    await chatBtn.waitFor({ state: "visible", timeout: 5000 });
    await chatBtn.click();

    // Verificar que muestra el banner de chat cerrado y no el input
    await expect(page.locator("text=El chat se encuentra cerrado").or(page.locator("text=Conversación finalizada")).first()).toBeVisible({ timeout: 5000 });

    const backBtn = page.locator('[aria-label="Volver a la pantalla anterior"]').first();
    await backBtn.click();
    await logout(page);
  });

  test("E2E-14: Alerta de restricción cuando un Organizador intenta comprar entradas", async ({ page }) => {
    let dialogMessage = "";
    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await loginAs(page, "organizador");

    // En Mis Eventos, presionar Ver Detalle de un evento para ir a su vista pública
    const verDetalleBtn = page.locator("text=Ver Detalle").first();
    await verDetalleBtn.waitFor({ state: "visible", timeout: 10000 });
    await verDetalleBtn.click();

    // Intentar presionar Comprar Entradas
    const buyBtn = page.locator("text=Comprar Entradas").first();
    await buyBtn.waitFor({ state: "visible", timeout: 10000 });
    await buyBtn.click();

    // Esperar un momento a que el diálogo o banner sea procesado
    await page.waitForTimeout(500);

    // Validar mensaje del diálogo de advertencia
    expect(dialogMessage).toMatch(/Organizador/i);

    // No debe haberse abierto el modal de compra
    await expect(page.locator("text=Adquirir Entradas (1/2)")).toHaveCount(0);
  });
});

