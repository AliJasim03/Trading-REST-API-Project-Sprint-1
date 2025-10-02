import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import Card from '../ui/Card';
import { useAgGridTheme } from '../../context/ThemeContext';
import { 
    OrderIdRenderer, 
    StockRenderer, 
    BuySellRenderer, 
    VolumeePriceRenderer, 
    StatusRenderer, 
    DateTimeRenderer 
} from '../ui/GridRenderers';

const ManageOrdersGrid = ({ 
    orders, 
    loading
}) => {
    const navigate = useNavigate();
    const agGridTheme = useAgGridTheme();

    const handleOrderClick = (orderId) => {
        navigate(`/order-status?id=${orderId}`);
    };

    const columnDefs = useMemo(() => [
        {
            headerName: 'Order',
            field: 'orderId',
            width: 140,
            cellRenderer: (params) => (
                <OrderIdRenderer 
                    value={params.value} 
                    data={params.data} 
                    onOrderClick={handleOrderClick} 
                />
            ),
        },
        {
            headerName: 'Stock',
            field: 'stock',
            flex: 1.5,
            cellRenderer: (params) => <StockRenderer value={params.value} />,
        },
        {
            headerName: 'Portfolio',
            field: 'portfolio.portfolioName',
            flex: 1,
            valueGetter: (params) => params.data?.portfolio?.portfolioName || 'N/A',
        },
        {
            headerName: 'Type',
            field: 'buy_or_sell',
            width: 120,
            cellRenderer: (params) => <BuySellRenderer value={params.value} />,
        },
        {
            headerName: 'Details',
            width: 140,
            cellRenderer: (params) => <VolumeePriceRenderer data={params.data} />,
        },
        {
            headerName: 'Status',
            field: 'status_code',
            width: 120,
            cellRenderer: (params) => <StatusRenderer value={params.value} />,
        },
        {
            headerName: 'Date',
            field: 'createdAt',
            flex: 1,
            cellRenderer: (params) => <DateTimeRenderer value={params.value} />,
        },
    ], []);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 120,
        resizable: true,
        sortable: true,
        filter: true,
        minWidth: 200,
        
    }), []);

    return (
        <Card className="overflow-hidden">
            {loading ? (
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No orders found</h3>
                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <div className="p-6">
                    <div
                        className={`${agGridTheme} rounded-xl border border-gray-200 dark:border-gray-700`}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <AgGridReact
                            rowData={orders}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            animateRows={true}
                            theme="legacy"
                            domLayout='autoHeight'
                            pagination={true}
                            paginationPageSize={10}
                            paginationPageSizeSelector={[10, 20, 50]}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ManageOrdersGrid;
