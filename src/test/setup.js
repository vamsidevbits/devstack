import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock window.matchMedia for dark mode tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve(''))
  }
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ onChange, onMount }) => {
    // Simulate editor behavior
    const mockEditor = {
      updateOptions: vi.fn(),
      getValue: vi.fn(() => ''),
      setValue: vi.fn()
    }
    const mockMonaco = {}
    
    if (onMount) {
      setTimeout(() => onMount(mockEditor, mockMonaco), 0)
    }
    
    return React.createElement('div', { 
      'data-testid': 'monaco-editor',
      onChange: (value) => onChange && onChange(value)
    })
  })
}))

// Mock react-split
vi.mock('react-split', () => ({
  default: vi.fn(({ children }) => 
    React.createElement('div', { 'data-testid': 'split-pane' }, children)
  )
}))
