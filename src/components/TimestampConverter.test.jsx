import { render, screen } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import TimestampConverter from './TimestampConverter'

describe('TimestampConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<TimestampConverter />)
    
    // Use getAllByText for the title since it appears twice
    const titles = screen.getAllByText('Timestamp Converter')
    expect(titles.length).toBeGreaterThan(0)
    expect(screen.getByText('Convert between Unix timestamps and human-readable dates')).toBeInTheDocument()
  })

  it('renders timestamp inputs', () => {
    render(<TimestampConverter />)
    
    // Use getAllByText since these appear multiple times
    const unixTimestampElements = screen.getAllByText('Unix Timestamp')
    const humanReadableElements = screen.getAllByText('Human Readable')
    expect(unixTimestampElements.length).toBeGreaterThan(0)
    expect(humanReadableElements.length).toBeGreaterThan(0)
  })

  it('renders action buttons', () => {
    render(<TimestampConverter />)
    
    expect(screen.getByText('Current Time')).toBeInTheDocument()
  })

  it('displays timestamp inputs', () => {
    render(<TimestampConverter />)
    
    const inputs = document.querySelectorAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
