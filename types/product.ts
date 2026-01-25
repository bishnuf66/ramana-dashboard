export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  images: string[];
  mainImage: string;
  category: Category;
  tags: string[];
  inStock: boolean;
  stockQuantity: number;
  features: string[];
  dimensions?: string;
  weight?: string;
  careInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  priceRange?: [number, number];
  inStock?: boolean;
  rating?: number;
  tags?: string[];
}

export interface ProductSort {
  field: "name" | "price" | "rating" | "createdAt";
  direction: "asc" | "desc";
}
