import { render, screen } from '@/lib/test-utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default styling', () => {
      render(<Card data-testid="card">Card content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow')
    })

    it('applies custom className', () => {
      render(<Card className="custom-card" data-testid="card">Content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card')
    })

    it('forwards props correctly', () => {
      render(<Card data-custom="value" data-testid="card">Content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-custom', 'value')
    })
  })

  describe('CardHeader', () => {
    it('renders with correct styling', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>)
      
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })
  })

  describe('CardTitle', () => {
    it('renders as h3 by default', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Card Title')
    })

    it('applies correct styling', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('font-semibold', 'leading-none', 'tracking-tight')
    })

    it('can render as different element', () => {
      render(<CardTitle as="h1">Title as H1</CardTitle>)
      
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toBeInTheDocument()
    })
  })

  describe('CardDescription', () => {
    it('renders with correct styling', () => {
      render(<CardDescription data-testid="description">Description text</CardDescription>)
      
      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
      expect(description).toHaveTextContent('Description text')
    })
  })

  describe('CardContent', () => {
    it('renders with correct padding', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6', 'pt-0')
    })
  })

  describe('CardFooter', () => {
    it('renders with flex layout', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>)
      
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })
  })

  describe('Complete Card', () => {
    it('renders a complete card structure correctly', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /test card/i })).toBeInTheDocument()
      expect(screen.getByText('This is a test card description')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
    })

    it('maintains proper semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Semantic Card</CardTitle>
            <CardDescription>Proper structure</CardDescription>
          </CardHeader>
          <CardContent>
            Content
          </CardContent>
        </Card>
      )
      
      // Check that header comes before content in the DOM
      const title = screen.getByRole('heading')
      const description = screen.getByText('Proper structure')
      const content = screen.getByText('Content')
      
      expect(title.compareDocumentPosition(content)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
      expect(description.compareDocumentPosition(content)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })
  })

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <Card aria-label="Test card" role="article">
          <CardTitle>Accessible Card</CardTitle>
        </Card>
      )
      
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-label', 'Test card')
    })

    it('maintains heading hierarchy', () => {
      render(
        <div>
          <h1>Main Title</h1>
          <Card>
            <CardTitle>Card Title</CardTitle>
          </Card>
        </div>
      )
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })
  })
})