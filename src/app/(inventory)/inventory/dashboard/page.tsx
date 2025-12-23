// 'use client';

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Package, TrendingDown, AlertTriangle, CheckCircle, ShoppingCart, Truck, DollarSign, BarChart3, Users, RotateCcw, FolderOpen } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useCurrencyStore } from '@/stores/currency';

// export default function InventoryDashboard() {
//   const router = useRouter();
//   const { formatAmount } = useCurrencyStore();
//   const metrics = [
//     {
//       title: 'Total Products',
//       value: '524',
//       change: '+12',
//       changeType: 'positive' as const,
//       icon: Package,
//       description: 'Active inventory items'
//     },
//     {
//       title: 'Low Stock Items',
//       value: '23',
//       change: '+5',
//       changeType: 'negative' as const,
//       icon: AlertTriangle,
//       description: 'Items below minimum stock'
//     },
//     {
//       title: 'Active Suppliers',
//       value: '47',
//       change: '+3',
//       changeType: 'positive' as const,
//       icon: Users,
//       description: 'Current supplier relationships'
//     },
    
//     {
//       title: 'Monthly Returns',
//       value: '8',
//       change: '-3',
//       changeType: 'positive' as const,
//       icon: RotateCcw,
//       description: 'Return requests this month'
//     },
//     {
//       title: 'Stock Value',
//       value: '$125K',
//       change: '+8.5%',
//       changeType: 'positive' as const,
//       icon: DollarSign,
//       description: 'Total inventory value'
//     },
//   ];

//   const lowStockItems = [
//     { name: 'LED Panel 600x600', sku: 'SKU-12345', current: 15, minimum: 50, status: 'low' },
//     { name: 'Circuit Breaker 32A', sku: 'SKU-12346', current: 8, minimum: 30, status: 'critical' },
//     { name: 'Cable Wire 2.5mm', sku: 'SKU-12347', current: 120, minimum: 200, status: 'low' },
//     { name: 'Junction Box IP65', sku: 'SKU-12348', current: 0, minimum: 25, status: 'out' },
//   ];

//   const recentOrders = [
//     { id: 'PO-2024-001', supplier: 'ElectroSupply Co', items: 15, total: 12450, status: 'pending', date: '2024-10-20' },
//     { id: 'PO-2024-002', supplier: 'PowerTech Ltd', items: 8, total: 8900, status: 'delivered', date: '2024-10-19' },
//     { id: 'PO-2024-003', supplier: 'LightWorks Inc', items: 22, total: 18750, status: 'in_transit', date: '2024-10-18' },
//     { id: 'PO-2024-004', supplier: 'ElectroSupply Co', items: 12, total: 9200, status: 'delivered', date: '2024-10-17' },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
//         <h1 className="text-3xl font-bold text-white">Inventory Overview</h1>
//         <p className="text-blue-100 mt-1 text-lg">Monitor stock levels and manage supply chain</p>
//       </div>

