import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import DeleteModal from "./DeleteModal";

interface ActionButtonsProps {
  id: string;
  type: "blog" | "product" | "order" | "customer" | "review" | "category";
  onView?: (id: string) => void;
  onEdit?: (id: string | any) => void; // Support both string and object
  onDelete?: (id: string) => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  style?: "icons" | "pills";
  className?: string;
}

export default function ActionButtons({
  id,
  type,
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
  size = "sm",
  layout = "horizontal",
  style = "icons",
  className = "",
}: ActionButtonsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  // Get the appropriate route for each type
  const getRoute = (action: "view" | "edit") => {
    switch (type) {
      case "blog":
        return `/blog/${id}${action === "edit" ? "/edit?section=blog" : ""}`;
      case "product":
        return `/products/${id}${action === "edit" ? "/edit?section=products" : ""}`;
      case "order":
        return `/orders/${id}`;
      case "customer":
        return `/customers/${id}`;
      case "review":
        return `/reviews/${id}`;
      case "category":
        return `/categories/${id}${action === "edit" ? "/edit?section=categories" : ""}`;
      default:
        return `/${type}/${id}${action === "edit" ? "/edit" : ""}`;
    }
  };

  // Button size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  };

  // Layout classes
  const layoutClasses = {
    horizontal: "flex gap-2",
    vertical: "flex flex-col gap-2",
  };

  const buttonClasses = `${sizeClasses[size]} font-medium rounded transition-colors`;

  const handleView = () => {
    if (onView) {
      onView(id);
      return; // Don't navigate if onView callback is provided
    }
    // Navigate to view route only if no onView callback
    window.location.href = getRoute("view");
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    } else {
      // Navigate to edit route
      window.location.href = getRoute("edit");
    }
  };

  const confirmEdit = () => {
    setLoading(true);
    if (onEdit) {
      onEdit(id);
    }
    setTimeout(() => {
      setLoading(false);
      setShowEditModal(false);
      window.location.href = getRoute("edit");
    }, 500);
  };

  const handleDelete = () => {
    if (onDelete) {
      setItemToDelete({ id, name: `${type} #${id.slice(0, 8)}` });
      setShowDeleteModal(true);
    } else {
      // Default delete behavior
      setItemToDelete({ id, name: `${type} #${id.slice(0, 8)}` });
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = () => {
    setLoading(true);
    if (onDelete) {
      onDelete(id);
    }
    setTimeout(() => {
      setLoading(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }, 500);
  };

  const getDeleteItemsList = (entityType: string) => {
    switch (entityType) {
      case "product":
        return [
          "Product from catalog",
          "Cover image and gallery images",
          "All customer reviews",
          "Related order items",
          "Discount associations",
        ];
      case "category":
        return [
          "Category from catalog",
          "All products in this category",
          "Related discounts and associations",
        ];
      case "blog":
        return [
          "Blog post and all content",
          "Comments and interactions",
          "SEO metadata and tags",
        ];
      case "order":
        return [
          "Order status and tracking",
          "Payment processing",
          "Inventory allocations",
        ];
      case "customer":
        return [
          "Customer profile and data",
          "Order history",
          "Payment information",
        ];
      case "review":
        return ["Review content", "Customer rating", "Associated product link"];
      default:
        return [`${entityType} and all related data`];
    }
  };

  return (
    <>
      <div className={layoutClasses[layout] + " " + className}>
        {showView &&
          (style === "pills" ? (
            <Link
              href={getRoute("view")}
              className={
                buttonClasses + " bg-purple-600 text-white hover:bg-purple-700"
              }
            >
              <Eye className="h-4 w-4" />
              View
            </Link>
          ) : (
            <button
              onClick={handleView}
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
          ))}

        {showEdit &&
          (style === "pills" ? (
            <button
              onClick={handleEdit}
              className={
                buttonClasses + " bg-blue-600 text-white hover:bg-blue-700"
              }
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          ))}

        {showDelete &&
          (style === "pills" ? (
            <button
              onClick={handleDelete}
              className={
                buttonClasses + " bg-red-600 text-white hover:bg-red-700"
              }
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={`Delete ${type}`}
        description="Are you sure you want to delete"
        itemName={itemToDelete?.name || ""}
        itemsToDelete={getDeleteItemsList(type)}
        isLoading={loading}
      />

      {/* Edit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={confirmEdit}
        title={`Edit ${type}`}
        message={`Are you sure you want to edit this ${type}?`}
        confirmText="Edit"
        cancelText="Cancel"
        type="edit"
        loading={loading}
      />
    </>
  );
}
