"use client";

import { useState } from "react";
import OrderTable from "@/components/orders/OrderTable";
import OrderViewModal from "@/components/orders/OrderViewModal";
import OrderEditModal from "@/components/orders/OrderEditModal";
import type { Database } from "@/types/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export default function OrdersDashboardPage() {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    // Update the selected order with the new data
    setSelectedOrder(updatedOrder);
    // The table will automatically refresh due to query invalidation in the hook
  };

  return (
    <div className="space-y-6">
      <OrderTable onViewOrder={handleViewOrder} onEditOrder={handleEditOrder} />

      <OrderViewModal
        isOpen={showOrderModal}
        onClose={handleCloseOrderModal}
        order={selectedOrder}
      />

      <OrderEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        order={selectedOrder}
        onUpdate={handleOrderUpdated}
      />
    </div>
  );
}
