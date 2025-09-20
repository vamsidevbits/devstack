import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import App from './App'

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders main application', () => {
    render(<App />)
    
    expect(screen.getByText('DevStack')).toBeInTheDocument()
    expect(screen.getByText('Stack of developer tools')).toBeInTheDocument()
  })

  it('renders navigation tabs', () => {
    render(<App />)
    
    // Check for navigation tabs using more specific queries
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('JWT')).toBeInTheDocument()
    expect(screen.getByText('Hash')).toBeInTheDocument()
    expect(screen.getByText('UUID')).toBeInTheDocument()
    expect(screen.getByText('Base64')).toBeInTheDocument()
    
    // Use getAllByText to handle multiple JSONLint occurrences
    const jsonLintElements = screen.getAllByText('JSONLint')
    expect(jsonLintElements.length).toBeGreaterThan(0)
    
    expect(screen.getByText('Swagger Preview')).toBeInTheDocument()
  })

  it('switches between different tools', () => {
    render(<App />)
    
    // Click on UUID tab
    const uuidTab = screen.getByText('UUID')
    fireEvent.click(uuidTab)
    
    // Should show UUID Generator
    expect(screen.getByText('UUID Generator')).toBeInTheDocument()
    
    // Click on Base64 tab
    const base64Tab = screen.getByText('Base64')
    fireEvent.click(base64Tab)
    
    // Should show Base64 Tool
    expect(screen.getByText('Base64 Encoder/Decoder')).toBeInTheDocument()
  })

  it('toggles dark mode', () => {
    render(<App />)
    
    // Find dark mode toggle button (it should have either Moon or Sun icon)
    const darkModeButton = screen.getByTitle(/Switch to/)
    expect(darkModeButton).toBeInTheDocument()
    
    fireEvent.click(darkModeButton)
    // After clicking, the theme should change
    // This is a basic test - in a real scenario you might check for class changes
  })

  it('shows home view by default', () => {
    render(<App />)
    
    expect(screen.getByText('Welcome to DevStack')).toBeInTheDocument()
    expect(screen.getByText(/Your complete stack of essential developer utilities/)).toBeInTheDocument()
  })
})
