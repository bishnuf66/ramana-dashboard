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

export interface FavoriteProduct {
  id: number | string;
  title: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  addToFavorites: (product: FavoriteProduct) => void;
  removeFromFavorites: (id: number | string) => void;
  clearFavorites: () => void;
  isFavorite: (id: number | string) => boolean;
  getTotalFavorites: () => number;
  toggleFavorite: (product: FavoriteProduct) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(() => {
    if (typeof window !== "undefined") {
      const storedFavorites = localStorage.getItem("favorites");
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    }
    return [];
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
      setSynced(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userId) return;
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites, userId]);

  useEffect(() => {
    if (!userId || !synced) return;
    (async () => {
      const { error } = await supabase.from("user_favorites").upsert({
        user_id: userId,
        items: favorites,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error("favorites persist error", error);
    })();
  }, [favorites, userId, synced]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!userId) {
      const localFavs: FavoriteProduct[] =
        JSON.parse(localStorage.getItem("favorites") || "[]") || [];
      setFavorites(localFavs);
      setSynced(true);
      return;
    }

    const sync = async () => {
      const localFavs: FavoriteProduct[] =
        JSON.parse(localStorage.getItem("favorites") || "[]") || [];

      const { data: remoteRow, error } = await supabase
        .from("user_favorites")
        .select("items")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("favorites sync error", error);
        setSynced(true);
        return;
      }

      const remoteFavs: FavoriteProduct[] = remoteRow?.items || [];
      const map = new Map<string | number, FavoriteProduct>();
      [...remoteFavs, ...localFavs].forEach((fav) => {
        map.set(fav.id, fav);
      });
      const resolved = Array.from(map.values());

      setFavorites(resolved);
      setSynced(true);

      await supabase.from("user_favorites").upsert({
        user_id: userId,
        items: resolved,
        updated_at: new Date().toISOString(),
      });

      localStorage.removeItem("favorites");
    };

    sync();
  }, [userId]);

  const addToFavorites = useCallback((product: FavoriteProduct) => {
    setFavorites((prevFavorites) => {
      const existingFavorite = prevFavorites.find(
        (fav) => fav.id === product.id,
      );
      if (existingFavorite) {
        toast.info("Product already in favorites");
        return prevFavorites;
      }
      const withAddedAt: FavoriteProduct = {
        ...product,
        addedAt: product.addedAt || new Date().toISOString(),
      };
      return [...prevFavorites, withAddedAt];
    });
    toast.success(`${product.title} added to favorites`);
  }, []);

  const removeFromFavorites = useCallback((id: number | string) => {
    setFavorites((prevFavorites) => {
      const product = prevFavorites.find((fav) => fav.id === id);
      if (!product) {
        toast.error("Product not found in favorites");
        return prevFavorites;
      }
      return prevFavorites.filter((fav) => fav.id !== id);
    });
    toast.success("Product removed from favorites");
  }, []);

  const toggleFavorite = useCallback((product: FavoriteProduct) => {
    setFavorites((prevFavorites) => {
      const existingFavorite = prevFavorites.find(
        (fav) => fav.id === product.id,
      );
      if (existingFavorite) {
        // Remove from favorites
        toast.success("Product removed from favorites");
        return prevFavorites.filter((fav) => fav.id !== product.id);
      } else {
        // Add to favorites
        toast.success("Product added to favorites");
        const withAddedAt: FavoriteProduct = {
          ...product,
          addedAt: product.addedAt || new Date().toISOString(),
        };
        return [...prevFavorites, withAddedAt];
      }
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    toast.success("Favorites cleared");
  }, []);

  const isFavorite = useCallback(
    (id: number | string) => {
      return favorites.some((fav) => fav.id === id);
    },
    [favorites],
  );

  const getTotalFavorites = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  const value = useMemo(
    () => ({
      favorites,
      addToFavorites,
      removeFromFavorites,
      clearFavorites,
      isFavorite,
      getTotalFavorites,
      toggleFavorite,
    }),
    [favorites],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
