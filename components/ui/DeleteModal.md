# DeleteModal Component

A reusable, beautiful delete confirmation modal that can be used throughout your application instead of browser alerts.

## Features

- ✨ Beautiful, animated modal design
- 🌙 Dark mode support
- 📱 Responsive layout
- ⚡ Loading states with spinner
- 🎯 Customizable items to delete list
- ♿ Accessibility friendly
- 🔒 Type-safe with TypeScript

## Basic Usage

```tsx
import DeleteModal from "@/components/ui/DeleteModal";

function MyComponent() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    // Your delete logic here
    setDeleteLoading(true);
    try {
      await deleteItem(itemId);
      setShowDeleteModal(false);
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DeleteModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={handleDelete}
      title="Delete Item"
      description="Are you sure you want to delete"
      itemName="Item Name"
      isLoading={deleteLoading}
    />
  );
}
```

## Advanced Usage with Custom Items List

```tsx
<DeleteModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Delete Product"
  description="Are you sure you want to delete"
  itemName={product?.title || ""}
  itemsToDelete={[
    "Product from catalog",
    "Cover image and gallery images",
    "All customer reviews",
    "Related order items",
    "Discount associations"
  ]}
  isLoading={deleteLoading}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Controls modal visibility |
| `onClose` | `() => void` | ✅ | Called when modal is closed |
| `onConfirm` | `() => void` | ✅ | Called when delete is confirmed |
| `title` | `string` | ✅ | Modal title |
| `description` | `string` | ✅ | Main description text |
| `itemName` | `string` | ❌ | Name of the item being deleted |
| `itemsToDelete` | `string[]` | ❌ | List of items that will be deleted |
| `isLoading` | `boolean` | ❌ | Shows loading state during deletion |

## Examples in Your Codebase

### 1. Products Page (`/app/products/page.tsx`)
```tsx
<DeleteModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={confirmDelete}
  title="Delete Product"
  description="Are you sure you want to delete"
  itemName={productToDelete?.title || ""}
  itemsToDelete={[
    "Product from catalog",
    "Cover image and gallery images",
    "All customer reviews",
    "Related order items",
    "Discount associations"
  ]}
  isLoading={loading}
/>
```

### 2. Categories List (`/components/categories/CategoryList.tsx`)
```tsx
<DeleteModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={confirmDelete}
  title="Delete Category"
  description="Are you sure you want to delete"
  itemName={categoryToDelete?.name || ""}
  itemsToDelete={[
    "Category from catalog",
    "All products in this category",
    "Related discounts and associations"
  ]}
  isLoading={deleteLoading}
/>
```

### 3. Blog Posts (Example)
```tsx
<DeleteModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDeleteBlog}
  title="Delete Blog Post"
  description="Are you sure you want to delete"
  itemName={blogToDelete?.title || ""}
  itemsToDelete={[
    "Blog post and all content",
    "Comments and interactions",
    "SEO metadata and tags"
  ]}
  isLoading={deleteLoading}
/>
```

### 4. Orders (Example)
```tsx
<DeleteModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDeleteOrder}
  title="Cancel Order"
  description="Are you sure you want to cancel"
  itemName={`Order #${orderToDelete?.id || ""}`}
  itemsToDelete={[
    "Order status and tracking",
    "Payment processing",
    "Inventory allocations"
  ]}
  isLoading={deleteLoading}
/>
```

## Migration from Browser Alerts

### Before (using `confirm()`)
```tsx
const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this item?")) return;
  
  try {
    await deleteItem(id);
    toast.success("Item deleted!");
  } catch (error) {
    toast.error("Failed to delete item");
  }
};
```

### After (using DeleteModal)
```tsx
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
const [deleteLoading, setDeleteLoading] = useState(false);

const handleDeleteClick = (item: Item) => {
  setItemToDelete(item);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  if (!itemToDelete) return;
  
  try {
    setDeleteLoading(true);
    await deleteItem(itemToDelete.id);
    setShowDeleteModal(false);
    setItemToDelete(null);
    toast.success("Item deleted!");
  } catch (error) {
    toast.error("Failed to delete item");
  } finally {
    setDeleteLoading(false);
  }
};
```

## Styling

The modal uses Tailwind CSS classes and supports:
- Dark mode (`dark:` prefixes)
- Responsive design
- Smooth animations with Framer Motion
- Hover and focus states
- Loading states with spinner

## Best Practices

1. **Always show what will be deleted** - Use the `itemsToDelete` prop to be transparent
2. **Provide clear item names** - Use the `itemName` prop to show what's being deleted
3. **Handle loading states** - Use the `isLoading` prop during async operations
4. **Show success/error feedback** - Use toast notifications after deletion
5. **Be specific** - Customize the `itemsToDelete` list for each entity type

## Accessibility

- Keyboard navigation support (Escape to close, Enter to confirm)
- Focus management
- ARIA labels
- Screen reader friendly
- High contrast support in dark mode
