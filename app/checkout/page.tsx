"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/components/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCart();

  const total = useMemo(() => getTotalPrice(), [getTotalPrice]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
  });

  useEffect(() => {
    if (cart.length === 0) return;

    const load = async () => {
      try {
        setLoadingProfile(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setForm((prev) => ({
            ...prev,
            customer_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.display_name ||
              prev.customer_name,
            customer_email: user.email || prev.customer_email,
            customer_phone: user.user_metadata?.phone || prev.customer_phone,
            shipping_address:
              user.user_metadata?.address || prev.shipping_address,
          }));
        }
      } catch (e) {
        // no-op
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart.length, router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) return;

    if (!form.customer_name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.customer_email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!form.shipping_address.trim()) {
      toast.error("Please enter your shipping address");
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        customer_phone: form.customer_phone.trim() || null,
        shipping_address: form.shipping_address.trim(),
        total_amount: total,
        items: cart,
        status: "pending" as const,
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select("id")
        .single();

      if (error) throw error;

      clearCart();
      router.push(`/order-success?orderId=${data.id}`);
    } catch (error: any) {
      console.error("Order create error:", error);
      toast.error(error?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Complete your order details.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
            <span>Items</span>
            <span>{cart.length}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Shipping & Contact
          </h2>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                value={form.customer_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customer_name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your name"
                disabled={loadingProfile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.customer_email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customer_email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="you@example.com"
                disabled={loadingProfile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone (optional)
              </label>
              <input
                value={form.customer_phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customer_phone: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="98XXXXXXXX"
                disabled={loadingProfile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shipping Address
              </label>
              <textarea
                value={form.shipping_address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, shipping_address: e.target.value }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Full address"
                disabled={loadingProfile}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Placing..." : "Place Order"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/cart")}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Back to Cart
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
