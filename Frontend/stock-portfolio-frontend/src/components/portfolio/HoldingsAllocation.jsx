import React from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import Card from '../ui/Card';

const HoldingsAllocation = ({ holdingsAllocation, loading }) => {
    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Holdings Allocation</h3>
                </div>
                <div className="animate-pulse space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
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
                    style={{ width: '100%', height: '100%' }}
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