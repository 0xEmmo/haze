// Captures the README screenshots from a running `npm run preview`.
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:4391'
const OUT = 'docs/screenshots'
const shots = [
  { name: 'home-desktop', path: '/', vw: 1440, vh: 900 },
  { name: 'wheel-desktop', path: '/wheel?note=frankincense', vw: 1440, vh: 900 },
  { name: 'product-desktop', path: '/shop/harmattan', vw: 1440, vh: 900 },
  { name: 'quiz-mobile', path: '/quiz?s=nnsnllll&w=80&b=60&n=70', vw: 390, vh: 844 },
  { name: 'wheel-mobile', path: '/wheel', vw: 390, vh: 844 },
  { name: 'box-mobile', path: '/box', vw: 390, vh: 844, fill: true },
]

const browser = await chromium.launch()
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: { width: s.vw, height: s.vh }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(BASE + s.path, { waitUntil: 'load' })
  if (s.fill) {
    await page.getByRole('button', { name: 'Fill the rest for me' }).click()
    await page.getByRole('heading', { name: /Your box/ }).scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, -90))
  }
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/${s.name}.png` })
  await ctx.close()
  console.log(s.name)
}
await browser.close()