//       {/* Metrics Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
//         {metrics.map((metric, index) => {
//           const IconComponent = metric.icon;
//           return (
//             <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-semibold text-gray-700">
//                   {metric.title}
//                 </CardTitle>
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <IconComponent className="h-5 w-5 text-blue-600" />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
//                 <p className="text-sm mt-1">
//                   <span
//                     className={
//                       metric.changeType === 'positive'
//                         ? 'text-green-600 font-semibold'
//                         : metric.changeType === 'negative'
//                         ? 'text-red-600 font-semibold'
//                         : 'text-gray-600 font-semibold'
//                     }
//                   >
//                     {metric.change}
//                   </span>{' '}
//                   <span className="text-gray-500">from last week</span>
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Low Stock Alerts */}
//         <Card className="shadow-lg">
//           <CardHeader className="bg-linear-to-r from-orange-50 to-red-50 rounded-t-lg">
//             <CardTitle className="text-xl text-gray-900">Stock Alerts</CardTitle>
//             <CardDescription className="text-gray-600 font-medium">
//               Items requiring immediate attention
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="pt-6">
//             <div className="space-y-4">
//               {lowStockItems.map((item, index) => (
//                 <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
//                   <div className="flex-1">
//                     <p className="text-sm font-semibold text-gray-900">{item.name}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">{item.sku}</p>
//                     <p className="text-xs text-gray-600 mt-1">
//                       Current: <span className="font-semibold">{item.current}</span> / Min: <span className="font-semibold">{item.minimum}</span>
//                     </p>
//                   </div>
//                   <Badge
//                     variant={
//                       item.status === 'out' ? 'destructive' :
//                       item.status === 'critical' ? 'destructive' : 'secondary'
//                     }
//                     className="font-semibold"
//                   >
//                     {item.status === 'out' ? 'OUT OF STOCK' :
//                      item.status === 'critical' ? 'CRITICAL' : 'LOW STOCK'}
//                   </Badge>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Recent Purchase Orders */}
//         <Card className="shadow-lg">
//           <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-lg">
//             <CardTitle className="text-xl text-gray-900">Recent Orders</CardTitle>
//             <CardDescription className="text-gray-600 font-medium">
//               Latest purchase orders
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="pt-6">
//             <div className="space-y-4">
//               {recentOrders.map((order) => (
//                 <div key={order.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2">
//                       <p className="text-sm font-bold text-gray-900">{order.id}</p>
//                       <Badge
//                         variant={
//                           order.status === 'delivered' ? 'default' :
//                           order.status === 'in_transit' ? 'secondary' : 'outline'
//                         }
//                       >
//                         {order.status.replace('_', ' ').toUpperCase()}
//                       </Badge>
//                     </div>
//                     <p className="text-sm text-gray-600 mt-1">{order.supplier}</p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {order.items} items • {formatAmount(order.total)} • {order.date}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quick Actions */}
      
//     </div>
//   );
// }


// new codee
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  BarChart3, 
  Users, 
  RotateCcw, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Building,
  Calendar,
  Loader2,
  CheckCircle,
  ShoppingCart,
  FolderOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrencyStore } from '@/stores/currency';
