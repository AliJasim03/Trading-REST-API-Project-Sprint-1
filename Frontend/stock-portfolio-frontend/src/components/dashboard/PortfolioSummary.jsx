import React, { useMemo } from 'react'
import Card from '../ui/Card'
import { useAgGridTheme } from '../../context/ThemeContext'

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'


ModuleRegistry.registerModules([AllCommunityModule])

export default function PortfolioSummary({ portfolioSummary }) {
  const gridTheme = useAgGridTheme()

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value || 0)

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Portfolio',
        field: 'name',
        flex: 1,
        cellRenderer: (params) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {params.data.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ID: {params.data.id}
            </div>
          </div>
        ),
      },
      {
        headerName: 'Holdings Value',
        field: 'totalValue',
        flex: 1,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: 'Available Capital',
        field: 'availableCapital',
        flex: 1,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: 'Total Capital',
        field: 'totalCapital',
        flex: 1,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: 'Holdings Count',
        field: 'holdingsCount',
        flex: 1,
        valueFormatter: (params) => params.value || 0,
      },
    ],
    []
  )

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  )

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Portfolio Summary
      </h2>

      <div
        className={`${gridTheme} rounded-xl border border-gray-200 dark:border-gray-700`}
        style={{ width: '100%', padding: '0.5rem' }}
      >
        <AgGridReact
          rowData={portfolioSummary}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows
          domLayout="autoHeight"
          theme="legacy"
        />
      </div>
    </Card>
  )
}
