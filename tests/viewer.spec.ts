import { expect, test } from '@playwright/test'

test('shows the requested page title without the checkpoint label', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Interactive Wheels - Alli Opsi')
  await expect(page.getByText('Interactive wheelchair · Geometry checkpoint')).toHaveCount(0)
})

test('uses a near-black Catppuccin page theme without recoloring the scene', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(8, 8, 13)')
  await expect(page.getByRole('complementary', { name: 'Wheelchair adjustments' })).toHaveCSS('background-color', 'rgb(24, 24, 37)')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', 'rgb(205, 214, 244)')
  await expect(page.getByRole('region', { name: '3D wheelchair viewer' })).toHaveCSS('background-color', 'rgb(237, 242, 243)')
})

test('repository logo links to the project on GitHub', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: 'View source on GitHub' })
  await expect(link).toHaveAttribute('href', 'https://github.com/vvatikiotis/interactive-wheels')
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link.locator('img')).toHaveAttribute('alt', 'GitHub')
})

test('camera hint sits above the adjustments while viewer and panel align', async ({ page }) => {
  await page.goto('/')
  const hint = await page.getByText('Drag to rotate · Scroll to zoom').boundingBox()
  const panel = await page.getByRole('complementary', { name: 'Wheelchair adjustments' }).boundingBox()
  const viewer = await page.getByRole('region', { name: '3D wheelchair viewer' }).boundingBox()
  if (!hint || !panel || !viewer) throw new Error('Viewer layout is missing')
  expect(hint.x).toBeGreaterThanOrEqual(panel.x)
  expect(hint.y + hint.height).toBeLessThan(panel.y)
  expect(Math.abs(viewer.y - panel.y)).toBeLessThan(1)
})

test('shows a small centered credit at the bottom of the page', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer).toHaveText('Vassilis Vatikiotis - AI assisted - 2026')
  expect(await footer.evaluate(element => getComputedStyle(element).textAlign)).toBe('center')
  expect(await footer.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeLessThan(13)
  const box = await footer.boundingBox()
  if (!box) throw new Error('Footer has no bounds')
  expect(box.y + box.height).toBeLessThanOrEqual(900)
})

test('all nine adjustment sliders update their displayed measurements', async ({ page }) => {
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
    ['Footplate height', '1', '1 cm'],
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
  await expect(page.getByLabel('Footplate height')).toHaveAttribute('min', '1')
  await expect(page.getByLabel('Footplate height')).toHaveAttribute('max', '10')
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
    ['Footplate height', '1'],
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
    ['Footplate height', '10'],
  ]) await page.getByLabel(label).fill(value)
  await expect(page.getByText('12 °', { exact: true })).toBeVisible()
  expect((await viewer.screenshot()).equals(before)).toBe(false)
  await expect(viewer.locator('canvas')).toBeVisible()
})

