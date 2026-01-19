"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { ProductType } from "../types/ProductType";

interface CartContextType {
  cart: ProductType[];
  addToCart: (product: ProductType) => void;
  increaseQuantity: (id: number | string) => void;
  decreaseQuantity: (id: number | string) => void;
  removeFromCart: (id: number | string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<ProductType[]>(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  // Track auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
      setSynced(false); // re-sync on login/logout
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Persist to Supabase when logged in
  useEffect(() => {
    if (!userId || !synced) return;
    (async () => {
      const { error } = await supabase.from("user_cart").upsert({
        user_id: userId,
        items: cart,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error("cart persist error", error);
    })();
  }, [cart, userId, synced]);

  // Initial sync between local and remote on login
  useEffect(() => {
    if (!userId) {
      setSynced(true);
      return;
    }
    const sync = async () => {
      const localCart: ProductType[] =
        (typeof window !== "undefined" &&
          JSON.parse(localStorage.getItem("cart") || "[]")) ||
        [];

      const { data: remoteRow, error } = await supabase
        .from("user_cart")
        .select("items")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("cart sync error", error);
        setSynced(true);
        return;
      }

      const remoteCart: ProductType[] = remoteRow?.items || [];

      const same =
        JSON.stringify(localCart ?? []) === JSON.stringify(remoteCart ?? []);

      if (!remoteRow) {
        setCart(localCart);
        setSynced(true);
        await supabase
          .from("user_cart")
          .upsert({
            user_id: userId,
            items: localCart,
            updated_at: new Date().toISOString(),
          });
        return;
      }

      if (same) {
        setCart(remoteCart);
        setSynced(true);
        return;
      }

      // Ask user: db / local / merge
      const choice =
        typeof window !== "undefined"
          ? window.prompt(
              "Your cart differs between this device and your account.\nType one: 'db' (use account), 'local' (use this device), or 'merge'.",
              "merge",
            )
          : "merge";

      let resolved = remoteCart;
      if (choice === "local") {
        resolved = localCart;
      } else if (choice === "merge") {
        const map = new Map<string | number, ProductType>();
        [...remoteCart, ...localCart].forEach((item) => {
          const existing = map.get(item.id);
          if (existing) {
            map.set(item.id, {
              ...existing,
              quantity: existing.quantity + item.quantity,
            });
          } else {
            map.set(item.id, item);
          }
        });
        resolved = Array.from(map.values());
      }

      setCart(resolved);
      setSynced(true);
      await supabase
        .from("user_cart")
        .upsert({
          user_id: userId,
          items: resolved,
          updated_at: new Date().toISOString(),
        });
    };

    sync();
  }, [userId]);

  const addToCart = useCallback((product: ProductType) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      return [...prevCart, product];
    });
    toast.success(`${product.title} added to cart`);
  }, []);

  const increaseQuantity = useCallback((id: number | string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    toast.success("Quantity increased");
  }, []);

  const decreaseQuantity = useCallback((id: number | string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
    toast.success("Quantity decreased");
  }, []);

  const removeFromCart = useCallback((id: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    toast.error("Item removed from cart");
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    toast.error("Cart cleared");
  }, []);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      getTotalPrice,
      getTotalItems,
    }),
    [
      cart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      getTotalPrice,
      getTotalItems,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
