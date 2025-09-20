import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import UUIDGenerator from './UUIDGenerator'

describe('UUIDGenerator', () => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<UUIDGenerator />)
    
    expect(screen.getByText('UUID Generator')).toBeInTheDocument()
    expect(screen.getByText('Generate random UUIDs (Universally Unique Identifiers) version 4')).toBeInTheDocument()
    
    // Check that a UUID is displayed - use CSS selector to avoid matching the example UUID
    const uuidDisplay = document.querySelector('.font-mono.text-lg')
    expect(uuidDisplay).toBeInTheDocument()
    expect(uuidDisplay.textContent).toMatch(uuidPattern)
  })

  it('generates valid UUID v4', () => {
    render(<UUIDGenerator />)
    
    const uuidDisplay = document.querySelector('.font-mono.text-lg')
    expect(uuidDisplay.textContent).toMatch(uuidPattern)
  })

  it('generates new UUID when generate button is clicked', async () => {
    render(<UUIDGenerator />)
    
    const uuidDisplay = document.querySelector('.font-mono.text-lg')
    const initialUUID = uuidDisplay.textContent
    
    const generateButton = screen.getByText('Generate New')
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      const newUUID = uuidDisplay.textContent
      expect(newUUID).not.toBe(initialUUID)
      expect(newUUID).toMatch(uuidPattern)
    })
  })

  it('copies UUID to clipboard', async () => {
    render(<UUIDGenerator />)
    
    const uuidDisplay = document.querySelector('.font-mono.text-lg')
    const uuid = uuidDisplay.textContent
    
    const copyButton = screen.getByRole('button', { name: /copy to clipboard/i })
    fireEvent.click(copyButton)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(uuid)
  })

  it('generates multiple unique UUIDs', async () => {
    render(<UUIDGenerator />)
    
    const generateButton = screen.getByText('Generate New')
    const uuidDisplay = document.querySelector('.font-mono.text-lg')
    const uuids = new Set()
    
    // Generate 10 UUIDs and ensure they're all unique
    for (let i = 0; i < 10; i++) {
      fireEvent.click(generateButton)
      await waitFor(() => {
        const uuid = uuidDisplay.textContent
        expect(uuid).toMatch(uuidPattern)
        uuids.add(uuid)
      })
    }
    
    expect(uuids.size).toBe(10) // All UUIDs should be unique
  })

  it('UUID has correct version (v4)', () => {
    render(<UUIDGenerator />)
    
    const uuidDisplay = document.querySelector('.font-mono.text-lg')
    const uuid = uuidDisplay.textContent
    
    // Version 4 UUIDs have '4' in the third section
    const sections = uuid.split('-')
    expect(sections[2][0]).toBe('4')
  })

  it('UUID has correct variant bits', () => {
    render(<UUIDGenerator />)
    
    const uuidDisplay = document.querySelector('.font-mono.text-lg')
    const uuid = uuidDisplay.textContent
    
    // Variant bits in UUID v4 should be '8', '9', 'a', or 'b'
    const sections = uuid.split('-')
    const variantChar = sections[3][0].toLowerCase()
    expect(['8', '9', 'a', 'b']).toContain(variantChar)
  })
})
