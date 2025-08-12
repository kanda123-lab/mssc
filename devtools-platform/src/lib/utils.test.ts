import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'valid')).toBe('base valid')
  })

  it('should handle empty strings', () => {
    expect(cn('base', '', 'valid')).toBe('base valid')
  })

  it('should merge Tailwind classes with conflicts', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle object syntax', () => {
    expect(cn({
      'base': true,
      'conditional': true,
      'hidden': false,
    })).toBe('base conditional')
  })

  it('should handle mixed arguments', () => {
    expect(cn(
      'base',
      ['array1', 'array2'],
      { conditional: true, hidden: false },
      undefined,
      'final'
    )).toBe('base array1 array2 conditional final')
  })
})