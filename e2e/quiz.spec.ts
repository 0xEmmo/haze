import { expect, expectAccessible, test } from './fixtures'

test('quiz: swipe through, set the dials, get shareable matches, fill the box', async ({ page }) => {
  await page.goto('/quiz')
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByText('1 of 8')).toBeVisible()

  // love the warm ones, pass on the fresh ones, mixing buttons, keys and a real drag
  const love = () => page.getByRole('button', { name: 'I’d wear this' }).click()
  const pass = () => page.getByRole('button', { name: 'Not for me' }).click()
  await pass() // sea
  await pass() // peel
  await page.getByRole('button', { name: 'Not sure' }).click() // roses
  await page.keyboard.press('ArrowLeft') // fig
  await expect(page.getByText('5 of 8')).toBeVisible()

  // drag the top card to the right
  const card = page.getByRole('article', { name: 'Freshly cut wood' })
  const box = (await card.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 })
  await page.mouse.move(box.x + box.width / 2 + 260, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  await expect(page.getByText('6 of 8')).toBeVisible()

  await love() // resin
  await page.keyboard.press('ArrowRight') // coffee
  await love() // smoke

  await expect(page.getByRole('heading', { name: 'Three dials' })).toBeVisible()
  const warmth = page.getByRole('slider', { name: 'Fresh or cosy?' })
  await warmth.focus()
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight')
  await expectAccessible(page)
  await page.getByRole('button', { name: 'Show my matches' }).click()

  await expect(page).toHaveURL(/s=nnsnllll/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Mostly/)
  await expect(page.getByRole('heading', { name: 'Your matches' })).toBeVisible()
  const first = page.getByRole('listitem').filter({ hasText: '% match' }).first()
  await expect(first).toBeVisible()
  await expectAccessible(page)

  // the result URL works on its own
  const url = page.url()
  await page.goto(url)
  await expect(page.getByRole('heading', { name: 'Your matches' })).toBeVisible()

  await page.getByRole('button', { name: /Sample my top 5/ }).click()
  await expect(page).toHaveURL(/\/box$/)
  await expect(page.getByRole('heading', { name: /Your box/ })).toContainText('5/5')
})
