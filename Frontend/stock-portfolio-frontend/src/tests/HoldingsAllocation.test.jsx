import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HoldingsAllocation from "../components/portfolio/HoldingsAllocation";

describe('Holdings Allocation', () => {

    it('renders loading skeleton when loading is true', () => {
    render(<HoldingsAllocation holdingsAllocation={[]} loading={true} />)
    expect(screen.getByText('Holdings Allocation')).toBeInTheDocument()

    // Check for skeleton loader divs by class
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
    })

     it('renders holdings correctly with mock data', () => {
    const mockData = [
      {
        stockSymbol: 'AAPL',
        stockName: 'Apple Inc',
        quantity: 10,
        currentPrice: 150,
        value: 1500,
        percentage: 50,
      },
      {
        stockSymbol: 'TSLA',
        stockName: 'Tesla Inc',
        quantity: 5,
        currentPrice: 200,
        value: 1000,
        percentage: 33.3,
      },
    ]

    render(<HoldingsAllocation holdingsAllocation={mockData} loading={false} />)

    // Check stock symbols and names
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc')).toBeInTheDocument()
    expect(screen.getByText('TSLA')).toBeInTheDocument()
    expect(screen.getByText('Tesla Inc')).toBeInTheDocument()

    // Check quantity, percentage, price, and value
    expect(screen.getByText('10 shares')).toBeInTheDocument()
    expect(screen.getByText('50.0%')).toBeInTheDocument()
    expect(screen.getByText('Price: $150.00')).toBeInTheDocument()
    expect(screen.getByText('Value: $1500.00')).toBeInTheDocument()

    expect(screen.getByText('5 shares')).toBeInTheDocument()
    expect(screen.getByText('33.3%')).toBeInTheDocument()
    expect(screen.getByText('Price: $200.00')).toBeInTheDocument()
    expect(screen.getByText('Value: $1000.00')).toBeInTheDocument()

    // Check that progress bars exist
    const progressBars = document.querySelectorAll('.bg-blue-600')
    expect(progressBars.length).toBe(mockData.length)
    
    // Optional: check progress bar width
    expect(progressBars[0].style.width).toBe('50%')
    expect(progressBars[1].style.width).toBe('33.3%')
  })

  it('caps progress bar width at 100%', () => {
    const mockData = [
      {
        stockSymbol: 'GOOG',
        stockName: 'Alphabet',
        quantity: 1,
        currentPrice: 2000,
        value: 2000,
        percentage: 150, // >100%
      },
    ]

    render(<HoldingsAllocation holdingsAllocation={mockData} loading={false} />)

    const progressBar = document.querySelector('.bg-blue-600')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar.style.width).toBe('100%') // capped at 100
    })
})