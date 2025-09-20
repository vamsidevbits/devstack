import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import Base64Tool from './Base64Tool'

describe('Base64Tool', () => {
  const testData = {
    original: 'Hello World!',
    encoded: 'SGVsbG8gV29ybGQh'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Base64Tool />)
    
    expect(screen.getByText('Base64 Encoder/Decoder')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter text to encode...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Base64 encoded result will appear here...')).toBeInTheDocument()
  })

  it('encodes text to base64', async () => {
    render(<Base64Tool />)
    
    const textInput = screen.getByPlaceholderText('Enter text to encode...')
    const base64Output = screen.getByPlaceholderText('Base64 encoded result will appear here...')
    
    fireEvent.change(textInput, { target: { value: testData.original } })
    
    await waitFor(() => {
      expect(base64Output.value).toBe(testData.encoded)
    })
  })

  it('switches to decode mode and decodes base64', async () => {
    render(<Base64Tool />)
    
    // Switch to decode mode
    const switchButton = screen.getByText('Switch Mode')
    fireEvent.click(switchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Mode: Decode')).toBeInTheDocument()
    })
    
    const base64Input = screen.getByPlaceholderText('Enter Base64 string to decode...')
    const textOutput = screen.getByPlaceholderText('Decoded text will appear here...')
    
    fireEvent.change(base64Input, { target: { value: testData.encoded } })
    
    await waitFor(() => {
      expect(textOutput.value).toBe(testData.original)
    })
  })

  it('handles invalid base64 input gracefully', async () => {
    render(<Base64Tool />)
    
    // Switch to decode mode
    const switchButton = screen.getByText('Switch Mode')
    fireEvent.click(switchButton)
    
    const base64Input = screen.getByPlaceholderText('Enter Base64 string to decode...')
    
    fireEvent.change(base64Input, { target: { value: 'invalid base64!' } })
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid Base64 string/)).toBeInTheDocument()
    })
  })

  it('copies output to clipboard', async () => {
    render(<Base64Tool />)
    
    const textInput = screen.getByPlaceholderText('Enter text to encode...')
    fireEvent.change(textInput, { target: { value: testData.original } })
    
    await waitFor(() => {
      const copyButton = screen.getByText('Copy')
      expect(copyButton).toBeInTheDocument()
      fireEvent.click(copyButton)
    })
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testData.encoded)
    
    await waitFor(() => {
      expect(screen.getByText('✓ Copied to clipboard!')).toBeInTheDocument()
    })
  })

  it('clears all input and output', async () => {
    render(<Base64Tool />)
    
    const textInput = screen.getByPlaceholderText('Enter text to encode...')
    const base64Output = screen.getByPlaceholderText('Base64 encoded result will appear here...')
    
    fireEvent.change(textInput, { target: { value: testData.original } })
    
    await waitFor(() => {
      expect(base64Output.value).toBe(testData.encoded)
    })
    
    const clearButton = screen.getByText('Clear All')
    fireEvent.click(clearButton)
    
    expect(textInput.value).toBe('')
    expect(base64Output.value).toBe('')
  })
})
