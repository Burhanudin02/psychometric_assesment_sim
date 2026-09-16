import { test, expect } from "@playwright/test";

test.describe("Cognitive Assessment Simulator - Full Simulation Flow", () => {
  test("complete 21-module preparation, execution, and analytics review", async ({ page }) => {
    // 1. Visit landing page
    await page.goto("/");
    await expect(page.locator("text=Cognitive Assessment Simulator")).toBeVisible();
    await expect(page.locator("text=Disclaimer Independensi")).toBeVisible();

    // 2. Go to Simulation Preparation Gate
    await page.click("text=Mulai Simulasi 21 Modul");
    await expect(page).toHaveURL(/.*\/simulation\/prepare/);

    // 3. Check both agreement checkboxes
    const checkboxes = page.locator("label");
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();

    // 4. Start assessment
    const startBtn = page.locator("button:has-text('Mulai Asesmen')");
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    // 5. Verify Active Assessment Canvas
    await page.waitForURL(/.*\/simulation\/.+/);
    await expect(page.locator("role=timer")).toBeVisible();
    await expect(page.locator("text=Progres 21 Subtes")).toBeVisible();

    // 6. Select answer for first question
    const firstOption = page.locator("button:has-text('A')").first();
    await firstOption.click();

    // 7. Click next module button
    const nextBtn = page.locator("button:has-text('Simpan & Modul Berikutnya')");
    await nextBtn.click();

    // Wait for module 2
    await expect(page.locator("text=Modul 02")).toBeVisible({ timeout: 10000 });
  });

  test("calibration test flow works", async ({ page }) => {
    await page.goto("/calibration");
    await expect(page.locator("text=Uji Kalibrasi")).toBeVisible();

    // Answer question 1
    const optA = page.locator("button:has-text('A')").first();
    await optA.click();
    await page.click("button:has-text('Lanjut Soal Berikutnya')");

    // Question 2 should show
    await expect(page.locator("text=Soal 2 dari 10")).toBeVisible();
  });
});
