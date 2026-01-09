"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    ShoppingCart,
    AlertCircle,
    Package,
    User,
    Calendar,
    DollarSign,
    Phone,
    Mail,
    MapPin
} from "lucide-react";
import Image from "next/image";
import AdminLayout from "../../../../components/admin/AdminLayout";
import { adminOrders } from "../../../../utils/adminDummyData";
import { AdminOrder } from "../../../../types/admin";

const OrdersPage = () => {
    const [orders, setOrders] = useState<AdminOrder[]>(adminOrders);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

    // Filter orders based on search and filters
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
        const matchesPaymentStatus = selectedPaymentStatus === "all" || order.payment_status === selectedPaymentStatus;

        return matchesSearch && matchesStatus && matchesPaymentStatus;
    });

    const handleStatusUpdate = (orderId: number, newStatus: AdminOrder["status"]) => {
        setOrders(orders.map(order =>
            order.id === orderId
                ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
                : order
        ));
    };

    const handlePaymentStatusUpdate = (orderId: number, newPaymentStatus: AdminOrder["payment_status"]) => {
        setOrders(orders.map(order =>
            order.id === orderId
                ? { ...order, payment_status: newPaymentStatus, updated_at: new Date().toISOString() }
                : order
        ));
    };

    const viewOrderDetails = (order: AdminOrder) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'processing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'shipped': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage customer orders and deliveries</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total Revenue: <span className="font-semibold text-green-600">NPR {orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Payment Status Filter */}
                        <select
                            value={selectedPaymentStatus}
                            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Payment Status</option>
                            <option value="pending">Payment Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>

                        {/* Results Count */}
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {filteredOrders.length} orders found
                        </div>
                    </div>
                </motion.div>

                {/* Orders Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.order_number}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {order.items.length} item(s)
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.customer_name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {order.customer_email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                NPR {order.total_amount.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {order.payment_method}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as AdminOrder["status"])}
                                                className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${getStatusColor(order.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.payment_status}
                                                onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value as AdminOrder["payment_status"])}
                                                className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${getPaymentStatusColor(order.payment_status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                            {order.delivery_date && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => viewOrderDetails(order)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm || selectedStatus !== "all" || selectedPaymentStatus !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "No orders have been placed yet"}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Order Details Modal */}
                {showOrderModal && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Order Details - {selectedOrder.order_number}
                                </h3>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Customer Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{selectedOrder.customer_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{selectedOrder.customer_email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{selectedOrder.customer_phone}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <span className="text-gray-900 dark:text-white">{selectedOrder.delivery_address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Order Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                                                {selectedOrder.payment_status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                                            <span className="text-gray-900 dark:text-white">{selectedOrder.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {new Date(selectedOrder.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {selectedOrder.delivery_date && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Delivery Date:</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {new Date(selectedOrder.delivery_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                <Image
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {item.product_name}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Quantity: {item.quantity} × NPR {item.unit_price.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    NPR {item.total_price.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Total */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount:</span>
                                    <span className="text-xl font-bold text-green-600">
                                        NPR {selectedOrder.total_amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        {selectedOrder.notes}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default OrdersPage;