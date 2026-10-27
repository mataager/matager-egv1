/**
 * Application Navigation & Route Configuration
 *
 * Centralized source of truth for routing between the Landing page and
 * the Merchant Admin Dashboard. Allows single-variable configuration
 * via environment variables or direct code customization.
 *
 * Examples:
 * - Landing: http://localhost:3001/landing or /landing
 * - Dashboard: http://localhost:3001/dashboard or /dashboard
 */

export const APP_ROUTES = {
  landing: process.env.NEXT_PUBLIC_LANDING_URL || "/",
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL || "/dashboard",
  cashier: process.env.NEXT_PUBLIC_CASHIER_URL || "/cashier",
  superAdmin: process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || "/admin",
  storefront: process.env.NEXT_PUBLIC_STOREFRONT_URL || "/storefront",
  staticStorefront: "/views/customerFastCart-view.html",
  home: "/",
} as const;

export const ROUTES = APP_ROUTES;
export const NAVIGATION_ROUTES = APP_ROUTES;

export type AppRoutes = typeof APP_ROUTES;
