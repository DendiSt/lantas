import { test, expect } from '@playwright/test';

test.describe('LANTAS Core Flow', () => {
  test('should allow student to submit request and admin to approve it', async ({ page }) => {
    // 1. Student opens dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/LANTAS/i);
    await expect(page.getByRole('heading', { name: /Zibril/i })).toBeVisible();
    
    // Check for Add button
    const addButton = page.getByRole('button', { name: /Ajukan Izin/i });
    await expect(addButton).toBeVisible();

    // 2. Open dialog and fill form
    await addButton.click();
    
    // Select type (Sakit)
    await page.getByRole('button', { name: 'Sakit' }).click();
    
    // Fill reason
    await page.fill('textarea[name="reason"]', 'Saya sedang sakit dan tidak bisa hadir hari ini.');
    
    // Submit
    await page.getByRole('button', { name: /Kirim Pengajuan Izin/i }).click();
    
    // Wait for success alert/notification
    await expect(page.getByText(/Pengajuan izin berhasil dikirim/i)).toBeVisible({ timeout: 10000 });
    
    // 3. Go to Admin Dashboard
    await page.goto('/admin');
    await expect(page).toHaveTitle(/LANTAS/i);
    await expect(page.getByRole('heading', { name: /Permission Requests/i })).toBeVisible();
    
    // The request should appear in the table
    const row = page.locator('tr').filter({ hasText: 'Saya sedang sakit' }).first();
    await expect(row).toBeVisible();
    
    // 4. Admin approves
    const approveButton = row.getByRole('button', { name: /Setujui/i });
    await expect(approveButton).toBeVisible();
    await approveButton.click();
    
    // Expect status badge to change to APPROVED
    await expect(row.getByText('APPROVED')).toBeVisible({ timeout: 10000 });
  });
});

