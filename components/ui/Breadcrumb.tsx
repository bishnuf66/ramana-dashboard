"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    // Always start with Home/Dashboard
    items.push({
      label: "Dashboard",
      href: "/dashboard",
      isCurrent: pathname === "/dashboard",
    });

    // Get current section from search params
    const section = searchParams.get("section");

    // Handle dashboard sections
    if (section && pathname === "/dashboard") {
      const sectionLabels: Record<string, string> = {
        analytics: "Analytics",
        products: "Products",
        orders: "Orders",
        customers: "Customers",
        reviews: "Reviews",
        blog: "Blog",
        categories: "Categories",
        discounts: "Coupons",
        testimonials: "Testimonials",
        "payment-options": "Payment Options",
        payments: "Payments",
        support: "Support",
        settings: "Settings",
      };

      if (sectionLabels[section]) {
        items.push({
          label: sectionLabels[section],
          href: `/dashboard?section=${section}`,
          isCurrent: false,
        });
      }
    }

    // Handle dynamic routes
    const pathSegments = pathname.split("/").filter(Boolean);

    if (pathSegments.length > 1) {
      // Handle specific page routes
      if (pathSegments[0] === "products") {
        if (pathSegments[1] === "new") {
          items.push({
            label: "Products",
            href: "/dashboard?section=products",
            isCurrent: false,
          });
          items.push({
            label: "Add Product",
            href: "/products/new",
            isCurrent: true,
          });
        } else if (pathSegments[1] === "edit") {
          items.push({
            label: "Products",
            href: "/dashboard?section=products",
            isCurrent: false,
          });
          items.push({
            label: "Edit Product",
            href: pathname,
            isCurrent: true,
          });
        }
      }

      if (pathSegments[0] === "discounts") {
        if (pathSegments[1] === "new") {
          items.push({
            label: "Coupons",
            href: "/dashboard?section=discounts",
            isCurrent: false,
          });
          items.push({
            label: "Add Coupon",
            href: "/discounts/new",
            isCurrent: true,
          });
        } else if (pathSegments[1] === "edit") {
          items.push({
            label: "Coupons",
            href: "/dashboard?section=discounts",
            isCurrent: false,
          });
          items.push({
            label: "Edit Coupon",
            href: pathname,
            isCurrent: true,
          });
        }
      }

      if (pathSegments[0] === "blog") {
        if (pathSegments[1] === "new") {
          items.push({
            label: "Blog",
            href: "/dashboard?section=blog",
            isCurrent: false,
          });
          items.push({
            label: "Add Blog Post",
            href: "/blog/new",
            isCurrent: true,
          });
        } else if (pathSegments[1] === "edit") {
          items.push({
            label: "Blog",
            href: "/dashboard?section=blog",
            isCurrent: false,
          });
          items.push({
            label: "Edit Blog Post",
            href: pathname,
            isCurrent: true,
          });
        }
      }

      if (pathSegments[0] === "categories") {
        if (pathSegments[1] === "new") {
          items.push({
            label: "Categories",
            href: "/dashboard?section=categories",
            isCurrent: false,
          });
          items.push({
            label: "Add Category",
            href: "/categories/new",
            isCurrent: true,
          });
        } else if (pathSegments[1] === "edit") {
          items.push({
            label: "Categories",
            href: "/dashboard?section=categories",
            isCurrent: false,
          });
          items.push({
            label: "Edit Category",
            href: pathname,
            isCurrent: true,
          });
        }
      }

      if (pathSegments[0] === "testimonials") {
        if (pathSegments[1] === "new") {
          items.push({
            label: "Testimonials",
            href: "/dashboard?section=testimonials",
            isCurrent: false,
          });
          items.push({
            label: "Add Testimonial",
            href: "/testimonials/new",
            isCurrent: true,
          });
        } else if (pathSegments[1] === "edit") {
          items.push({
            label: "Testimonials",
            href: "/dashboard?section=testimonials",
            isCurrent: false,
          });
          items.push({
            label: "Edit Testimonial",
            href: pathname,
            isCurrent: true,
          });
        }
      }

      if (pathSegments[0] === "payments") {
        if (pathSegments[1] === "new") {
          items.push({
            label: "Payments",
            href: "/dashboard?section=payments",
            isCurrent: false,
          });
          items.push({
            label: "Add Payment",
            href: "/payments/new",
            isCurrent: true,
          });
        } else if (pathSegments[1] === "edit") {
          items.push({
            label: "Payments",
            href: "/dashboard?section=payments",
            isCurrent: false,
          });
          items.push({
            label: "Edit Payment",
            href: pathname,
            isCurrent: true,
          });
        }
      }
    }

    // Handle login page
    if (pathname === "/login") {
      return [
        {
          label: "Login",
          href: "/login",
          isCurrent: true,
        },
      ];
    }

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on login page
  if (pathname === "/login") {
    return null;
  }

  // Don't show breadcrumbs if only dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.slice(1).map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.isCurrent ? (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
