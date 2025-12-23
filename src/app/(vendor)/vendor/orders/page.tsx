'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, DollarSign, Package, TrendingUp, Eye, Plus, FileText } from 'lucide-react';
import { useCurrencyStore } from '@/stores/currency';
import useVendorOrdersStore from '@/stores/vendor-orders';
import { useState } from 'react';
import { CreatePurchaseOrderModal } from '@/components/purchase-order-modals';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function VendorOrdersPage() {
  const { formatAmount } = useCurrencyStore();
  const { orders, invoices, addOrder, addInvoice } = useVendorOrdersStore();
  const router = useRouter();
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  const metrics = [
    {
      title: 'Active Orders',
      value: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Total Revenue',
      value: formatAmount(orders.reduce((sum, order) => sum + order.totalAmount, 0)),
      change: '+18%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Products Supplied',
      value: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0).toString(),
      change: '+24',
      changeType: 'positive' as const,
      icon: Package,
    },
    {
      title: 'Performance Score',
      value: '95%',
      change: '+2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
  ];

  const purchaseOrders = orders.slice(0, 3).map(order => ({
    id: order.orderNumber,
    items: order.items.map(item => ({
      name: item.name,
      qty: item.quantity,
      price: item.unitPrice,
    })),
    total: order.totalAmount,
    status: order.status === 'in_transit' ? 'in_transit' : order.status === 'delivered' ? 'delivered' : 'pending',
    orderDate: order.orderDate.toISOString().split('T')[0],
    deliveryDate: order.deliveryDate.toISOString().split('T')[0],
  }));

  const handleViewOrders = () => {
    toast.info('Opening detailed orders view...');
    // In a real application, this would open a detailed orders list modal or navigate to a dedicated orders page
  };

  const handleUpdateStock = () => {
    router.push('/inventory/stock');
  };

  const handleCreateOrder = () => {
    setShowCreateOrderModal(true);
  };

  const handleViewInvoices = () => {
    toast.info('Opening invoices view...');
    // In a real application, this would navigate to invoices page or open invoices modal
  };

  const handleSubmitInvoice = () => {
    setShowCreateInvoiceModal(true);
  };

  const handleOrderCreated = (order: any) => {
    addOrder({
      clientName: order.supplierName,
      items: order.items.map((item: any) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      totalAmount: order.totalAmount,
      status: 'pending',
      deliveryDate: order.expectedDelivery,
      notes: order.notes,
    });
    toast.success('Order created successfully!');
    setShowCreateOrderModal(false);
  };

  const handleInvoiceCreated = () => {
    // Create a sample invoice for demonstration
    const sampleOrder = orders[0];
    if (sampleOrder) {
      addInvoice({
        orderId: sampleOrder.id,
        orderNumber: sampleOrder.orderNumber,
        amount: sampleOrder.totalAmount * 0.9,
        tax: sampleOrder.totalAmount * 0.1,
        totalAmount: sampleOrder.totalAmount,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      toast.success('Invoice created successfully!');
    }
    setShowCreateInvoiceModal(false);
  };

  const recentPayments = invoices.slice(0, 3).map(invoice => ({
    id: invoice.invoiceNumber,
    order: invoice.orderNumber,
    amount: invoice.totalAmount,
    date: invoice.issueDate.toISOString().split('T')[0],
    status: invoice.status === 'paid' ? 'completed' : invoice.status,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-pink-600 to-pink-700 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Supplier Dashboard</h1>
        <p className="text-pink-100 mt-1 text-lg">Manage orders, deliveries, and payments</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {metric.title}
                </CardTitle>
                <div className="p-2 bg-pink-100 rounded-lg">
                  <IconComponent className="h-5 w-5 text-pink-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                <p className="text-sm mt-1">
                  <span className="text-green-600 font-semibold">{metric.change}</span>{' '}
                  <span className="text-gray-500">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Purchase Orders */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Purchase Orders</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Current and recent orders from clients
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {purchaseOrders.map((order) => (
              <div key={order.id} className="p-4 rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{order.id}</h4>
                      <Badge
                        variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'in_transit' ? 'secondary' : 'outline'
                        }
                        className="font-semibold"
                      >
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-gray-600">Qty: <span className="font-semibold">{item.qty}</span> × {formatAmount(item.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Order Date</p>
                        <p className="font-semibold text-gray-900">{order.orderDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Delivery Date</p>
                        <p className="font-semibold text-gray-900">{order.deliveryDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-bold text-pink-600 text-lg">{formatAmount(order.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Recent Payments</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Payment history and transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{payment.id}</p>
                    <Badge variant="default">
                      {payment.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Order: {payment.order}</p>
                  <p className="text-xs text-gray-500 mt-1">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatAmount(payment.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Common vendor tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={handleViewOrders}
              className="p-5 border-2 border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-pink-50 hover:to-purple-50 hover:border-pink-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                  <ShoppingCart className="h-5 w-5 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">View Orders</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                All purchase orders
              </p>
            </button>
            <button
              onClick={handleUpdateStock}
              className="p-5 border-2 border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Update Stock</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Product availability
              </p>
            </button>
            <button
              onClick={handleCreateOrder}
              className="p-5 border-2 border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-green-50 hover:to-emerald-50 hover:border-green-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Create Order</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                New purchase order
              </p>
            </button>
            <button
              onClick={handleViewInvoices}
              className="p-5 border-2 border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">View Invoices</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Invoice management
              </p>
            </button>
            <button
              onClick={handleSubmitInvoice}
              className="p-5 border-2 border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-orange-50 hover:to-red-50 hover:border-orange-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Submit Invoice</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Create new invoice
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreatePurchaseOrderModal
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Simple Invoice Modal for demo */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Create Invoice</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will create a sample invoice for the first order. In a real application, this would have a full form.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateInvoiceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvoiceCreated}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
