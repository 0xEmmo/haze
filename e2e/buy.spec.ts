import { expect, expectAccessible, test } from './fixtures'

test('sample box → checkout → credit off a full bottle on the next order', async ({ page }) => {
  await page.goto('/box')
  await expect(page.getByRole('button', { name: /Add box to bag/ })).toBeDisabled()
  for (const name of ['Harmattan', 'Lekki Salt', 'Ember', 'Night Market']) await page.getByRole('button', { name, exact: false }).filter({ hasText: name }).first().click()
  await expect(page.getByRole('heading', { name: /Your box/ })).toContainText('4/5')
  await page.getByRole('button', { name: 'Fill the rest for me' }).click()
  await expect(page.getByRole('heading', { name: /Your box/ })).toContainText('5/5')
  await expectAccessible(page)
  await page.getByRole('button', { name: /Add box to bag/ }).click()
  await page.getByRole('button', { name: 'View bag' }).click()
  const bag = page.getByRole('dialog', { name: 'Your bag (1)' })
  await expect(bag.getByText('Discovery box', { exact: true })).toBeVisible()
  await bag.getByRole('link', { name: 'Checkout' }).click()

  await fillCheckout(page)
  await page.getByRole('button', { name: /^Pay/ }).click()
  await expect(page.getByText(/It’s ours to look after now/)).toBeVisible()
  await expect(page.getByText(/You’ve earned/)).toContainText('₦18,000')

  // second order: a bottle, with the credit applied
  await page.goto('/shop/lekki-salt')
  await page.getByRole('button', { name: /Add to bag/ }).click()
  await page.getByRole('button', { name: 'View bag' }).click()
  await expect(page.getByRole('dialog').getByText('Sample box credit')).toBeVisible()
  await page.getByRole('dialog').getByRole('link', { name: 'Checkout' }).click()
  await expect(page.getByText('Sample box credit')).toBeVisible()
  await fillCheckout(page)
  // 68,000 − 18,000 + 2,500 delivery
  await expect(page.getByRole('button', { name: /^Pay/ })).toContainText('₦52,500')
  await page.getByRole('button', { name: /^Pay/ }).click()
  await expect(page.getByText(/It’s ours to look after now/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Earlier orders' })).toBeVisible()
})

test('engraving is validated and previewed, and a declined card can be retried', async ({ page }) => {
  await page.goto('/shop/ember')
  await page.getByRole('checkbox', { name: /Engrave the cap/ }).check()
  await page.getByRole('button', { name: /Add to bag/ }).click()
  await expect(page.getByLabel(/Up to 12 characters/)).toBeFocused()
  await page.getByLabel(/Up to 12 characters/).fill('Àdá')
  await page.getByLabel(/Up to 12 characters/).blur()
  await expect(page.getByText(/without accents/)).toBeVisible()
  await page.getByLabel(/Up to 12 characters/).fill('For Ada')
  await expect(page.getByText('For Ada', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Add to bag · ₦73,000/ }).click()
  await page.getByRole('button', { name: 'View bag' }).click()
  await expect(page.getByRole('dialog').getByText('engraved “For Ada”')).toBeVisible()
  await page.getByRole('dialog').getByRole('checkbox', { name: /Wrap it as a gift/ }).check()
  await page.getByRole('dialog').getByRole('link', { name: 'Checkout' }).click()

  // submit empty: errors, focus on the first
  await page.getByRole('button', { name: /^Pay/ }).click()
  await expect(page.getByLabel('Full name')).toBeFocused()
  await expect(page.getByText('Tell us who the order is for')).toBeVisible()

  await fillCheckout(page, 'declined')
  await page.getByLabel(/Card message/).fill('Happy birthday, Ada')
  await page.getByRole('button', { name: /^Pay/ }).click()
  await expect(page.getByRole('alert').filter({ hasText: /declined/i })).toBeVisible()
  await page.getByRole('button', { name: 'one that works' }).click()
  await page.getByRole('button', { name: /^Pay/ }).click()
  await expect(page.getByText(/It’s ours to look after now/)).toBeVisible()
  await expect(page.getByText('“Happy birthday, Ada”')).toBeVisible()
  await expectAccessible(page)
})

test('removing from the bag can be undone', async ({ page }) => {
  await page.goto('/shop/harmattan-candle')
  await page.getByRole('button', { name: /Add to bag/ }).click()
  await page.getByRole('button', { name: 'View bag' }).click()
  const bag = page.getByRole('dialog')
  await bag.getByRole('button', { name: /Remove/ }).click()
  await expect(bag.getByText('Nothing here yet.')).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(bag.getByRole('link', { name: /Harmattan/ })).toBeVisible()
})

async function fillCheckout(page: import('@playwright/test').Page, card: 'works' | 'declined' = 'works') {
  await page.getByLabel('Full name').fill('Ada Obi')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Phone').fill('0803 123 4567')
  await page.getByLabel('State').selectOption('Lagos')
  await page.getByLabel('Area').selectOption('Yaba')
  await page.getByLabel('House number and street').fill('12 Herbert Macaulay Way')
  await page.getByRole('radio', { name: /Lagos delivery/ }).check()
  await page.getByRole('button', { name: card === 'works' ? 'one that works' : 'one that’s declined' }).click()
}
