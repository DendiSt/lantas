import { test, expect } from '@playwright/test';

test.describe('LANTAS Core Flow', () => {
  test('should allow student to submit request and admin to approve it', async ({ page }) => {
    // 1. Student logs in / goes to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/Siswa Dashboard/i);
    
    // Check for Add button
    const addButton = page.getByRole('button', { name: /Ajukan Izin/i });
    await expect(addButton).toBeVisible();

    // 2. Open dialog and fill form
    await addButton.click();
    
    // Select type (SAKIT)
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Sakit")');
    
    // Fill reason
    await page.fill('textarea[name="reason"]', 'Saya sedang sakit dan tidak bisa hadir hari ini.');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for success toast/notification
    await expect(page.locator('text=Pengajuan berhasil dikirim')).toBeVisible({ timeout: 10000 });
    
    // 3. Go to Admin Dashboard
    await page.goto('/admin');
    await expect(page).toHaveTitle(/Admin TU/i);
    
    // The request should appear in the table. 
    // We expect "Saya sedang sakit dan tidak bisa hadir hari ini." to be in the table.
    const row = page.locator('tr').filter({ hasText: 'Saya sedang sakit' }).first();
    await expect(row).toBeVisible();
    
    // 4. Admin approves
    const approveButton = row.locator('button', { hasText: 'Setujui' });
    await expect(approveButton).toBeVisible();
    await approveButton.click();
    
    // Expect status to change to APPROVED (Setujui)
    await expect(row.locator('.bg-emerald-500, .bg-emerald-100')).toBeVisible({ timeout: 10000 });
  });
});
