import {useMemo} from 'react';
import { Calendar, Clock } from 'lucide-react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { AgGridReact } from 'ag-grid-react';


const TradingHistory = ({ tradingHistory, loading }) => {
     const { isDarkMode } = useTheme();
    const gridTheme = isDarkMode ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';

    const columnDefs = useMemo(() => [
        {
            headerName: 'Stock',
            field: 'stock',
            flex: 1.5,
            cellRenderer: (params) => {
                const stock = params.value || {};
                return (
                    <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                            {stock.stockTicker || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stock.stockName || ''}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: 'Type',
            field: 'buy_or_sell',
            width: 120,
            cellRenderer: (params) => {
                const type = params.value;
                const isBuy = type === 'BUY';
                return (
                    <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            isBuy
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                    >
                        {type}
                    </span>
                );
            },
        },
        {
            headerName: 'Quantity',
            field: 'volume',
            type: 'numericColumn',
            width: 120,
        },
        {
            headerName: 'Price',
            field: 'price',
            type: 'numericColumn',
            valueFormatter: (p) => `$${(p.value || 0).toFixed(2)}`,
            width: 120,
        },
        {
            headerName: 'Total',
            field: 'total',
            type: 'numericColumn',
            valueGetter: (p) => (p.data?.price || 0) * (p.data?.volume || 0),
            valueFormatter: (p) => `$${(p.value || 0).toFixed(2)}`,
            width: 140,
        },
        {
            headerName: 'Status',
            field: 'status_code',
            width: 140,
            cellRenderer: (params) => <StatusBadge status={params.value} />,
        },
        {
            headerName: 'Date',
            field: 'createdAt',
            flex: 1,
            valueFormatter: (p) =>
                p.value ? new Date(p.value).toLocaleDateString() : 'N/A',
        },
    ], []);

    const defaultColDef = useMemo(
        () => ({
            flex: 1,
            minWidth: 120,
            resizable: true,
            sortable: true,
            filter: true,
        }),
        []
    );
    if (loading) {
        return (
            <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trading History</h3>
                </div>
                <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trading History</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            {!tradingHistory || tradingHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No trading history found</p>
                </div>
            ) : (
                // <div className="overflow-x-auto">
                //     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                //         <thead className="bg-gray-50 dark:bg-gray-800">
                //             <tr>
                //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                //                     Stock
                //                 </th>
                //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                //                     Type
                //                 </th>
                //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                //                     Quantity
                //                 </th>
                //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                //                     Price
                //                 </th>
                //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                //                     Total
                //                 </th>
                //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                //                     Status
                //                 </th>
                //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                //                     Date
                //                 </th>
                //             </tr>
                //         </thead>
                //         <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                //             {tradingHistory.map((order, index) => (
                //                 <tr key={`${order.orderId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                //                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                //                         <div>{order.stock?.stockTicker || 'N/A'}</div>
                //                         <div className="text-xs text-gray-500 dark:text-gray-400">{order.stock?.stockName || ''}</div>
                //                     </td>
                //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                //                         <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                //                             order.buy_or_sell === 'BUY'
                //                                 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                //                                 : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                //                         }`}>
                //                             {order.buy_or_sell}
                //                         </span>
                //                     </td>
                //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                //                         {order.volume}
                //                     </td>
                //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                //                         ${order.price?.toFixed(2) || '0.00'}
                //                     </td>
                //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                //                         ${((order.price || 0) * (order.volume || 0)).toFixed(2)}
                //                     </td>
                //                     <td className="px-6 py-4 whitespace-nowrap">
                //                         <StatusBadge status={order.status_code} />
                //                     </td>
                //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                //                         {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                //                     </td>
                //                 </tr>
                //             ))}
                //         </tbody>
                //     </table>
                // </div>
                 <div
                    className={`${gridTheme} rounded-xl border border-gray-200 dark:border-gray-700`}
                    style={{ width: '100%', padding: '0.5rem' }}
                >
                    <AgGridReact
                        rowData={tradingHistory}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        pagination={true}
                        paginationPageSize={10}
                        theme="legacy"
                        domLayout="autoHeight"
                    />
                </div>
            )}
        </Card>
    );
};

export default TradingHistory;