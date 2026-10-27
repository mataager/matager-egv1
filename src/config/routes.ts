/**
 * Application Navigation & Route Configuration
 *
 * Centralized source of truth for routing between Landing, Multi-Tenant Storefront,
 * Merchant Dashboard, POS Cashier, and Super Admin Governance.
 */

export const APP_ROUTES = {
  landing: process.env.NEXT_PUBLIC_LANDING_URL || "/",
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL || "/dashboard",
  cashier: process.env.NEXT_PUBLIC_CASHIER_URL || "/cashier",
  superAdmin: process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || "/admin",
  storefront: process.env.NEXT_PUBLIC_STOREFRONT_URL || "/storefront",
  staticStorefront: process.env.NEXT_PUBLIC_STOREFRONT_URL || "/storefront",
  home: "/",
} as const;

export const ROUTES = APP_ROUTES;
export const NAVIGATION_ROUTES = APP_ROUTES;

export type AppRoutes = typeof APP_ROUTES;

/**
 * Builds a dynamic URL for the customer-facing storefront scoped to a store and viewer ID.
 */
export function buildStorefrontUrl(storeId?: string, viewerId?: string): string {
  const base = APP_ROUTES.storefront;
  const params = new URLSearchParams();
  if (storeId) params.set("storeId", storeId);
  if (viewerId) params.set("viewerId", viewerId);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Builds a dynamic URL for the merchant dashboard scoped to a specific store ID.
 */
export function buildDashboardUrl(storeId?: string): string {
  const base = APP_ROUTES.dashboard;
  if (!storeId) return base;
  return `${base}?storeId=${encodeURIComponent(storeId)}`;
}

/**
 * Builds a dynamic URL for the POS Cashier scoped to a specific store ID.
 */
export function buildCashierUrl(storeId?: string): string {
  const base = APP_ROUTES.cashier;
  if (!storeId) return base;
  return `${base}?storeId=${encodeURIComponent(storeId)}`;
}

/**
 * Builds the Super Admin platform URL (single privileged governance console).
 */
export function buildSuperAdminUrl(): string {
  return APP_ROUTES.superAdmin;
}
