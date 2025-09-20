import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import JSONLint from './JSONLint'

describe('JSONLint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<JSONLint />)
    
    expect(screen.getByText('JSON Formatter & Validator')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
    expect(screen.getByText('Load Sample')).toBeInTheDocument()
    expect(screen.getByText('Minify')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('formats valid JSON', async () => {
    render(<JSONLint />)
    
    const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
    const minifiedJson = '{"name":"John","age":30,"city":"New York"}'
    
    fireEvent.change(inputArea, { target: { value: minifiedJson } })
    
    await waitFor(() => {
      const outputArea = screen.getByPlaceholderText('Formatted JSON will appear here...')
      expect(outputArea.value).toContain('"name"')
    })
  })

  it('clears input and output', () => {
    render(<JSONLint />)
    
    const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
    const clearButton = screen.getByText('Clear')
    
    fireEvent.change(inputArea, { target: { value: '{"test": "value"}' } })
    fireEvent.click(clearButton)
    
    expect(inputArea.value).toBe('')
  })

  it('loads sample JSON', async () => {
    render(<JSONLint />)
    
    const loadSampleButton = screen.getByText('Load Sample')
    fireEvent.click(loadSampleButton)
    
    await waitFor(() => {
      const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
      expect(inputArea.value).toBeTruthy()
      expect(inputArea.value).toContain('{')
    })
  })

  it('shows minify button when input has content', async () => {
    render(<JSONLint />)
    
    const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
    const minifyButton = screen.getByText('Minify')
    
    fireEvent.change(inputArea, { target: { value: '{"test": "value"}' } })
    
    await waitFor(() => {
      expect(minifyButton).not.toHaveAttribute('disabled')
    })
  })
})
