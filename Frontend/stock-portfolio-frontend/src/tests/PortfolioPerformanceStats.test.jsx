import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PortfolioPerformanceStats from "../components/dashboard/PortfolioPerformanceStats";

describe('Portfolio Performance Stats', () => {
    it('should load with correct data', ()=>{
        render(<PortfolioPerformanceStats stats={{totalPortfolios: 3}} totalStats={{totalValue: 1230, totalCapital: 30, totalGainLoss: 90, totalGainLossPercent:90, }} loading= {false}/>)
        expect(screen.getByText('$1,230.00')).toBeInTheDocument()
        expect(screen.getByText('$30.00')).toBeInTheDocument()
        expect(screen.getByText('$90.00')).toBeInTheDocument()
    })
})