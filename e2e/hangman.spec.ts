import { expect, test } from '@playwright/test'

test('complete game flow uses the shared keyboard path', async ({ page }) => {
  await page.goto('/?answer=Cat')
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.getByText('Misses 0/6')).toBeVisible()
  await page.keyboard.press('c')
  await expect(page.getByRole('button', { name: /C: correct/ })).toBeDisabled()
  await page.getByRole('button', { name: 'New Game' }).click()
  await page.getByRole('button', { name: 'No' }).click()
  await expect(page.getByRole('button', { name: /C: correct/ })).toBeVisible()
  await page.keyboard.press('a')
  await page.keyboard.press('t')
  await expect(page.getByRole('heading', { name: 'You won!' })).toBeVisible()
  await page.getByRole('button', { name: 'Play Again' }).click()
  await page.getByRole('button', { name: 'Q' }).click()
  await expect(page.getByText('Misses 1/6')).toBeVisible()
  await page.getByRole('button', { name: 'Home' }).click()
  await expect(page.getByRole('heading', { name: 'Hangman' })).toBeVisible()
})

test('mobile game layout stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?answer=Roller%20Coaster')
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.getByRole('button', { name: 'Q' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(844)
})
