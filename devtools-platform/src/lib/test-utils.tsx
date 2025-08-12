import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialTheme?: 'light' | 'dark' | 'system'
}

const AllTheProviders = ({ 
  children, 
  initialTheme = 'light' 
}: { 
  children: React.ReactNode
  initialTheme?: 'light' | 'dark' | 'system'
}) => {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme={initialTheme}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialTheme, ...renderOptions } = options
  
  return render(ui, {
    wrapper: (props) => <AllTheProviders initialTheme={initialTheme} {...props} />,
    ...renderOptions,
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }

// Custom matchers and helpers
export const createMockComponent = (name: string) => {
  const MockComponent = (props: any) => (
    <div data-testid={`mock-${name.toLowerCase()}`} {...props} />
  )
  MockComponent.displayName = `Mock${name}`
  return MockComponent
}

// Mock user event helpers
export const mockUserEvent = {
  click: jest.fn(),
  type: jest.fn(),
  clear: jest.fn(),
  selectOptions: jest.fn(),
  upload: jest.fn(),
}

// Common test utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.IntersectionObserver = mockIntersectionObserver
  return mockIntersectionObserver
}

export const createMockResizeObserver = () => {
  const mockResizeObserver = jest.fn()
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.ResizeObserver = mockResizeObserver
  return mockResizeObserver
}

// Local storage mock helpers
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  }
}

// Fetch mock helpers
export const createMockFetch = () => {
  return jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: '',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
    })
  )
}

// Common assertions
export const expectElementToHaveAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAttribute('aria-label', name)
}

export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

export const expectElementToHaveFocus = (element: HTMLElement) => {
  expect(element).toHaveFocus()
}