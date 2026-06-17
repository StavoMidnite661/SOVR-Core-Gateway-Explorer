import { test, expect } from '@playwright/test';

test('Command View rendering verification', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:3000');

  // Wait for the landing page to load
  const enterBtn = page.locator('#initialize-gateway-cta');
  await expect(enterBtn).toBeVisible({ timeout: 15000 });

  // Enter the system
  await enterBtn.click();

  // Wait for the dashboard to appear by looking for the "Command View" button
  const commandViewTrigger = page.locator('button:has-text("Command View")');
  await expect(commandViewTrigger).toBeVisible({ timeout: 15000 });
  await commandViewTrigger.click();

  // Check if CommandCenterView is visible
  const dashboard = page.locator('#command-center-fullscreen-dashboard');
  await expect(dashboard).toBeVisible({ timeout: 15000 });

  // Wait for loading to finish if it shows "Establishing Authority Link..."
  await expect(page.locator('text=Establishing Authority Link...')).not.toBeVisible({ timeout: 20000 });

  // Check for the globe canvas
  const globe = page.locator('#globe_canvas_container');
  await expect(globe).toBeVisible();

  // Check for some text that should be there
  await expect(page.locator('text=SOVR Capital Routing Command Center')).toBeVisible();

  // Take a screenshot
  await page.screenshot({ path: 'command_view_verification.png', fullPage: true });

  console.log('Command View verified successfully.');
});
