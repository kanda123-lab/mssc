import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main title and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'DevTools Platform' })).toBeVisible()
    await expect(page.getByText('Your all-in-one development toolkit')).toBeVisible()
  })

  test('should show all tool categories', async ({ page }) => {
    // Check for category headers
    await expect(page.getByRole('heading', { name: 'API Tools' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Data Tools' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Database Tools' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Development Tools' })).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    // Click on JSON Formatter tool
    await page.getByText('JSON Formatter').click()
    await expect(page).toHaveURL('/tools/json-formatter')
    
    // Go back to homepage
    await page.goto('/')
    
    // Click on API Tester tool
    await page.getByText('API Tester').click()
    await expect(page).toHaveURL('/tools/api-tester')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByRole('heading', { name: 'DevTools Platform' })).toBeVisible()
    
    // Check that tools are still accessible on mobile
    await expect(page.getByText('JSON Formatter')).toBeVisible()
    await expect(page.getByText('API Tester')).toBeVisible()
  })

  test('should have platform features section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Platform Features' })).toBeVisible()
    
    // Check for feature categories
    await expect(page.getByText('Data & Storage')).toBeVisible()
    await expect(page.getByText('User Experience')).toBeVisible()
    await expect(page.getByText('Developer Tools')).toBeVisible()
    
    // Check for specific features
    await expect(page.getByText('Local storage for persistence')).toBeVisible()
    await expect(page.getByText('Dark/light theme support')).toBeVisible()
    await expect(page.getByText('API testing & debugging')).toBeVisible()
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await expect(page).toHaveTitle(/DevTools Platform/)
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /development toolkit/)
  })

  test('should load without accessibility violations', async ({ page }) => {
    // Basic accessibility checks
    await expect(page.getByRole('main')).toBeVisible()
    
    // Check for proper heading structure
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toHaveCount(1)
    
    // Check that all links have accessible names
    const links = page.getByRole('link')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const accessibleName = await link.getAttribute('aria-label') || await link.textContent()
      expect(accessibleName).toBeTruthy()
    }
  })

  test('should have working theme toggle', async ({ page }) => {
    // Look for theme toggle button (if implemented)
    const themeToggle = page.getByRole('button', { name: /theme/i }).first()
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      
      // Check that theme class changes on html or body
      const html = page.locator('html')
      const bodyClass = await page.locator('body').getAttribute('class')
      const htmlClass = await html.getAttribute('class')
      
      expect(bodyClass || htmlClass).toContain('dark')
    }
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    
    // First focusable element should be focused
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Test that we can navigate through multiple elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    const secondFocusedElement = page.locator(':focus')
    await expect(secondFocusedElement).toBeVisible()
  })
})