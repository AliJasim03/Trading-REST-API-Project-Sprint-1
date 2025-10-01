import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

const TestComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  return (
    <div>
      <span>Mode: {isDarkMode ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe ('Theme Context', () => {
    beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    
    Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false, // or true if you want dark mode
      media: query,
      onchange: null,
      addListener: vi.fn(), // legacy
      removeListener: vi.fn(), // legacy
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })


    })

     it('initializes theme based on localStorage', () => {
    localStorage.setItem('theme', 'dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByText(/Mode: dark/i)).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

    it('toggleTheme switches theme and updates localStorage', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle/i })

    // Default: light
    expect(screen.getByText(/Mode: light/i)).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // Toggle to dark
    await user.click(button)
    expect(screen.getByText(/Mode: dark/i)).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    // Toggle back to light
    await user.click(button)
    expect(screen.getByText(/Mode: light/i)).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('throws error if useTheme is used outside ThemeProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    )
    consoleError.mockRestore()
  })

})