import { toast } from 'sonner';
import { 
  collection, 
  query, 
  orderBy, 
  Timestamp,
  onSnapshot,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Interfaces
interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  costPrice: number;
  sellingPrice: number;
  category: string;
  status: string;
  supplierName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Supplier {
  id: string;
  companyName: string;
  status: string;
  isActive: boolean;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  rating: number;
  qualityRating: number;
  onTimeDeliveryRate: number;
  createdAt: Timestamp;
}

interface ReturnItem {
  id: string;
  returnNumber: string;
  status: string;
  totalValue: number;
  totalQuantity: number;
  createdAt: Timestamp;
  requestedDate: Timestamp;
  type: string;
}

export default function InventoryDashboard() {
  const router = useRouter();
  const { formatAmount } = useCurrencyStore();
  const [loading, setLoading] = useState(true);
  
  // Real-time state
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch real-time data
  useEffect(() => {
    const unsubscribeCallbacks: (() => void)[] = [];

    const setupListeners = async () => {
      try {
        setLoading(true);

        // 1. Products listener
        const productsQuery = query(
          collection(db, 'products'),
          where('status', '==', 'active')
        );
        
        const productsUnsubscribe = onSnapshot(productsQuery, (snapshot) => {
          const productsData: Product[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            productsData.push({
              id: doc.id,
              name: data.name || '',
              sku: data.sku || '',
              currentStock: data.currentStock || 0,
              minStockLevel: data.minStockLevel || 0,
              maxStockLevel: data.maxStockLevel || 0,
              costPrice: data.costPrice || 0,
              sellingPrice: data.sellingPrice || 0,
              category: data.category || '',
              status: data.status || 'inactive',
              supplierName: data.supplierName || '',
              createdAt: data.createdAt || Timestamp.now(),
              updatedAt: data.updatedAt || Timestamp.now(),
            });
          });
          setProducts(productsData);
        });
        unsubscribeCallbacks.push(productsUnsubscribe);

        // 2. Suppliers listener
        const suppliersQuery = query(
          collection(db, 'suppliers'),
          where('status', '==', 'active')
        );
        
        const suppliersUnsubscribe = onSnapshot(suppliersQuery, (snapshot) => {
          const suppliersData: Supplier[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            suppliersData.push({
              id: doc.id,
              companyName: data.companyName || '',
              status: data.status || 'inactive',
              isActive: data.isActive || false,
              primaryContact: data.primaryContact || { name: '', email: '', phone: '' },
              rating: data.rating || 0,
              qualityRating: data.qualityRating || 0,
              onTimeDeliveryRate: data.onTimeDeliveryRate || 0,
              createdAt: data.createdAt || Timestamp.now(),
            });
          });
          setSuppliers(suppliersData);
        });
        unsubscribeCallbacks.push(suppliersUnsubscribe);

        // 3. Returns listener - monthly returns
        const returnsQuery = query(
          collection(db, 'returns'),
          orderBy('createdAt', 'desc')
        );
        
        const returnsUnsubscribe = onSnapshot(returnsQuery, (snapshot) => {
          const returnsData: ReturnItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            returnsData.push({
              id: doc.id,
              returnNumber: data.returnNumber || '',
              status: data.status || '',
              totalValue: data.totalValue || 0,
              totalQuantity: data.totalQuantity || 0,
              createdAt: data.createdAt || Timestamp.now(),
              requestedDate: data.requestedDate || Timestamp.now(),
              type: data.type || '',
            });
          });
          setReturns(returnsData);
        });
        unsubscribeCallbacks.push(returnsUnsubscribe);

        setLastUpdated(new Date());
        toast.success('Real-time data connected');

      } catch (error) {
        console.error('Error setting up listeners:', error);
        toast.error('Failed to connect to real-time data');
      } finally {
        setLoading(false);
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    
    // Low stock items (below min level)
    const lowStockItems = products.filter(product => 
      product.currentStock <= product.minStockLevel
    ).length;
    
    // Active suppliers
    const activeSuppliers = suppliers.filter(s => s.isActive).length;
    
    // Monthly returns
    const currentMonthStart = startOfMonth(new Date());
    const monthlyReturns = returns.filter(returnItem => {
      const returnDate = returnItem.createdAt?.toDate?.();
      return returnDate && returnDate >= currentMonthStart;
    }).length;
    
    // Stock value (cost price)
    const stockValue = products.reduce((total, product) => 
      total + (product.costPrice * product.currentStock), 0
    );
    
    // Inventory value (selling price)
    const inventoryValue = products.reduce((total, product) => 
      total + (product.sellingPrice * product.currentStock), 0
    );

    // Out of stock
    const outOfStock = products.filter(p => p.currentStock === 0).length;

    return {
      totalProducts,
      lowStockItems,
      activeSuppliers,
      monthlyReturns,
      stockValue,
      inventoryValue,
      outOfStock
    };
  }, [products, suppliers, returns]);

  // Get low stock alerts
  const lowStockAlerts = useMemo(() => {
    return products
      .filter(product => product.currentStock <= product.minStockLevel)
      .map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        current: product.currentStock,
        minimum: product.minStockLevel,
        maximum: product.maxStockLevel,
        status: product.currentStock === 0 ? 'out' : 
                product.currentStock <= (product.minStockLevel * 0.25) ? 'critical' : 'low',
        supplier: product.supplierName,
        value: product.costPrice * product.currentStock
      }))
      .slice(0, 5); // Top 5 most critical
  }, [products]);

  // Get recent returns (for recent orders section)
  const recentReturns = useMemo(() => {
    return returns
      .slice(0, 5)
      .map(returnItem => ({
        id: returnItem.returnNumber,
        supplier: 'Return Processing',
        items: returnItem.totalQuantity,
        total: returnItem.totalValue,
        status: returnItem.status === 'received' ? 'delivered' : 
                returnItem.status === 'processing' ? 'in_transit' : 'pending',
        date: returnItem.createdAt?.toDate ? 
              format(returnItem.createdAt.toDate(), 'yyyy-MM-dd') : 
              format(new Date(), 'yyyy-MM-dd')
      }));
  }, [returns]);

  const formatDate = (date: Date) => format(date, 'hh:mm:ss a');

  const handleRefresh = () => {
    setLastUpdated(new Date());
    toast.info('Data refreshed');
  };

  const dashboardMetrics = [
    {
      title: 'Total Products',
      value: metrics.totalProducts.toString(),
      change: '+12',
      changeType: 'positive' as const,
      icon: Package,
      description: 'Active inventory items',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Low Stock Items',
      value: metrics.lowStockItems.toString(),
      change: `+${Math.floor(metrics.lowStockItems * 0.1)}`,
      changeType: 'negative' as const,
      icon: AlertTriangle,
      description: 'Items below minimum stock',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Active Suppliers',
      value: metrics.activeSuppliers.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Current supplier relationships',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Monthly Returns',
      value: metrics.monthlyReturns.toString(),
      change: '-3',
      changeType: 'positive' as const,
      icon: RotateCcw,
      description: 'Return requests this month',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      title: 'Stock Value',
      value: `$${(metrics.stockValue / 1000).toFixed(1)}K`,
      change: '+8.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'Total inventory value (cost)',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Inventory Value',
      value: `$${(metrics.inventoryValue / 1000).toFixed(1)}K`,
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: BarChart3,
      description: 'Total selling value',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Inventory Overview</h1>
            <p className="text-blue-100 mt-1 text-lg">Real-time stock monitoring</p>
            
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
          <p className="text-blue-700 font-medium">Loading inventory data...</p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {dashboardMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border hover:border-gray-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-gray-700">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                <p className="text-xs mt-2">
                  <span className={
                    metric.changeType === 'positive' 
                      ? 'text-green-600 font-semibold' 
                      : metric.changeType === 'negative'
                      ? 'text-red-600 font-semibold'
                      : 'text-gray-600 font-semibold'
                  }>
                    {metric.change}
                  </span>
                  <span className="text-gray-500"> from last week</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stock Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Out of Stock</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.outOfStock}</div>
            <p className="text-xs text-gray-600">Items completely out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Avg Stock</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {products.length > 0 
                ? Math.round(products.reduce((sum, p) => sum + p.currentStock, 0) / products.length)
                : 0}
            </div>
            <p className="text-xs text-gray-600">Average stock level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Top Supplier</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 truncate">
              {suppliers.length > 0 
                ? suppliers.sort((a, b) => b.rating - a.rating)[0]?.companyName?.slice(0, 12) || 'N/A'
                : 'No suppliers'}
            </div>
            <p className="text-xs text-gray-600">Highest rated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Returns</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <RotateCcw className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{returns.length}</div>
            <p className="text-xs text-gray-600">All time returns</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-orange-50 to-red-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-gray-900">Stock Alerts</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Items below minimum stock
                </CardDescription>
              </div>
              <Badge variant="destructive">
                {lowStockAlerts.length} Alerts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.sku}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Supplier: {item.supplier}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Stock: <span className="font-semibold">{item.current}</span> / 
                        Min: <span className="font-semibold">{item.minimum}</span>
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.status === 'out' ? 'destructive' :
                        item.status === 'critical' ? 'destructive' : 'secondary'
                      }
                      className="font-semibold whitespace-nowrap"
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-600">All stock levels are good</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Returns (Orders) */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-gray-900">Recent Returns</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Latest return requests
                </CardDescription>
              </div>
              <Badge variant="outline">
                {recentReturns.length} Returns
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentReturns.length > 0 ? (
                recentReturns.map((order, index) => (
                  <div key={order.id || index} className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-gray-900">{order.id}</p>
                        <Badge
                          variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'in_transit' ? 'secondary' : 'outline'
                          }
                        >
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{order.supplier}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.items} items • {formatAmount(order.total)} • {order.date}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <RotateCcw className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-600">No recent returns</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
}