"use client";

import { useState } from "react";
import OrderTable from "@/components/orders/OrderTable";
import OrderViewModal from "@/components/orders/OrderViewModal";
import type { Database } from "@/types/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export default function OrdersDashboardPage() {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <OrderTable onViewOrder={handleViewOrder} />

      <OrderViewModal
        isOpen={showOrderModal}
        onClose={handleCloseOrderModal}
        order={selectedOrder}
      />
    </div>
  );
}
