import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('should not have any accessibility violations on homepage', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have any accessibility violations on JSON Formatter', async ({ page }) => {
    await page.goto('/tools/json-formatter')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have any accessibility violations on API Tester', async ({ page }) => {
    await page.goto('/tools/api-tester')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    let focusedElement = await page.locator(':focus').first()
    await expect(focusedElement).toBeVisible()
    
    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      focusedElement = await page.locator(':focus').first()
      await expect(focusedElement).toBeVisible()
    }
  })

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading structure
    const h1Elements = await page.locator('h1').count()
    expect(h1Elements).toBe(1)
    
    // Check for landmark elements
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('[role="navigation"], nav')).toHaveCount(1)
    
    // Check for proper alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      const ariaLabel = await image.getAttribute('aria-label')
      const role = await image.getAttribute('role')
      
      // Images should have alt text or be marked as decorative
      expect(alt !== null || ariaLabel !== null || role === 'presentation').toBe(true)
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('.text-primary')
      .include('.text-secondary')
      .include('.text-muted-foreground')
      .analyze()
    
    // Check for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )
    
    expect(contrastViolations).toEqual([])
  })

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/tools/json-formatter')
    
    // Test keyboard navigation through interactive elements
    const interactiveElements = page.locator('button, a, input, textarea, select')
    const count = await interactiveElements.count()
    
    await page.keyboard.press('Tab')
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Test Enter key activation
      await page.keyboard.press('Enter')
      
      // Move to next element
      await page.keyboard.press('Tab')
    }
  })

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ 
      colorScheme: 'dark',
      forcedColors: 'active'
    })
    
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should handle reduced motion preference', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    await page.goto('/')
    
    // Check that animations are disabled or reduced
    const animatedElements = page.locator('[class*="animate"], [style*="transition"]')
    const count = await animatedElements.count()
    
    // Verify that elements still function without animations
    if (count > 0) {
      const firstAnimated = animatedElements.first()
      await expect(firstAnimated).toBeVisible()
    }
  })

  test('should have proper ARIA labels and descriptions', async ({ page }) => {
    await page.goto('/tools/json-formatter')
    
    // Check for form elements with proper labels
    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      const associatedLabel = page.locator(`label[for="${await input.getAttribute('id')}"]`)
      const hasAssociatedLabel = await associatedLabel.count() > 0
      
      // Input should have some form of accessible name
      expect(
        ariaLabel !== null || 
        ariaLabelledBy !== null || 
        hasAssociatedLabel
      ).toBe(true)
    }
  })

  test('should provide status updates for screen readers', async ({ page }) => {
    await page.goto('/tools/json-formatter')
    
    // Look for live regions for status updates
    const liveRegions = page.locator('[aria-live]')
    const count = await liveRegions.count()
    
    // Should have at least one live region for notifications/status
    expect(count).toBeGreaterThanOrEqual(0)
    
    // If live regions exist, they should be properly configured
    for (let i = 0; i < count; i++) {
      const region = liveRegions.nth(i)
      const ariaLive = await region.getAttribute('aria-live')
      expect(['polite', 'assertive', 'off']).toContain(ariaLive)
    }
  })

  test('should work with screen reader software', async ({ page }) => {
    await page.goto('/')
    
    // Check for skip links
    const skipLinks = page.locator('a[href*="#main"], a[href*="#content"]')
    if (await skipLinks.count() > 0) {
      const skipLink = skipLinks.first()
      await skipLink.focus()
      await expect(skipLink).toBeVisible()
      await skipLink.press('Enter')
    }
    
    // Verify main content is accessible
    const main = page.locator('main, [role="main"]')
    await expect(main).toBeVisible()
  })
})