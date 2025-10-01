import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PortfolioAnalytics from "../components/portfolio/PortfolioAnalytics";

describe('Portfolio Analytics', () => {
    
    it('should load when loading the data', async ()=>{
        render(<PortfolioAnalytics loading ={true}/>)
        expect( await screen.findAllByText(/Performance Analytics/i)).not.toBe(null);
        const skeletons = document.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should return null if performance is null', ()=>{
        const {container} = render(<PortfolioAnalytics performance={null} loading={false}/>)
        expect(container.firstChild).toBeNull()
    })

    it('should show the data if loading is complete',  ()=>{
        render(<PortfolioAnalytics performance={{currentValue: 120, totalInvested: 30, totalGainLoss: 90}} loading= {false}/>)
        expect(screen.getByText('$120.00')).toBeInTheDocument()
        expect(screen.getByText('$30.00')).toBeInTheDocument()
        expect(screen.getByText('$90.00')).toBeInTheDocument()
        expect(screen.getByText('0.00%')).toBeInTheDocument()
    })
})