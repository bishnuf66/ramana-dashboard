export interface Category {
  id: string;
  name: string;
  slug: string;
  picture?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  picture?: string | null;
}
