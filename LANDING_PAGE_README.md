# Matager — High-End SaaS Landing Page

This is the production-grade Next.js (App Router) + TypeScript landing page for **Matager**, designed with the precision and visual fidelity of top-tier SaaS marketing platforms (Linear, Stripe, Vercel, Framer).

---

## 1. Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v25.x)
- npm 9+

### Run Locally (Development)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 2. Configuration & Customization

### Configuring Storefront Redirect URL
The customer choice ("Yes — take me to the store") redirects through a branded skeleton iris transition to the storefront. You can change this URL in **`src/config/site.ts`**:

```typescript
// src/config/site.ts
export const SITE_CONFIG = {
  name: "Matager",
  tagline: "Commerce, without the noise.",
  // Update this to your deployed storefront URL or relative route:
  storefrontUrl: "/views/customerFastCart-view.html",
  ...
};
```

### Swapping Brand Assets
- **Emblem & Logo Animation**: The clean geometric mark and wordmark animation are located in **`src/components/brand/MatagerLogo.tsx`**. You can swap the SVG path definitions or update the linear gradient stops (`#3B82F6` and `#38BDF8`).
- **Favicon & Icons**: Located in `public/` and `views/assets/raw/favicon.png`.

---

## 3. Architecture & User Journey

1. **Stage 1 — Brand Overture (0–1.5s)**:
   - Pinned, zero-scroll hero canvas.
   - SVG stroke-dash draw animation + easing wordmark.
   - Fully respects `prefers-reduced-motion` (shows final state instantly).

2. **Stage 2 — The Gate**:
   - Pinned viewport (`100svh` with `100dvh` and `100vh` progressive fallbacks).
   - "Are you a customer?" question with two high-contrast tactile cards.
   - Cursor-aware magnetic highlight + full keyboard accessibility (`Tab`, `Space`, `Enter`).
   - Body scroll is **strictly locked** until the role choice is made.

3. **Stage 3A — Customer Path**:
   - Iris / blur-out transition (~400ms) with a branded skeleton preview (never flashes white).
   - Directs to `SITE_CONFIG.storefrontUrl`.

4. **Stage 3B — Insider Path (Owner / Employee)**:
   - Unlocks body scroll smoothly with **Lenis momentum scrolling**.
   - Gate section morphs into the 8-section product tour.
   - Slim sticky navigation bar fades into view.

5. **Scroll-Driven Product Tour**:
   - Single-trigger `IntersectionObserver` animations with 40–80ms stagger.
   - Live simulated UI hub, autonomous inventory meters, sales sparklines, role matrix, and pause-on-hover integration marquee.

6. **Unified Auth Experience**:
   - Shared-element transition modal for Store Owners & Staff.
   - Morphing role tabs without page reloads.
   - Owner multi-step onboarding + Staff invite code verification.
   - Wired to mock API endpoints (`/api/auth/login`, `/api/auth/register`).

---

## 4. Production Notes

- **Exclusion of `dummynavigator`**: As specified, `dummynavigator.js` was a static prototype switcher and is completely omitted from this production Next.js application.
- **Accessibility**: Full WCAG 2.2 AA conformance with high-contrast rings, touch targets ≥ 44px, and screen-reader polite live announcements via `LiveRegion`.
