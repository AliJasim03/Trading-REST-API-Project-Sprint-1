import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';

const DataGrid = ({ 
    data = [], 
    columns = [], 
    height = 400,
    pagination = true,
    paginationPageSize = 10,
    sortable = true,
    filterable = true,
    resizable = true,
    className = '',
    theme = 'ag-theme-quartz',
    onRowClicked = null,
    rowSelection = null,
    loading = false,
    ...props 
}) => {
    // Default column definitions
    const defaultColDef = useMemo(() => ({
        sortable: sortable,
        filter: filterable,
        resizable: resizable,
        minWidth: 100,
        flex: 0,
    }), [sortable, filterable, resizable]);

    // Grid options
    const gridOptions = useMemo(() => ({
        pagination: pagination,
        paginationPageSize: paginationPageSize,
        rowSelection: rowSelection || undefined,
        suppressRowClickSelection: rowSelection ? false : true,
        animateRows: true,
        suppressCellFocus: true,
        headerHeight: 40,
        rowHeight: 48,
        ...props
    }), [pagination, paginationPageSize, rowSelection, props]);

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No data available</p>
            </div>
        );
    }

    return (
        <div className={`${className} w-full`}>
            <div 
                className={`${theme}`}
                style={{ 
                    height: height,
                    width: '100%',
                    border: 'none', // Remove border since AG-Grid will handle it
                    borderRadius: '0.5rem',
                    overflow: 'hidden'
                }}
            >
                <AgGridReact
                    rowData={data}
                    columnDefs={columns}
                    defaultColDef={defaultColDef}
                    {...gridOptions}
                    onRowClicked={onRowClicked}
                    suppressMenuHide={true}
                    suppressMovableColumns={false}
                    domLayout="normal"
                />
            </div>
        </div>
    );
};

export default DataGrid;