import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, afterEach} from 'vitest';
import userEvent from '@testing-library/user-event';
import PlaceOrderDialog from '../components/dialog/PlaceOrderDialog';
import apiService from '../services/apiService';

vi.mock('../services/apiService', () => ({
    default: {
        getAllPortfolios: vi.fn(),
        getAllStocks: vi.fn(),
        placeOrder: vi.fn()
    }
}));

describe('PlaceOrderDialog', () => {
    const mockPortfolios = [
  { portfolioId: 1, portfolioName: 'Main' },
  { portfolioId: 2, portfolioName: 'Secondary' },
];

const mockStocks = [
  { stockId: 10, stockTicker: 'AAPL', stockName: 'Apple Inc.' },
  { stockId: 11, stockTicker: 'MSFT', stockName: 'Microsoft' },
];
    const onClose = vi.fn();

    beforeEach(()=>{
        vi.clearAllMocks();
        apiService.getAllPortfolios.mockResolvedValue(mockPortfolios);
        apiService.getAllStocks.mockResolvedValue(mockStocks);
    })
    it('should show loading while fetching data',async  ()=>{
        apiService.getAllPortfolios.mockReturnValue(new Promise(() => {})); // never resolves
        apiService.getAllStocks.mockReturnValue(new Promise(() => {}));
        
        render(<PlaceOrderDialog isOpen={true} onClose={onClose} />);
        
        expect(await screen.findByText(/Loading portfolios and stocks/i)).toBeInTheDocument();
    })
    it('should render the form after loading is finished' , async ()=> {
        render(<PlaceOrderDialog isOpen={true} onClose={onClose} />);
        expect(await screen.findByLabelText(/Portfolio/)).toBeInTheDocument();  
        expect(await screen.findByLabelText(/Stock/)).toBeInTheDocument();
    })
    it('Should not place order if no input is provided' , async ()=>{
        const user = userEvent.setup();

        render(<PlaceOrderDialog isOpen={true} onClose={onClose} />);

        await screen.findByLabelText(/Portfolio/);
        await user.click(screen.getByRole("button", { name: /place order/i}));

        expect(apiService.placeOrder).not.toHaveBeenCalled();
    })
    it('should submit valid form and close the dialog', async ()=>{
        apiService.placeOrder.mockResolvedValue({ orderId: 123 });

        const user = userEvent.setup();
        
        render(<PlaceOrderDialog isOpen={true} onClose={onClose} />);    
        
        await screen.findByLabelText(/Portfolio/);
        await screen.findByLabelText(/Stock/);
        
        await user.selectOptions(screen.getByLabelText(/Portfolio/), '1');
        await user.selectOptions(screen.getByLabelText(/Stock/), '10');
        await user.type(screen.getByLabelText(/Price/), '100');
        await user.type(screen.getByLabelText(/Volume/), '5');

        await user.click(screen.getByText(/Place Order/));
        await waitFor(() =>
      expect(apiService.placeOrder).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          price: 100,
          volume: 5,
          buy_or_sell: 'BUY',
          order_type: 'Market',
          fees: 9.99
        })
        )
        );
    })
    it('shows an error when placing order fails', async ()=>{
        apiService.placeOrder.mockRejectedValue(new Error('Failed to place order'));
        vi.spyOn(console, 'error').mockImplementation(() => {});

        const user = userEvent.setup();
        
        render(<PlaceOrderDialog isOpen={true} onClose={onClose} />);    
        
        await screen.findByLabelText(/Portfolio/);
        await screen.findByLabelText(/Stock/);
        
        await user.selectOptions(screen.getByLabelText(/Portfolio/), '1');
        await user.selectOptions(screen.getByLabelText(/Stock/), '10');
        await user.type(screen.getByLabelText(/Price/), '100');
        await user.type(screen.getByLabelText(/Volume/), '5');

        await user.click(screen.getByText(/Place Order/));
        expect(await screen.findByText(/Failed to place order/)).toBeInTheDocument();
    })
    it('should reset the form when the reset button is clicked', async ()=>{
        render(<PlaceOrderDialog isOpen={true} onClose={onClose} />); 
        
        const user = userEvent.setup();
        
        await screen.findByLabelText(/Portfolio/);
        await screen.findByLabelText(/Stock/);
        
        await user.selectOptions(screen.getByLabelText(/Portfolio/), '1');
        await user.selectOptions(screen.getByLabelText(/Stock/), '10');
        await user.type(screen.getByLabelText(/Price/), '100');
        await user.type(screen.getByLabelText(/Volume/), '5');

        const resetButton = screen.getByRole('button', {name: /reset/i});
        await userEvent.click(resetButton);

        
        expect(screen.getByLabelText(/Portfolio/)).toHaveValue('');
        expect(screen.getByLabelText(/Stock/)).toHaveValue('');
        expect(screen.getByLabelText(/Price/)).toHaveValue(null);
        expect(screen.getByLabelText("Volume (Number of Shares) *")).toHaveValue(null);
    })
    it('should close after clicking close button', async ()=>{
        const user = userEvent.setup();
        render(<PlaceOrderDialog isOpen={true} onClose={onClose} />); 
        await screen.findByLabelText(/Portfolio/);
        await user.click(screen.getByText("Cancel"));
        expect(onClose).toHaveBeenCalled();
    })
})