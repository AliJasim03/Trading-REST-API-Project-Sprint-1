import { PieChart, BarChart3 } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import Card from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const HoldingsAllocation = ({ holdingsAllocation, loading }) => {
    const { isDarkMode } = useTheme();
    const gridTheme = isDarkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const columnDefs = useMemo(
        () => [
            { headerName: 'Symbol', field: 'stockSymbol', sortable: true, filter: true },
            { headerName: 'Name', field: 'stockName', sortable: true, filter: true },
            { headerName: 'Shares', field: 'quantity', sortable: true, filter: 'agNumberColumnFilter' },
            { 
                headerName: 'Price ($)', 
                field: 'currentPrice', 
                sortable: true, 
                filter: 'agNumberColumnFilter',
                valueFormatter: p => `$${(p.value || 0).toFixed(2)}`
            },
            { 
                headerName: 'Value ($)', 
                field: 'value', 
                sortable: true, 
                filter: 'agNumberColumnFilter',
                valueFormatter: p => `$${(p.value || 0).toFixed(2)}`
            },
            { 
                headerName: 'Allocation %', 
                field: 'percentage', 
                sortable: true, 
                filter: 'agNumberColumnFilter',
                valueFormatter: p => `${(p.value || 0).toFixed(1)}%`
            }
        ],
        []
    );

    const defaultColDef = useMemo(
        () => ({
            flex: 1,
            minWidth: 120,
            resizable: true,
        }),
        []
    );

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Holdings Allocation</h3>
                </div>
                <div className="animate-pulse space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Holdings Allocation</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
            </div>

            {!holdingsAllocation || holdingsAllocation.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No holdings found</p>
                </div>
            ) : (
                <div
                    className={`${gridTheme} rounded-xl border border-gray-200 dark:border-gray-700`}
                    style={{ width: '100%', height: '400px' }}
                >
                    <AgGridReact
                        rowData={holdingsAllocation}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        pagination={true}
                        paginationPageSize={5}
                        domLayout="autoHeight"
                        theme="legacy"
                    />
                </div>
            )}
        </Card>
    );
};

export default HoldingsAllocation;
