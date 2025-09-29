import React from 'react'
import { Check, Edit3, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

export default function OrderStatusDetails({
    orderData, 
    onOrderUpdate,
    updating, 
    error, 
    success
}) {
      const getStatusIcon = (statusCode) => {
          switch (statusCode) {
              case 0:
                  return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
              case 1:
                  return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
              case 2:
                  return <div className="w-5 h-5 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>;
              default:
                  return <div className="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>;
          }
      };

       const getStatusMessage = (statusCode) => {
        switch (statusCode) {
            case 0:
                return 'Your order is pending and will be processed soon.';
            case 1:
                return 'Your order has been successfully filled.';
            case 2:
                return 'Your order has been rejected. Please contact support if you need assistance.';
            default:
                return 'Unknown order status.';
        }
    };


    const getOrderTypeColor = (buyOrSell) => {
        return buyOrSell === 'BUY'
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
            : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    };

    const handleStatusUpdate = (newStatus) => {
        onOrderUpdate(newStatus);
    };

  return (
    <>
                    {/* Status Header */}
                    <Card className="p-6 mb-6 border-l-4 border-l-primary-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                {getStatusIcon(orderData.status_code)}
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-3">
                                    Order #{orderData.orderId}
                                </h2>
                            </div>
                            <StatusBadge status={orderData.status_code} className="text-sm px-3 py-1" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{getStatusMessage(orderData.status_code)}</p>
                        
                        {/* Admin Controls - Only show for pending orders */}
                        {orderData.status_code === 0 && (
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Admin Actions
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Update the status of this pending order:
                                </p>
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={() => handleStatusUpdate(1)} 
                                        loading={updating}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Mark as Filled
                                    </Button>
                                    <Button 
                                        onClick={() => handleStatusUpdate(2)} 
                                        loading={updating}
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Mark as Rejected
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Detailed Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Basic Information */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mr-2"></div>
                                Basic Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                                    <span className="font-medium text-lg text-gray-900 dark:text-gray-100">#{orderData.orderId}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                    {orderData.stock?.stockTicker ?
                        `${orderData.stock.stockTicker} - ${orderData.stock.stockName}` :
                        'N/A'
                    }
                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Portfolio:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                    {orderData.portfolio?.portfolioName || 'N/A'}
                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Order Type:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getOrderTypeColor(orderData.buy_or_sell)}`}>
                    {orderData.buy_or_sell}
                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 dark:text-gray-400">Order Method:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{orderData.order_type || 'N/A'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Financial Details */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-2"></div>
                                Financial Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Price per Share:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">${orderData.price?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{orderData.volume || 0} shares</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Order Value:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${((orderData.price || 0) * (orderData.volume || 0)).toFixed(2)}
                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Transaction Fees:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">${orderData.fees?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3">
                                    <span className="text-gray-900 dark:text-gray-100 font-semibold">Total Cost:</span>
                                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    ${((orderData.price || 0) * (orderData.volume || 0) + (orderData.fees || 0)).toFixed(2)}
                  </span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Timeline */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-2"></div>
                            Order Timeline
                        </h3>
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-primary-600 dark:bg-primary-500 rounded-full border-2 border-white dark:border-gray-800 shadow"></div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Order Placed</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {orderData.createdAt ?
                                                new Date(orderData.createdAt).toLocaleString() :
                                                'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-4"></div>

                                <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow ${
                                        orderData.status_code >= 1 ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}></div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {orderData.status_code === 1 ? 'Order Filled' :
                                                orderData.status_code === 2 ? 'Order Rejected' : 'Processing'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {orderData.status_code >= 1 ? 'Completed' : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
  )
}
