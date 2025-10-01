import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortfolioSelector from "../components/portfolio/PortfolioSelector"; 

describe('Portfolio Selector', () => {

    const mockPortfolios = [
    { portfolioId: '1', portfolioName: 'Test Portfolio 1', initialCapital: 1000 },
    { portfolioId: '2', portfolioName: 'Portfolio 2', initialCapital: 2000 },
  ]

    it('should load when loading the data', ()=>{
        render(<PortfolioSelector loading ={true}/>);
        expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    })
    it('should display error if one appears',  ()=>{
        render(<PortfolioSelector error={'error'} loading= {false}/>);
        expect(screen.getByText('Error loading portfolios')).toBeInTheDocument();
    })
    it('should trigger refresh when refresh button is clicked', async ()=>{
        const onRefresh = vi.fn();
        const user = userEvent.setup();
        render(<PortfolioSelector onRefresh={onRefresh} loading= {false} error={true}/>);

        user.click(screen.getByRole('button', { children: /refresh/i }));
        await waitFor(() => expect(onRefresh).toHaveBeenCalled());

    })
    it('should display the data if loading is complete',  ()=>{
         render(<PortfolioSelector
        portfolios={mockPortfolios}
        selectedPortfolio={null}
        onPortfolioSelect={() => {}}
        loading={false}
        error={false}
        onRefresh={() => {}}
      />)
        const button1 = screen.getByRole('button', {name: /Portfolio 1/i})
        const button2 = screen.getByRole('button', {name: /Portfolio 2/i})
        expect(button1).toBeInTheDocument()
        expect(button2).toBeInTheDocument()
        expect(screen.getByText('ID: 1')).toBeInTheDocument()
        expect(screen.getByText('ID: 2')).toBeInTheDocument()
        expect(screen.getByText('Capital: $1000.00')).toBeInTheDocument()
        expect(screen.getByText('Capital: $2000.00')).toBeInTheDocument()
    })
    it('should render the empty portfolio message', ()=>{
        render(<PortfolioSelector
            portfolios={[]}
            selectedPortfolio={null}
            onPortfolioSelect={() => {}}
            loading={false}
            error={false}
            onRefresh={() => {}}
          />)
        expect(screen.getByText('No portfolios found')).toBeInTheDocument()
    })
    it('should resolve after the click of the button',async  ()=>{
        const onPortfolioSelect = vi.fn();
        const user = userEvent.setup();
        render(<PortfolioSelector
            portfolios={mockPortfolios}
            selectedPortfolio={null}
            onPortfolioSelect={onPortfolioSelect}
            loading={false}
            error={false}
            onRefresh={() => {}}
          />)
        const button1 = screen.getByRole('button', {name: /Portfolio 1/i})
        await user.click(button1)
        expect(onPortfolioSelect).toHaveBeenCalledWith(mockPortfolios[0])
    })
})