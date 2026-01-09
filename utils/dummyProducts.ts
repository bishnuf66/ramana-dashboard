export interface Product {
  id: number;
  image: string;
  price: number;
  discountPrice?: number;
  rating: number;
  title: string;
  description?: string;
}

export const products: Product[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    price: 2500,
    discountPrice: 2200,
    rating: 4.9,
    title: "Classic Red Roses",
    description:
      "Elegant handcrafted bouquet of premium red roses, perfect for romantic occasions.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    price: 2200,
    discountPrice: 1950,
    rating: 4.8,
    title: "Garden Pink Roses",
    description:
      "Beautiful pink roses arranged with delicate greenery for a soft, romantic touch.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    price: 2800,
    discountPrice: 2500,
    rating: 5.0,
    title: "Rainbow Mix Bouquet",
    description:
      "Vibrant mixed flower bouquet with roses, lilies, and seasonal blooms.",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    price: 2300,
    discountPrice: 2100,
    rating: 4.7,
    title: "Pastel Dreams",
    description:
      "Soft pastel colored flowers creating a dreamy, elegant arrangement.",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    price: 2600,
    discountPrice: 2400,
    rating: 4.9,
    title: "White Lily Elegance",
    description:
      "Sophisticated white lilies with complementary flowers for special occasions.",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    price: 4500,
    discountPrice: 4200,
    rating: 5.0,
    title: "Bridal Bliss",
    description:
      "Luxurious bridal bouquet with premium white and cream flowers.",
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    price: 2400,
    discountPrice: 2150,
    rating: 4.6,
    title: "Birthday Sunshine",
    description:
      "Bright and cheerful yellow and orange flowers perfect for celebrations.",
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    price: 1900,
    discountPrice: 1650,
    rating: 4.5,
    title: "Seasonal Wildflowers",
    description:
      "Natural wildflower arrangement with seasonal blooms and rustic charm.",
  },
];
