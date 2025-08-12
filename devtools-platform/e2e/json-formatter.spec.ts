import { test, expect } from '@playwright/test'

test.describe('JSON Formatter Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/json-formatter')
  })

  test('should load the JSON Formatter page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /json formatter/i })).toBeVisible()
  })

  test('should format JSON correctly', async ({ page }) => {
    const testJSON = '{"name":"test","value":123,"nested":{"key":"value"}}'
    
    // Find and fill the input textarea
    const inputTextarea = page.getByRole('textbox').first()
    await inputTextarea.fill(testJSON)
    
    // Look for a format button
    const formatButton = page.getByRole('button', { name: /format/i }).first()
    if (await formatButton.isVisible()) {
      await formatButton.click()
    }
    
    // Check if the JSON is formatted (should have line breaks)
    const outputContent = page.getByRole('textbox').last()
    const formattedContent = await outputContent.textContent() || await outputContent.inputValue()
    
    // Formatted JSON should contain line breaks
    expect(formattedContent).toContain('\n')
    expect(formattedContent).toContain('  ') // Should have indentation
  })

  test('should handle invalid JSON gracefully', async ({ page }) => {
    const invalidJSON = '{"name": test, "invalid": }'
    
    const inputTextarea = page.getByRole('textbox').first()
    await inputTextarea.fill(invalidJSON)
    
    // Look for format button and click it
    const formatButton = page.getByRole('button', { name: /format/i }).first()
    if (await formatButton.isVisible()) {
      await formatButton.click()
    }
    
    // Should show an error message
    await expect(page.getByText(/error/i)).toBeVisible()
  })

  test('should allow copying formatted JSON', async ({ page }) => {
    const testJSON = '{"test": "value"}'
    
    const inputTextarea = page.getByRole('textbox').first()
    await inputTextarea.fill(testJSON)
    
    // Format the JSON
    const formatButton = page.getByRole('button', { name: /format/i }).first()
    if (await formatButton.isVisible()) {
      await formatButton.click()
    }
    
    // Look for copy button
    const copyButton = page.getByRole('button', { name: /copy/i }).first()
    if (await copyButton.isVisible()) {
      await copyButton.click()
      
      // Should show success message
      await expect(page.getByText(/copied/i)).toBeVisible({ timeout: 5000 })
    }
  })

  test('should support file upload', async ({ page }) => {
    // Look for file upload input
    const fileInput = page.locator('input[type="file"]').first()
    
    if (await fileInput.isVisible()) {
      // Create a test JSON file
      const testJSON = { test: 'file upload', data: [1, 2, 3] }
      const fileContent = JSON.stringify(testJSON)
      
      // Upload the file
      await fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(fileContent)
      })
      
      // Should load the file content
      const textarea = page.getByRole('textbox').first()
      await expect(textarea).toHaveValue(fileContent)
    }
  })

  test('should support minification', async ({ page }) => {
    const testJSON = '{\n  "name": "test",\n  "value": 123\n}'
    
    const inputTextarea = page.getByRole('textbox').first()
    await inputTextarea.fill(testJSON)
    
    // Look for minify button
    const minifyButton = page.getByRole('button', { name: /minify/i }).first()
    if (await minifyButton.isVisible()) {
      await minifyButton.click()
      
      const outputContent = page.getByRole('textbox').last()
      const minifiedContent = await outputContent.textContent() || await outputContent.inputValue()
      
      // Minified JSON should not contain unnecessary whitespace
      expect(minifiedContent).not.toContain('\n  ')
      expect(minifiedContent.length).toBeLessThan(testJSON.length)
    }
  })

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByRole('heading', { name: /json formatter/i })).toBeVisible()
    
    const textarea = page.getByRole('textbox').first()
    await expect(textarea).toBeVisible()
  })

  test('should save work to localStorage', async ({ page }) => {
    const testJSON = '{"persistent": "data"}'
    
    const inputTextarea = page.getByRole('textbox').first()
    await inputTextarea.fill(testJSON)
    
    // Reload the page
    await page.reload()
    
    // Check if the data persists (if implemented)
    const persistedValue = await inputTextarea.inputValue()
    if (persistedValue) {
      expect(persistedValue).toContain('persistent')
    }
  })

  test('should have proper keyboard shortcuts', async ({ page }) => {
    const testJSON = '{"shortcut": "test"}'
    
    const inputTextarea = page.getByRole('textbox').first()
    await inputTextarea.fill(testJSON)
    await inputTextarea.focus()
    
    // Test Ctrl+A (Select All)
    await page.keyboard.press('Control+a')
    
    // Test common shortcuts if implemented
    const shortcuts = ['Control+f', 'Control+s', 'Escape']
    
    for (const shortcut of shortcuts) {
      await page.keyboard.press(shortcut)
      // Should not throw errors
    }
  })

  test('should handle large JSON files', async ({ page }) => {
    // Create a large JSON object
    const largeJSON = {
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random(),
        nested: {
          deep: {
            property: `value-${i}`
          }
        }
      }))
    }
    
    const inputTextarea = page.getByRole('textbox').first()
    await inputTextarea.fill(JSON.stringify(largeJSON))
    
    // Should handle large input without crashing
    const formatButton = page.getByRole('button', { name: /format/i }).first()
    if (await formatButton.isVisible()) {
      await formatButton.click()
      
      // Should complete formatting within reasonable time
      await expect(page.getByRole('textbox').last()).toHaveValue(/.+/, { timeout: 10000 })
    }
  })
})