import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css'; 
import { Plus, Eye, Bell, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

const WatchlistGrid = ({ watchlistData = [], loading = false, onAddAlert, onViewAlerts, onRemoveStock, onAddStock }) => {
  const { isDarkMode } = useTheme();

  // 🔹 Extract unique stocks (same as before)
  const getUniqueWatchlistStocks = () => {
    const stockMap = new Map();
    watchlistData.forEach(entry => {
      if (entry.stock) {
        const stockId = entry.stock.stockId;
        if (!stockMap.has(stockId)) {
          stockMap.set(stockId, {
            ...entry.stock,
            alertCount: 0,
            activeAlertCount: 0,
            currentPrice: Math.random() * 50 + 50,
            priceChange: (Math.random() - 0.5) * 10
          });
        }
        const stock = stockMap.get(stockId);
        if (entry.targetPrice !== null && entry.alertDirection !== null) {
          stock.alertCount++;
          if (!entry.notified) {
            stock.activeAlertCount++;
          }
        }
      }
    });
    return Array.from(stockMap.values());
  };

  const watchlistStocks = getUniqueWatchlistStocks();

  // Format helpers
  const formatCurrency = (value) =>
    value == null ? '$0.00' : new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);

  // 🔹 Column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Stock',
      field: 'stockTicker',
      flex: 1,
      cellRenderer: (params) => (
        <div>
          <div className="font-bold text-lg">{params.data.stockTicker}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {params.data.stockName}
          </div>
        </div>
      ),
    },
    {
      headerName: 'Current Price',
      field: 'currentPrice',
      flex: 1,
      cellRenderer: (params) => (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(params.value)}
        </span>
      ),
    },
    {
      headerName: 'Change',
      field: 'priceChange',
      flex: 1,
      cellRenderer: (params) => {
        const value = params.value || 0;
        const color = value >= 0 ? 'text-green-600' : 'text-red-600';
        return (
          <span className={color}>
            {value >= 0 ? '+' : ''}{value.toFixed(2)}%
          </span>
        );
      },
    },
    {
      headerName: 'Alerts',
      field: 'alertCount',
      flex: 1.2,
      cellRenderer: (params) => {
        const { alertCount, activeAlertCount } = params.data;
        return (
          <div className="flex items-center space-x-2">
            {alertCount > 0 ? (
              <>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  <Bell className="w-3 h-3 mr-1" /> {alertCount} total
                </span>
                {activeAlertCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {activeAlertCount} active
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400">No alerts</span>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Actions',
      field: 'actions',
      flex: 1.5,
      cellRenderer: (params) => {
        const stock = params.data;
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onAddAlert(stock)}
              className="flex items-center"
              title="Add price alert"
            >
              <Plus className="w-3 h-3" />
            </Button>
            {stock.alertCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewAlerts(stock)}
                className="flex items-center"
                title="View existing alerts"
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemoveStock(stock)}
              className="flex items-center text-red-600 hover:text-red-700 hover:border-red-300"
              title="Remove from watchlist"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    },
  ], [onAddAlert, onViewAlerts, onRemoveStock]);

  // Default column behavior
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading watchlist...</span>
      </div>
    );
  }

  if (!watchlistStocks || watchlistStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500 dark:text-gray-400">Your watchlist is empty</p>
        <Button onClick={onAddStock} className="mt-4 flex items-center mx-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Stock
        </Button>
      </div>
    );
  }

  const gridTheme = isDarkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your Watchlist</h2>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{watchlistStocks.length} stocks being watched</p>
          <Button onClick={onAddStock} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Add Stock
          </Button>
        </div>
      </div>

      <div className={`${gridTheme} rounded-xl border border-gray-200 dark:border-gray-700`} style={{ width: '100%', height: '100%' }}>
        <AgGridReact
          rowData={watchlistStocks}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          getRowHeight={() => 60}
          animateRows={true}
          theme="legacy"
        />
      </div>
    </div>
  );
};

export default WatchlistGrid;
