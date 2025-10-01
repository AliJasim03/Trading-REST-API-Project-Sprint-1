import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PortfolioSummary from "../components/dashboard/PortfolioSummary";

describe("Portfolio Summary", () => {
    it("should with given data", () => {
        render(<PortfolioSummary portfolioSummary={[{name:"Test Portfolio",id:10, totalValue:12345, availableCapital: 500000, totalCapital: 600000, holdingsCount: 45}]} />);
        expect(screen.getByText("Test Portfolio")).toBeInTheDocument();
        expect(screen.getByText("ID: 10")).toBeInTheDocument();
        expect(screen.getByText("$12,345.00")).toBeInTheDocument();
        expect(screen.getByText("$500,000.00")).toBeInTheDocument();
        expect(screen.getByText("$600,000.00")).toBeInTheDocument();
    })
})