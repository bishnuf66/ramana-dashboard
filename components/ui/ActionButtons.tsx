import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface ActionButtonsProps {
  id: string;
  type: "blog" | "product" | "order" | "customer" | "review" | "category";
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
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
  // Get the appropriate route for each type
  const getRoute = (action: "view" | "edit") => {
    switch (type) {
      case "blog":
        return `/blog/${id}${action === "edit" ? "/edit" : ""}`;
      case "product":
        return `/products/${id}${action === "edit" ? "/edit" : ""}`;
      case "order":
        return `/orders/${id}`;
      case "customer":
        return `/customers/${id}`;
      case "review":
        return `/reviews/${id}`;
      case "category":
        return `/categories/${id}${action === "edit" ? "/edit" : ""}`;
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
    } else {
      // Navigate to view route
      window.location.href = getRoute("view");
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    } else {
      // Navigate to edit route
      window.location.href = getRoute("edit");
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else {
      // Default delete behavior
      if (confirm("Are you sure you want to delete this " + type + "?")) {
        console.log("Delete " + type + " with id: " + id);
      }
    }
  };

  return (
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
            onClick={() => (window.location.href = getRoute("view"))}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
        ))}

      {showEdit &&
        (style === "pills" ? (
          <Link
            href={getRoute("edit")}
            className={
              buttonClasses + " bg-blue-600 text-white hover:bg-blue-700"
            }
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        ) : (
          <Link
            href={getRoute("edit")}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Link>
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
  );
}
