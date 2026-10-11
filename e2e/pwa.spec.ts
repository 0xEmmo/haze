import { expect, test } from './fixtures'

test('ships a manifest and registers a service worker', async ({ page, request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json()
  expect(manifest.name).toContain('Haze')
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
  await page.goto('/')
  await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())), { timeout: 15000 }).toBe(true)
})

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByRole('heading', { name: /evaporated/ })).toBeVisible()
  await page.goto('/shop/not-a-perfume')
  await expect(page.getByRole('heading', { name: /evaporated/ })).toBeVisible()
})
