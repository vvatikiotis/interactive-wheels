import { expect, test } from '@playwright/test'

test('all eight adjustment sliders update their displayed measurements', async ({ page }) => {
  await page.goto('/')
  const cases = [
    ['Seat width', '46', '46 cm'],
    ['Seat depth', '46', '46 cm'],
    ['Rear-wheel camber', '-4', '-4 °'],
    ['Rear axle position', '12', '+12 cm'],
    ['Backrest height', '20', '20 cm'],
    ['Backrest angle to seat', '85', '85 °'],
    ['Seat angle to ground', '12', '12 °'],
    ['Footplate slope', '10', '10 °'],
  ]
  for (const [label, value, displayed] of cases) {
    const slider = page.getByLabel(label)
    await slider.fill(value)
    await expect(page.locator('label').filter({ hasText: label }).getByText(displayed, { exact: true })).toBeVisible()
  }
  await expect(page.getByLabel('Rear-wheel camber')).toHaveAttribute('min', '-4')
  await expect(page.getByLabel('Backrest height')).toHaveAttribute('min', '10')
  await expect(page.getByLabel('Footplate slope')).toHaveAttribute('min', '0')
  await expect(page.getByLabel('Footplate slope')).toHaveAttribute('max', '15')
})

test('minimum and maximum dimensions and angles keep the generated chair renderable', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  await expect(viewer.locator('canvas')).toBeVisible()
  const before = await viewer.screenshot()
  for (const [label, value] of [
    ['Seat width', '33'],
    ['Seat depth', '36'],
    ['Rear-wheel camber', '-4'],
    ['Rear axle position', '0'],
    ['Backrest height', '10'],
    ['Backrest angle to seat', '80'],
    ['Seat angle to ground', '0'],
    ['Footplate slope', '0'],
  ]) await page.getByLabel(label).fill(value)
  expect((await viewer.screenshot()).equals(before)).toBe(false)
  for (const [label, value] of [
    ['Seat width', '46'],
    ['Seat depth', '46'],
    ['Rear-wheel camber', '6'],
    ['Rear axle position', '12'],
    ['Backrest height', '45'],
    ['Backrest angle to seat', '110'],
    ['Seat angle to ground', '12'],
    ['Footplate slope', '15'],
  ]) await page.getByLabel(label).fill(value)
  await expect(page.getByText('12 °', { exact: true })).toBeVisible()
  expect((await viewer.screenshot()).equals(before)).toBe(false)
  await expect(viewer.locator('canvas')).toBeVisible()
})

test('backrest folds and unfolds while adjustments are disabled', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  await page.getByLabel('Backrest angle to seat').fill('100')
  const before = await viewer.screenshot()
  await page.getByRole('button', { name: 'Fold', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Folding…' })).toBeDisabled()
  await expect(page.locator('.controls input:disabled')).toHaveCount(8)
  await expect(page.getByRole('button', { name: 'Unfold' })).toBeEnabled()
  const folded = await viewer.screenshot()
  expect(folded.equals(before)).toBe(false)
  const box = await viewer.locator('canvas').boundingBox()
  if (!box) throw new Error('3D viewer has no bounds')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 8 })
  await page.mouse.up()
  expect((await viewer.screenshot()).equals(folded)).toBe(false)
  await page.getByRole('button', { name: 'Unfold' }).click()
  await expect(page.locator('.controls input:disabled')).toHaveCount(8)
  await expect(page.getByRole('button', { name: 'Fold', exact: true })).toBeEnabled()
  await expect(page.locator('.controls input:disabled')).toHaveCount(0)
  await expect(page.getByText('100 °', { exact: true })).toBeVisible()
  expect((await viewer.screenshot()).equals(folded)).toBe(false)
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
