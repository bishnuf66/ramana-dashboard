# Discount System Setup Guide

## 🚀 Quick Start

The TypeScript errors you're seeing are **expected** because the database migrations haven't been run yet. Here's how to fix everything:

## 📋 Step 1: Run Database Migrations

### In Supabase Dashboard:
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Run these files in order:

```sql
-- First, run the main discount system
-- Copy contents of: database/migrations/20240123_create_discount_system.sql

-- Then, run the product-specific extensions
-- Copy contents of: database/migrations/20240123_add_product_specific_coupons.sql
```

## 📋 Step 2: Update Database Types

After running migrations, regenerate your types:

```bash
# In your project root
npx supabase gen types types/database.types.ts
```

## 📋 Step 3: Verify Setup

The TypeScript errors should disappear once you:
1. ✅ Run the migrations
2. ✅ Update database types
3. ✅ Restart your development server

## 🎯 How to Use Product-Specific Coupons

### Example 1: Create a Product-Specific Coupon

```typescript
import { DiscountService } from '@/lib/discounts/DiscountService';

// Create a coupon for specific products
const couponId = await DiscountService.createCoupon({
  code: 'SUMMER25',
  description: '25% off summer collection',
  discount_type: 'percentage',
  discount_value: 25,
  is_product_specific: true,
  product_inclusion_type: 'include',
  expires_at: '2024-12-31'
});

// Add products to the coupon
await DiscountService.addProductsToCoupon(couponId, [
  'product-uuid-1', // Replace with actual product IDs
  'product-uuid-2'
]);
```

### Example 2: Validate Coupon for Cart

```typescript
// Cart items from your shopping cart
const cartItems = [
  { product_id: 'product-uuid-1', price: 50, quantity: 2 },
  { product_id: 'product-uuid-3', price: 30, quantity: 1 }
];

// Validate coupon
const result = await DiscountService.validateCouponForCart(
  'SUMMER25',
  'customer@example.com',
  cartItems
);

if (result.valid) {
  console.log(`Discount applied: $${result.discount_amount}`);
  console.log(`Applicable products:`, result.applicable_products);
} else {
  console.log(`Error: ${result.message}`);
}
```

### Example 3: Get Available Coupons

```typescript
// Get all active coupons
const coupons = await DiscountService.getAvailableCoupons();

// Get only product-specific coupons
const productCoupons = await DiscountService.getProductSpecificCoupons();

// Get first-time customer coupons
const firstTimeCoupons = await DiscountService.getFirstTimeCoupons();
```

## 🎯 Pre-loaded Coupons

After running migrations, you'll have these ready-to-use coupons:

### First-Time User Coupons:
- **`FIRST10`** - 10% off for first-time customers
- **`WELCOME15`** - 15% off for new customers over $50

### Product-Specific Coupons:
- **`PRODUCT25`** - 25% off on selected products
- **`SPECIAL10`** - $10 off on selected products (min $50)
- **`EXCLUDE15`** - 15% off excluding clearance items

## 🔧 Common Use Cases

### 1. Promote Specific Products
```typescript
// Create coupon for summer collection
await DiscountService.createCoupon({
  code: 'SUMMER30',
  description: '30% off summer collection',
  is_product_specific: true,
  product_inclusion_type: 'include'
});

// Add summer products
const summerProducts = ['product-1', 'product-2', 'product-3'];
await DiscountService.addProductsToCoupon(couponId, summerProducts);
```

### 2. Exclude Clearance Items
```typescript
// Create coupon that excludes clearance
await DiscountService.createCoupon({
  code: 'SAVE20',
  description: '20% off everything except clearance',
  is_product_specific: true,
  product_inclusion_type: 'exclude'
});

// Add clearance items to exclude
const clearanceProducts = ['clearance-1', 'clearance-2'];
await DiscountService.addProductsToCoupon(couponId, clearanceProducts);
```

### 3. Bundle Deals
```typescript
// Create coupon for bundle purchase
await DiscountService.createCoupon({
  code: 'BUNDLE15',
  description: '15% off when buying 3+ items',
  discount_type: 'percentage',
  discount_value: 15,
  minimum_order_amount: 100,
  is_product_specific: true,
  product_inclusion_type: 'include'
});
```

## 🛠️ Troubleshooting

### TypeScript Errors After Setup:
```bash
# If you still see errors, try:
npx supabase gen types types/database.types.ts --force
npm run dev
```

### Migration Issues:
- Make sure you run the SQL files in the correct order
- Check that all tables were created successfully
- Verify indexes and policies were applied

### Common Issues:
1. **"Cannot find table 'coupons'"** → Run the first migration
2. **"Function validate_coupon doesn't exist"** → Run the second migration
3. **Type errors persist** → Regenerate database types

## 📊 Analytics & Tracking

### Get Coupon Statistics:
```typescript
const stats = await DiscountService.getCouponStats();
console.log({
  totalCoupons: stats.totalCoupons,
  activeCoupons: stats.activeCoupons,
  productSpecificCoupons: stats.productSpecificCoupons,
  totalUsage: stats.totalUsage
});
```

### Track Coupon Usage:
```typescript
// After order completion
await DiscountService.applyCouponUsage(
  couponId,
  customerEmail,
  orderId,
  discountAmount
);
```

## 🎉 Success!

Once you complete the setup, you'll have:
- ✅ Full discount management system
- ✅ Product-specific coupon support
- ✅ First-time user discounts
- ✅ Admin dashboard integration
- ✅ Complete analytics tracking

Your discount system is now ready to boost conversions! 🚀
