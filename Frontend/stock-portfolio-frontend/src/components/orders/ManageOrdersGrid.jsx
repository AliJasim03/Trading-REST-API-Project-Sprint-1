import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css"; // or alpine-dark
import Card from "../ui/Card";
import { useNavigate } from "react-router-dom";
import { Search, Clock, CheckCircle } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { useTheme } from "../../context/ThemeContext";

const ManageOrdersGrid = ({ orders, loading }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const getStatusIcon = (statusCode) => {
    switch (statusCode) {
      case 0:
        return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 1:
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 2:
        return (
          <div className="w-4 h-4 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        );
      default:
        return <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 rounded-full"></div>;
    }
  };

  const getOrderTypeColor = (buyOrSell) => {
    return buyOrSell === "BUY"
      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
      : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Define AG Grid columns
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Order",
        field: "orderId",
        cellRenderer: (params) => (
          <div className="flex items-center">
            {getStatusIcon(params.data.status_code)}
            <button
              onClick={() => navigate(`/order-status?id=${params.data.orderId}`)}
              className="ml-2 text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
            >
              #{params.data.orderId}
            </button>
          </div>
        ),
      },
      {
        headerName: "Stock",
        field: "stock",
        cellRenderer: (params) => (
          <div className="text-sm text-gray-900 dark:text-gray-100">
            <div className="font-medium">{params.data.stock?.stockTicker || "N/A"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {params.data.stock?.stockName || "N/A"}
            </div>
          </div>
        ),
      },
      {
        headerName: "Portfolio",
        field: "portfolio.portfolioName",
        valueGetter: (params) => params.data.portfolio?.portfolioName || "N/A",
      },
      {
        headerName: "Type",
        field: "buy_or_sell",
        cellRenderer: (params) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getOrderTypeColor(
              params.value
            )}`}
          >
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Details",
        field: "details",
        cellRenderer: (params) => (
          <div className="text-sm text-gray-900 dark:text-gray-100">
            <div>{params.data.volume} shares</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">@ ${params.data.price?.toFixed(2)}</div>
          </div>
        ),
      },
      {
        headerName: "Status",
        field: "status_code",
        cellRenderer: (params) => <StatusBadge status={params.value} />,
      },
      {
        headerName: "Date",
        field: "createdAt",
        valueFormatter: (params) => formatDate(params.value),
      },
    ],
    [navigate]
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const gridTheme = isDarkMode ? "ag-theme-alpine-dark" : "ag-theme-alpine";

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
        <div
          className={`${gridTheme} ag-theme-custom rounded-xl border border-gray-200 dark:border-gray-700`}
          style={{ width: "100%", height: "100%" }}
        >
          <AgGridReact
            rowData={orders}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowHeight={() => 60}
            animateRows={true}
            theme="legacy"
            domLayout="autoHeight"
          />
        </div>
      )}
    </Card>
  );
};

export default ManageOrdersGrid;
