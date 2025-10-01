import {describe, it, expect, vi, afterEach} from "vitest";
import userEvent from "@testing-library/user-event";
import TradingHistory from "../components/portfolio/TradingHistory";
import {render, screen} from "@testing-library/react";

describe("TradingHistory", () => {
    it("should render the trading history", () => {
        render(<TradingHistory loading = {true}/>);
        const tradingHistory = document.querySelector('.animate-pulse');
        expect(screen.getByText('Trading History')).toBeInTheDocument();    
        expect(tradingHistory).toBeInTheDocument();
    });
    it("should render the empty dataset message", () => {
        render(<TradingHistory loading = {false}/>);
        const tradingHistory = document.querySelector('.animate-pulse');
        expect(screen.getByText('No trading history found')).toBeInTheDocument();    
        expect(tradingHistory).not.toBeInTheDocument();
    })
    it('should display the table with mock data', ()=>{
        render(<TradingHistory loading={false} tradingHistory={[
            {
                orderId: 1,
                stock:{
                    stockTicker: 'AAPL',
                    stockName: 'Apple Inc'
                },
                buy_or_sell: 'BUY',
                volume: 10,
                price: 150,
                status_code: 0,
                createdAt: '2022-01-01',
            },
            {
                orderId: 2,
                stock:{
                    stockTicker: 'TSLA',
                    stockName: 'Tesla Inc'
                },
                buy_or_sell: 'SELL',
                volume: 5,
                price: 200,
                status_code: 1,
            }
        ]}/>);
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('Apple Inc')).toBeInTheDocument();
        expect(screen.getByText('BUY')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('$150.00')).toBeInTheDocument();
        expect(screen.getByText('$1500.00')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('1.01.2022')).toBeInTheDocument();
        expect(screen.getByText('TSLA')).toBeInTheDocument();
        expect(screen.getByText('Tesla Inc')).toBeInTheDocument();
        expect(screen.getByText('SELL')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('$200.00')).toBeInTheDocument();
        expect(screen.getByText('$1000.00')).toBeInTheDocument();
        expect(screen.getByText('Filled')).toBeInTheDocument();
        expect(screen.getByText('N/A')).toBeInTheDocument();
    })
});