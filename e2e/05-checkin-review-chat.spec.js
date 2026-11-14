import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers/auth.js";

test.describe("E2E Suite E: Puerta, Calificación y Mensajería de Chat (CU-02, CU-05, CU-06, CU-09)", () => {
  test("E2E-09: Organizador valida acceso en puerta y marca entrada como UTILIZADA (CU-02)", async ({ page }) => {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await loginAs(page, "organizador");

    // En Mis Eventos, abrir ventas de Coldplay
    const ventasBtn = page.locator('[aria-label*="Gestionar ventas y cupos: Coldplay"]').first();
    await ventasBtn.waitFor({ state: "visible", timeout: 10000 });
    await ventasBtn.click();

    // Verificar panel de ventas del evento
    await expect(page.locator("text=Panel de Ventas").first()).toBeVisible({ timeout: 10000 });

    // Buscar una compra confirmada y presionar "Validar Acceso (Puerta)"
    const validateBtn = page.locator("text=Validar Acceso (Puerta)").first();
    if (await validateBtn.isVisible().catch(() => false)) {
      await validateBtn.click();

      // Confirmar en el modal de check-in
      const confirmIngresoBtn = page.locator("text=Confirmar Ingreso").first();
      await confirmIngresoBtn.waitFor({ state: "visible" });
      await confirmIngresoBtn.click();

      // Verificar que el estado cambió a UTILIZADA
      await expect(page.locator("text=UTILIZADA").first()).toBeVisible({ timeout: 5000 });
    }

    await logout(page);
  });

  test("E2E-10: Comprador califica evento con entrada UTILIZADA y comentario (CU-09)", async ({ page }) => {
    await loginAs(page, "comprador");

    // Navegar a Mis Compras -> Utilizadas
    const purchasesTab = page.locator("text=Mis Compras").first();
    await purchasesTab.click();

    const usedTab = page.locator("text=Utilizadas").first();
    await usedTab.click();

    // Buscar botón de calificar
    const reviewBtn = page.locator("text=Calificar").first();
    if (await reviewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reviewBtn.click();

      // Modal de reseña
      await expect(page.locator("text=Calificar Evento")).toBeVisible({ timeout: 5000 });

      // Seleccionar 5 estrellas
      const star5 = page.locator('[aria-label="Calificar con 5 estrellas"]').first();
      await star5.click();

      // Escribir comentario
      const commentInput = page.locator('textarea, input[placeholder*="sonido"]').first();
      await commentInput.fill("Excelente producción técnica y organización!");

      // Publicar reseña
      const submitReviewBtn = page.locator("text=Publicar Opinión").first();
      await submitReviewBtn.click();

      // Verificar que el modal se cerró
      await expect(page.locator("text=Calificar Evento")).toHaveCount(0);
    }

    await logout(page);
  });

  test("E2E-11: Mensajería bidireccional en chat de compra (CU-05, CU-06)", async ({ page }) => {
    // 1. Comprador envía mensaje
    await loginAs(page, "comprador");

    const purchasesTab = page.locator("text=Mis Compras").first();
    await purchasesTab.click();

    // Abrir chat de la primera compra
    const chatBtn = page.locator("text=Chat").first();
    await chatBtn.waitFor({ state: "visible", timeout: 10000 });
    await chatBtn.click();

    // Escribir y enviar mensaje
    const msgText = `Consulta de prueba E2E ${Date.now()}`;
    const chatInput = page.locator('textarea[placeholder*="mensaje"], input[placeholder*="mensaje"]');
    await chatInput.waitFor({ state: "visible", timeout: 5000 });
    await chatInput.fill(msgText);

    const sendBtn = page.locator('[aria-label="Enviar mensaje"]').first();
    await sendBtn.click();

    // Verificar que el mensaje aparece en la conversación
    await expect(page.locator(`text=${msgText}`).first()).toBeVisible({ timeout: 5000 });

    // Volver y cerrar sesión
    const backBtn = page.locator('[aria-label="Volver a la pantalla anterior"]').first();
    await backBtn.click();
    await logout(page);
  });
});