test('mannequin can be shown, hidden, and returns after unfolding', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  const hidden = await viewer.screenshot()
  await page.getByRole('button', { name: 'Show mannequin' }).click()
  const visible = await viewer.screenshot()
  expect(visible.equals(hidden)).toBe(false)
  await page.getByRole('button', { name: 'Hide mannequin' }).click()
  await expect.poll(async () => (await viewer.screenshot()).equals(hidden)).toBe(true)
  await page.getByRole('button', { name: 'Show mannequin' }).click()
  await page.getByRole('button', { name: 'Fold', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Unfold' })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Hide mannequin' })).toBeDisabled()
  await page.getByRole('button', { name: 'Unfold' }).click()
  await expect(page.getByRole('button', { name: 'Fold', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Hide mannequin' })).toBeEnabled()
  expect((await viewer.screenshot()).equals(hidden)).toBe(false)
})

test('backrest folds and unfolds while adjustments are disabled', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  await page.getByLabel('Backrest angle to seat').fill('100')
  const before = await viewer.screenshot()
  await page.getByRole('button', { name: 'Fold', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Folding…' })).toBeDisabled()
  await expect(page.locator('.controls input:disabled')).toHaveCount(9)
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
  await expect(page.locator('.controls input:disabled')).toHaveCount(9)
  await expect(page.getByRole('button', { name: 'Fold', exact: true })).toBeEnabled()
  await expect(page.locator('.controls input:disabled')).toHaveCount(0)
  await expect(page.getByText('100 °', { exact: true })).toBeVisible()
  expect((await viewer.screenshot()).equals(folded)).toBe(false)
})

test('extreme backrests fold and unfold without losing the rendered chair', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const settings of [
    { width: '33', depth: '36', camber: '6', axle: '0', angle: '110', seatAngle: '12' },
    { width: '46', depth: '46', camber: '-4', axle: '12', angle: '80', seatAngle: '0' },
  ]) {
    await page.goto('/')
    await page.getByLabel('Seat width').fill(settings.width)
    await page.getByLabel('Seat depth').fill(settings.depth)
    await page.getByLabel('Rear-wheel camber').fill(settings.camber)
    await page.getByLabel('Rear axle position').fill(settings.axle)
    await page.getByLabel('Backrest height').fill('45')
    await page.getByLabel('Backrest angle to seat').fill(settings.angle)
    await page.getByLabel('Seat angle to ground').fill(settings.seatAngle)
    const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
    const open = await viewer.screenshot()
    await page.getByRole('button', { name: 'Fold', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Unfold' })).toBeEnabled()
    expect((await viewer.screenshot()).equals(open)).toBe(false)
    await page.getByRole('button', { name: 'Unfold' }).click()
    await expect(page.getByRole('button', { name: 'Fold', exact: true })).toBeEnabled()
    await expect(viewer.locator('canvas')).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('reset configuration cancels folding and restores defaults without moving the camera', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  const box = await viewer.locator('canvas').boundingBox()
  if (!box) throw new Error('3D viewer has no bounds')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 130, box.y + box.height / 2, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(500)
  const rotatedDefault = await viewer.screenshot()
  await page.getByLabel('Seat width').fill('46')
  await page.getByLabel('Footplate slope').fill('15')
  await page.getByLabel('Footplate height').fill('1')
  await page.getByRole('button', { name: 'Fold', exact: true }).click()
  await page.getByRole('button', { name: 'Reset configuration' }).click()
  await expect(page.getByLabel('Seat width')).toHaveValue('39')
  await expect(page.getByLabel('Footplate slope')).toHaveValue('0')
  await expect(page.getByLabel('Footplate height')).toHaveValue('7')
  await expect(page.getByRole('button', { name: 'Fold', exact: true })).toBeEnabled()
  await expect(page.locator('.controls input:disabled')).toHaveCount(0)
  await expect.poll(async () => (await viewer.screenshot()).equals(rotatedDefault)).toBe(true)
  await page.getByRole('button', { name: 'Fold', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Unfold' })).toBeEnabled()
  await page.getByRole('button', { name: 'Reset configuration' }).click()
  await expect(page.getByRole('button', { name: 'Fold', exact: true })).toBeEnabled()
  await expect(page.locator('.controls input:disabled')).toHaveCount(0)
})

test('reset view restores the starting camera without changing the adjustments', async ({ page }) => {
  await page.goto('/')
  const viewer = page.getByRole('region', { name: '3D wheelchair viewer' })
  await page.getByLabel('Seat width').fill('46')
  const initialView = await viewer.screenshot()
  const box = await viewer.locator('canvas').boundingBox()
  if (!box) throw new Error('3D viewer has no bounds')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 130, box.y + box.height / 2, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(500)
  expect((await viewer.screenshot()).equals(initialView)).toBe(false)
  await page.getByRole('button', { name: 'Reset view' }).click()
  await expect(page.getByLabel('Seat width')).toHaveValue('46')
  await expect.poll(async () => (await viewer.screenshot()).equals(initialView)).toBe(true)
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

test('ground plane has a visible horizon and position grid', async ({ page }) => {
  await page.goto('/')
  const screenshot = await page.getByRole('region', { name: '3D wheelchair viewer' }).screenshot()
  const contrast = await page.evaluate(async image => {
    const bitmap = await createImageBitmap(await (await fetch(image)).blob())
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')!
    context.drawImage(bitmap, 0, 0)
    const ground = context.getImageData(60, Math.floor(bitmap.height * 0.8), 130, 1).data
    const values = Array.from({ length: 130 }, (_, index) => ground[index * 4])
    const sky = context.getImageData(60, 40, 1, 1).data[0]
    return { horizon: Math.abs(sky - values[0]), grid: Math.max(...values) - Math.min(...values) }
  }, `data:image/png;base64,${screenshot.toString('base64')}`)
  expect(contrast.horizon).toBeGreaterThan(15)
  expect(contrast.grid).toBeGreaterThan(30)
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
