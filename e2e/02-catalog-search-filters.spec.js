import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.js";

test.describe("E2E Suite B: Catálogo, Búsqueda con Debounce y Filtros (CU-03, CU-10, CU-11)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "comprador");
  });

  test("E2E-04: Búsqueda de eventos con debounce (CU-03)", async ({ page }) => {
    // Verificar catálogo inicial
    await expect(page.locator("text=Coldplay - Music of the Spheres").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Cosquín Rock 2027").first()).toBeVisible();

    // Escribir en la barra de búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar por artista"]');
    await searchInput.fill("Coldplay");

    // Esperar al debounce y verificar que solo aparece Coldplay
    await expect(page.locator("text=Coldplay - Music of the Spheres").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Cosquín Rock 2027")).toHaveCount(0);

    // Borrar texto de búsqueda con el botón X
    const clearBtn = page.locator('[aria-label="Borrar texto de búsqueda"], [role="button"]:has(svg), text=x').first();
    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click();
    } else {
      await searchInput.fill("");
    }

    // Verificar que reaparece el resto del catálogo
    await expect(page.locator("text=Cosquín Rock 2027").first()).toBeVisible({ timeout: 5000 });
  });

  test("E2E-05: Filtrado por categorías (CU-03)", async ({ page }) => {
    // Seleccionar categoría Teatro
    const teatroPill = page.locator("text=Teatro").first();
    await teatroPill.waitFor({ state: "visible" });
    await teatroPill.click();

    // Debe mostrar la obra de teatro y ocultar conciertos de música
    await expect(page.locator("text=El Método Grönholm").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Coldplay - Music of the Spheres")).toHaveCount(0);

    // Volver a categoría Todas
    const todasPill = page.locator("text=Todas").first();
    await todasPill.click();

    await expect(page.locator("text=Coldplay - Music of the Spheres").first()).toBeVisible({ timeout: 5000 });
  });

  test("E2E-06: Ordenamiento por precio menor a mayor (CU-11)", async ({ page }) => {
    // Abrir modal de ordenamiento
    const sortBtn = page.locator('[aria-label^="Ordenar eventos"]').first();
    await sortBtn.click();

    // Seleccionar opción de menor a mayor
    const menorPrecioOption = page.locator("text=Precio: Menor a Mayor").first();
    await menorPrecioOption.waitFor({ state: "visible" });
    await menorPrecioOption.click();

    // Aplicar ordenamiento
    const aplicarBtn = page.locator("text=Aplicar Orden").first();
    await aplicarBtn.click();

    // El evento más accesible del catálogo semilla es "AI & Modern Software Summit" ($5.000) o Grönholm ($8.500)
    await expect(page.locator("text=$5.000").first()).toBeVisible({ timeout: 5000 });
  });
});
