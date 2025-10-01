import {describe, it, expect, vi} from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from 'react-router-dom'
import Navigation from "../components/ui/Navigation";
import { ThemeProvider } from '../context/ThemeContext'


describe('Navigation', () => {
    beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, 
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })})
    it('renders the navigation bar and links', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Navigation />
        </ThemeProvider>
      </MemoryRouter>
    )
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Portfolios/i)).toBeInTheDocument()
    expect(screen.getByText(/Live Prices/i)).toBeInTheDocument()
  })

  it('highlights the active link based on location.pathname', () => {
    render(
      <MemoryRouter initialEntries={['/portfolios']}>
        <ThemeProvider>
          <Navigation />
        </ThemeProvider>
      </MemoryRouter>
    )

    const activeLink = screen.getByText(/Portfolios/i)
    expect(activeLink).toHaveClass('bg-primary-50')
  })

  it('toggles theme when the theme button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Navigation />
        </ThemeProvider>
      </MemoryRouter>
    )

    const toggleButton = screen.getAllByRole('button', { name: /toggle dark mode/i })[0]

    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await user.click(toggleButton)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(toggleButton)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})