# Task 5 - Sales Integration Agent

## Task: Ensure Sales from PDV Appear in Sales Dashboard

### Changes Made

1. **`/src/lib/hooks.ts`** — Added `useServices` hook with `ServiceItem` interface, typed `ProductItem` interface and `useProducts`, added `partial_refund` to `statusLabel()` and `statusColor()`

2. **`/src/components/beauty-pro/finance/pdv-view.tsx`** — Complete rewrite:
   - Removed `mockCatalog` hardcoded data
   - Uses real API data via `useServices()` and `useProducts()` hooks
   - Added catalog filter tabs (All/Services/Products)
   - Added loading skeleton and empty state
   - Shows duration for services, stock level for products
   - Enhanced query invalidation (added `clients` and `products`)

3. **Sales History and Dashboard** — Verified working correctly:
   - `useSales()` fetches from `/api/sales`, query key matches PDV invalidation
   - Dashboard returns `recentSales`, `RecentSalesCard` renders them properly
   - All query invalidations in place after PDV sale creation

### Lint Status
All lint checks pass. Server stable on port 3000.
