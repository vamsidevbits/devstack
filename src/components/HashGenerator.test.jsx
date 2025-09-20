import { render, screen } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import HashGenerator from './HashGenerator'

describe('HashGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<HashGenerator />)
    
    expect(screen.getByText('Hash Generator')).toBeInTheDocument()
    expect(screen.getByText('Generate multiple hash values and encodings from text or files')).toBeInTheDocument()
  })

  it('renders hash input area', () => {
    render(<HashGenerator />)
    
    const textAreas = document.querySelectorAll('textarea')
    expect(textAreas.length).toBeGreaterThan(0)
  })

  it('renders action buttons', () => {
    render(<HashGenerator />)
    
    expect(screen.getByText('Clear')).toBeInTheDocument()
    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })

  it('shows security notice', () => {
    render(<HashGenerator />)
    
    expect(screen.getByText('🔒 Security Notice')).toBeInTheDocument()
  })
})
