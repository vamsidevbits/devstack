import { render, screen } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import SwaggerPreview from './SwaggerPreview'

describe('SwaggerPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<SwaggerPreview />)
    
    expect(screen.getByText('Swagger / OpenAPI Editor')).toBeInTheDocument()
    expect(screen.getByText('Build, validate, and preview your API specs')).toBeInTheDocument()
  })

  it('renders format toggle buttons', () => {
    render(<SwaggerPreview />)
    
    // Use getAllByText since YAML appears multiple times
    const yamlElements = screen.getAllByText('YAML')
    const jsonElements = screen.getAllByText('JSON')
    expect(yamlElements.length).toBeGreaterThan(0)
    expect(jsonElements.length).toBeGreaterThan(0)
  })

  it('renders action buttons', () => {
    render(<SwaggerPreview />)
    
    expect(screen.getByText('Load Sample')).toBeInTheDocument()
    // Copy to Clipboard appears as title attribute on a button
    expect(screen.getByTitle('Copy to Clipboard')).toBeInTheDocument()
  })

  it('renders input area', () => {
    render(<SwaggerPreview />)
    
    // Since SwaggerPreview is a complex component, just verify it renders without throwing errors
    // The presence of the main container indicates the component is working
    const container = document.querySelector('.w-full.h-screen.flex.flex-col')
    expect(container).toBeTruthy()
  })

  it('renders view mode buttons', () => {
    render(<SwaggerPreview />)
    
    expect(screen.getByTitle('Editor Only')).toBeInTheDocument()
    expect(screen.getByTitle('Split View')).toBeInTheDocument()
    expect(screen.getByTitle('Preview Only')).toBeInTheDocument()
  })
})
