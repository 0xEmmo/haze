import { expect, expectAccessible, isMobile, test } from './fixtures'

test('home introduces the shop and passes an accessibility check', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Fragrance')
  await expect(page.getByRole('link', { name: 'Find your scent' }).first()).toBeVisible()
  await expectAccessible(page)
})

test('shop filters live in the URL and narrow the list', async ({ page }) => {
  await page.goto('/shop')
  const status = page.getByRole('status').filter({ hasText: /scents?/ })
  await expect(status).toContainText('18 scents')
  await page.getByRole('group', { name: 'Type' }).getByRole('button', { name: 'Candles' }).click()
  await expect(status).toContainText('6 scents')
  await expect(page).toHaveURL(/kind=candle/)
  await page.getByRole('group', { name: 'Type' }).getByRole('button', { name: 'Perfume' }).click()
  await page.getByRole('group', { name: 'Scent family' }).getByRole('button', { name: 'Aquatic' }).click()
  await expect(page.getByRole('heading', { name: 'Lekki Salt' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Oud Oba' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(status).toContainText('18 scents')
  await expectAccessible(page)
})

test('search finds perfumes by note', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Search' }).click()
  await page.getByRole('combobox').fill('frankincense')
  await expect(page.getByRole('option', { name: /Eau de parfum\s*Harmattan/ })).toBeVisible()
  await page.getByRole('combobox').press('ArrowDown')
  await page.getByRole('combobox').press('Enter')
  await expect(page).toHaveURL(/\/shop\/harmattan/)
})

test('scent wheel: tapping a family and a note shows where it is used', async ({ page }) => {
  await page.goto('/wheel')
  await page.getByRole('button', { name: 'Aquatic family' }).click()
  await expect(page).toHaveURL(/family=aquatic/)
  await expect(page.getByRole('heading', { level: 2, name: 'Aquatic' })).toBeVisible()
  await page.getByRole('button', { name: 'Sea salt, aquatic note' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Sea salt' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Lekki Salt/ })).toBeVisible()
  // keyboard works too
  await page.getByRole('button', { name: 'Smoky family' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 2, name: 'Smoky' })).toBeVisible()
  await expectAccessible(page)
})

test('a note link from a product opens the wheel on that note', async ({ page }) => {
  await page.goto('/wheel?note=vetiver')
  await expect(page.getByRole('heading', { level: 2, name: 'Vetiver' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Vetiver, woody note' })).toHaveAttribute('aria-pressed', 'true')
})

test('product page: dry-down slider and note pyramid respond', async ({ page }) => {
  await page.goto('/shop/harmattan')
  await expect(page.getByRole('heading', { level: 1, name: 'Harmattan' })).toBeVisible()
  await page.getByRole('button', { name: 'Iris' }).click()
  await expect(page.getByText('Powdery and cool')).toBeVisible()
  const slider = page.getByRole('slider')
  await slider.focus()
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight')
  await expect(page.getByText('The heart', { exact: true })).toBeVisible()
  await expectAccessible(page)
})

test('compare highlights shared notes and can be shared by URL', async ({ page }) => {
  await page.goto('/compare?ids=harmattan,oud-oba')
  await expect(page.getByRole('columnheader', { name: /Harmattan/ })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: /Oud/ })).toBeVisible()
  await expect(page.getByText(/Shared notes are highlighted/)).toContainText('Sandalwood')
  await page.getByRole('button', { name: /Ember/ }).click()
  await expect(page).toHaveURL(/ids=harmattan%2Coud-oba%2Cember|ids=harmattan,oud-oba,ember/)
  await expectAccessible(page)
})

test('compare from the shop card shows the tray', async ({ page }) => {
  await page.goto('/shop?kind=fragrance')
  await page.getByRole('button', { name: 'Compare Harmattan' }).click()
  await page.getByRole('button', { name: 'Compare Night Market' }).click()
  const tray = page.getByRole('complementary', { name: 'Compare' })
  await tray.getByRole('link', { name: 'Compare 2' }).click()
  await expect(page.getByRole('columnheader', { name: /Night Market/ })).toBeVisible()
  if (isMobile(page)) await expect(page.getByRole('navigation', { name: 'Main' }).last()).toBeVisible()
})
