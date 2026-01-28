import { Eye, Edit, Trash2 } from "lucide-react";

interface UserPayment {
  id: string;
  order_id: string;
  payment_option_id: string;
  amount: number;
  is_verified: boolean;
  transaction_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  payment_option?: {
    id: string;
    payment_type: string;
  };
  order?: {
    id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    order_status: string;
  };
}

interface PaymentActionButtonsProps {
  payment: UserPayment;
  onView?: (payment: UserPayment) => void;
  onEdit?: (payment: UserPayment) => void;
  onDelete?: (payment: UserPayment) => void;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export default function PaymentActionButtons({
  payment,
  onView,
  onEdit,
  onDelete,
  size = "sm",
  showLabels = false,
}: PaymentActionButtonsProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  const handleView = () => {
    if (onView) {
      onView(payment);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(payment);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(payment);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* View Button */}
      {onView && (
        <button
          onClick={handleView}
          className={`${buttonClasses[size]} text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors`}
          title="View Details"
        >
          <Eye className={sizeClasses[size]} />
          {showLabels && <span className="ml-1 text-xs">View</span>}
        </button>
      )}

      {/* Edit Button */}
      {onEdit && (
        <button
          onClick={handleEdit}
          className={`${buttonClasses[size]} text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors`}
          title="Edit Payment"
        >
          <Edit className={sizeClasses[size]} />
          {showLabels && <span className="ml-1 text-xs">Edit</span>}
        </button>
      )}

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className={`${buttonClasses[size]} text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors`}
          title="Delete Payment"
        >
          <Trash2 className={sizeClasses[size]} />
          {showLabels && <span className="ml-1 text-xs">Delete</span>}
        </button>
      )}
    </div>
  );
}
