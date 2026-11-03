import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.js";

test.describe("E2E Suite C: Publicación de Eventos por Organizador (CU-04)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "organizador");
  });

  test("E2E-07: Publicación exitosa de espectáculo con múltiples entradas (CU-04)", async ({ page }) => {
    // Escuchar y aceptar diálogo de confirmación de publicación
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    // Navegar a la pestaña Publicar
    const publishTab = page.locator("text=Publicar").first();
    await publishTab.click();

    // Completar título del evento con timestamp único para no colisionar
    const eventTitle = `E2E Festival Playwright ${Date.now()}`;
    const titleInput = page.locator('input[placeholder*="Lollapalooza"]');
    await titleInput.waitFor({ state: "visible" });
    await titleInput.fill(eventTitle);

    // Seleccionar categoría
    const catBtn = page.locator("text=Recitales").first();
    if (await catBtn.isVisible().catch(() => false)) {
      await catBtn.click();
    }

    // Completar descripción
    const descInput = page.locator('textarea, input[placeholder*="Detalla artistas"]');
    await descInput.fill("Gran festival de rock en vivo con artistas de primer nivel.");

    // Presionar botón de publicación
    const submitBtn = page.locator("text=Publicar Evento Oficial").first();
    await submitBtn.click();

    // Navegar a Mis Eventos y verificar que aparece en el listado
    const eventsTab = page.locator("text=Mis Eventos").first();
    await eventsTab.click();

    await expect(page.locator(`text=${eventTitle}`).first()).toBeVisible({ timeout: 10000 });
  });
});
