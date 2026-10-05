import { expect, test } from '@playwright/test'

test('all seven adjustment sliders update their displayed measurements', async ({ page }) => {
  await page.goto('/')
  const cases = [
    ['Seat width', '46', '46 cm'],
    ['Seat depth', '46', '46 cm'],
    ['Rear-wheel camber', '6', '6 °'],
    ['Rear axle position', '12', '+12 cm'],
    ['Backrest height', '45', '45 cm'],
    ['Backrest angle to seat', '110', '110 °'],
    ['Seat angle to ground', '12', '12 °'],
  ]
  for (const [label, value, displayed] of cases) {
    await page.getByLabel(label).fill(value)
    await expect(page.locator('label').filter({ hasText: label }).getByText(displayed, { exact: true })).toBeVisible()
  }
})

test('maximum dimensions and angles keep the generated chair renderable', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  await expect(viewer.locator('canvas')).toBeVisible()
  const before = await viewer.screenshot()
  for (const [label, value] of [
    ['Seat width', '46'],
    ['Seat depth', '46'],
    ['Rear-wheel camber', '6'],
    ['Rear axle position', '12'],
    ['Backrest height', '45'],
    ['Backrest angle to seat', '110'],
    ['Seat angle to ground', '12'],
  ]) await page.getByLabel(label).fill(value)
  await expect(page.getByText('12 °', { exact: true })).toBeVisible()
  expect((await viewer.screenshot()).equals(before)).toBe(false)
  await expect(viewer.locator('canvas')).toBeVisible()
})

test('rear axle slider moves both rear wheels and the axle tube', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  await expect(viewer.locator('canvas')).toBeVisible()
  await expect(page.getByText('+8 cm')).toBeVisible()
  const before = await viewer.screenshot()
  const slider = page.getByLabel('Rear axle position')
  await slider.fill('12')
  await expect(page.getByText('+12 cm')).toBeVisible()
  const after = await viewer.screenshot()
  expect(after.equals(before)).toBe(false)
})

test('default wheelchair is visible and drag/scroll change the view', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  await expect(viewer.locator('canvas')).toBeVisible()
  const box = await viewer.locator('canvas').boundingBox()
  if (!box) throw new Error('3D viewer has no bounds')
  const before = await viewer.screenshot()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 160, box.y + box.height / 2, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(250)
  const rotated = await viewer.screenshot()
  expect(rotated.equals(before)).toBe(false)
  await page.mouse.wheel(0, -400)
  await page.waitForTimeout(250)
  const zoomed = await viewer.screenshot()
  expect(zoomed.equals(rotated)).toBe(false)
})
