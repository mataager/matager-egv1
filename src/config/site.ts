import { APP_ROUTES } from "./routes";

export const SITE_CONFIG = {
  name: "Matager",
  tagline: "Commerce, without the noise.",
  description:
    "The unified store management platform. Build your storefront, streamline inventory, track sales in real-time, and empower your team — all through one connected workspace.",
  // Centralized route variables for navigation
  landingUrl: APP_ROUTES.landing,
  dashboardUrl: APP_ROUTES.dashboard,
  storefrontUrl: APP_ROUTES.storefront,
  routes: APP_ROUTES,
  navLinks: [
    { label: "Product", href: "#product-overview" },
    { label: "Inventory", href: "#inventory-intelligence" },
    { label: "Sales & POS", href: "#sales-orders" },
    { label: "Team", href: "#team-roles" },
    { label: "Analytics", href: "#analytics-engine" },
  ],
};

