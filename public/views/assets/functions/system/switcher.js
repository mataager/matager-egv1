// switcher.js
// Gallery ⇄ Cart presentation switcher for the Peacock storefront.
//
// Layout engine:
//   • Bento / magazine grid — repeating rhythm of tile sizes. Now supports
//     8 distinct tile shapes (square, tall, extra-tall, wide, extra-wide,
//     feature, hero, banner) with a longer, more varied rhythm.
//     Uses grid-auto-flow: dense so there are never holes.
//
// Behaviour (unchanged):
//   • The overlay with ALL product data is ALWAYS visible by default.
//   • The "Show Collection" button only appears on hover (desktop) or
//     when a tile is active (touch).
//   • Clicking anywhere on the card = clicking "Show Collection".
//   • The doc panel is NEVER hidden — it floats on top of the gallery.
//   • Only the return badge exits gallery mode.

(function () {
  "use strict";

  const STYLE_ID = "peacock-switcher-styles";
  const BADGE_ID = "peacock-return-badge";
  const GALLERY_ID = "fullscreen-gallery-wrapper";

  /* ═══════════════════════════════════════════════════════════════════
     0. GALLERY ASSET SOURCES  ← EDIT THIS
     ═══════════════════════════════════════════════════════════════════
     Point the gallery at your image folder. Files below are laid out
     using the bento rhythm further down (the order matters — big
     shapes like "g-hero" / "g-banner" look best on hero imagery).

     ▸ Edit GALLERY_ASSET_FILES to match the files in assets/gallery/
     ▸ Or override at runtime *before* this script loads:
         window.PeacockGalleryAssets = [
           "assets/gallery/hero.jpg",
           "assets/gallery/ring-1.jpg",
           ...
         ];
     ═══════════════════════════════════════════════════════════════════ */
  const GALLERY_ASSET_DIR = "assets/gallery/";
  const GALLERY_ASSET_FILES = [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "7.jpg",
    "8.jpg",
    "9.jpg",
    "10.jpg",
    "11.jpg",
    "12.jpg",
    "13.jpg",
    "14.jpg",
    "15.jpg",
    "16.jpg",
    "17.jpg",
    "18.jpg",
    "19.jpg",
    "20.jpg",
    "21.jpg",
    "22.jpg",
    "23.jpg",
    "24.jpg",
    "25.jpg",
    "26.jpg",
    "27.jpg",
    "28.jpg",
    "29.jpg",
    "30.jpg",
    "31.jpg",
    "32.jpg",
    "33.jpg",
    "34.jpg",
    "35.jpg",
    "36.jpg",
    "37.jpg",
    "38.jpg",
    "39.jpg",
    "40.jpg",
    "41.jpg",
    "42.jpg",
    "43.jpg",
    "44.jpg",
    "45.jpg",
    "46.jpg",
    "47.jpg",
    "48.jpg",
  ];

  function galleryAssetList() {
    if (
      Array.isArray(window.PeacockGalleryAssets) &&
      window.PeacockGalleryAssets.length
    ) {
      return window.PeacockGalleryAssets.slice();
    }
    return GALLERY_ASSET_FILES.map(function (f) {
      return GALLERY_ASSET_DIR + f;
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     1. CSS
     ═══════════════════════════════════════════════════════════════════ */
  const CSS = `
        /* ═══ Animated Infinity Border on Hero Button ═══ */
        .store-hero-btn.is-primary {
            position: relative;
            border: 2px solid transparent;
            background: linear-gradient(#17171a, #17171a) padding-box,
                        linear-gradient(90deg, #3b82f6, #10b981, #3b82f6) border-box;
            background-size: 200% 100%;
            animation: borderFlow 3s linear infinite;
            transition: background 0.3s ease;
        }
        .store-hero-btn.is-primary:hover {
            background: linear-gradient(#232323, #232323) padding-box,
                        linear-gradient(90deg, #10b981, #3b82f6, #10b981) border-box;
            background-size: 200% 100%;
        }
        @keyframes borderFlow {
            0% { background-position: 0% 0; }
            100% { background-position: 200% 0; }
        }

        /* ═══════════════════════════════════════════════════════════════
           Antigravity 3D Depth-of-Field Parallax
           ═══════════════════════════════════════════════════════════════ */
        .matager-customer-shell {
            perspective: 1200px;
            transform-style: preserve-3d;
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        body.is-gallery-active .matager-customer-shell {
            transform: scale(0.95) translateZ(-50px) !important;
            filter: blur(4px) brightness(0.7) !important;
            pointer-events: none;
        }

        /* ═══ Fullscreen Gallery — below the doc ═══ */
        #${GALLERY_ID} {
            position: fixed;
            inset: 0;
            z-index: 9970;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            background: #050505;
            transform: translateY(100%);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                        opacity 0.5s ease;
        }
        body.is-gallery-active #${GALLERY_ID} {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        body.is-gallery-active { overflow: hidden; }

        /* ═══ Return badge — ABOVE the doc bar ═══ */
        #${BADGE_ID} {
            position: fixed;
            left: 50%;
            bottom: calc(75px + env(safe-area-inset-bottom, 0px));
            transform: translateX(-50%) translateY(28px);
            z-index: 9970;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 11px 22px;
            border-radius: 25px 25px 5px 5px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: #e8e8ec;
            color: #000;
            font-family: "Inter", system-ui, -apple-system, sans-serif;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.04em;
            white-space: nowrap;
            cursor: pointer;
            opacity: 0;
            pointer-events: none;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, background 0.2s ease;
        }
        #${BADGE_ID} i { font-size: 13px; }
        body.is-gallery-active #${BADGE_ID} {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        #${BADGE_ID}:hover {
            transform: translateX(-50%) translateY(0) scale(1.05);
        }
        #${BADGE_ID}:active {
            transform: translateX(-50%) translateY(0) scale(0.96);
        }
        body.sticky-cta-open #${BADGE_ID} {
            opacity: 0;
            pointer-events: none;
            transform: translateX(-50%) translateY(14px);
        }

        /* ═══════════════════════════════════════════════════════════════
           BENTO GRID
           ═══════════════════════════════════════════════════════════════ */
        #${GALLERY_ID} .gallery-content {
            width: 100%;
            min-height: 100%;
        }
        #${GALLERY_ID} .gallery-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: calc((100vw - 4px) / 3);
            gap: 2px;
            grid-auto-flow: dense;
            width: 100%;
            padding-bottom: calc(140px + env(safe-area-inset-bottom, 0px));
            background: #050505;
        }
        @media (min-width: 768px) {
            #${GALLERY_ID} .gallery-grid {
                grid-template-columns: repeat(4, 1fr);
                grid-auto-rows: calc((100vw - 6px) / 4);
            }
        }
        @media (min-width: 1024px) {
            #${GALLERY_ID} .gallery-grid {
                grid-template-columns: repeat(5, 1fr);
                grid-auto-rows: calc((100vw - 8px) / 5);
            }
        }

        /* ═══ Tile spans — 8 shapes ═══ */
        #${GALLERY_ID} .gallery-item.g-sq     { /* 1 × 1 — default */ }
        #${GALLERY_ID} .gallery-item.g-tall   { grid-row: span 2; }             /* 1 × 2 */
        #${GALLERY_ID} .gallery-item.g-xtall  { grid-row: span 3; }             /* 1 × 3 */
        #${GALLERY_ID} .gallery-item.g-wide   { grid-column: span 2; }          /* 2 × 1 */
        #${GALLERY_ID} .gallery-item.g-xwide  { grid-column: span 3; }          /* 3 × 1 banner strip */
        #${GALLERY_ID} .gallery-item.g-feat   { grid-column: span 2; grid-row: span 2; } /* 2 × 2 */
        #${GALLERY_ID} .gallery-item.g-hero   { grid-column: span 2; grid-row: span 3; } /* 2 × 3 */
        #${GALLERY_ID} .gallery-item.g-banner { grid-column: span 3; grid-row: span 2; } /* 3 × 2 */

        /* ═══ Tile base ═══ */
        #${GALLERY_ID} .gallery-item {
            position: relative;
            overflow: hidden;
            cursor: pointer;
            background: #121212;
            border-radius: 0;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            transform: translateZ(0);
            transition: z-index 0s;
        }
        #${GALLERY_ID} .gallery-item img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1),
                        filter 0.4s ease;
            will-change: transform;
        }
        #${GALLERY_ID} .gallery-item:hover img,
        #${GALLERY_ID} .gallery-item.active img {
            transform: scale(1.07);
            filter: brightness(0.72) saturate(1.05);
        }
        /* gold inner glow on hover */
        #${GALLERY_ID} .gallery-item::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            box-shadow: inset 0 0 0 0 rgba(212, 175, 55, 0);
            transition: box-shadow 0.35s ease;
            z-index: 3;
        }
        #${GALLERY_ID} .gallery-item:hover::after,
        #${GALLERY_ID} .gallery-item.active::after {
            box-shadow: inset 0 0 0 2px rgba(212, 175, 55, 0.9);
        }
        #${GALLERY_ID} .gallery-item:hover,
        #${GALLERY_ID} .gallery-item.active,
        #${GALLERY_ID} .gallery-item:focus-within {
            z-index: 2;
        }

        /* ═══════════════════════════════════════════════════════════════
           OVERLAY — ALWAYS VISIBLE BY DEFAULT
           ═══════════════════════════════════════════════════════════════ */
        #${GALLERY_ID} .gallery-overlay {
            position: absolute;
            inset: 0;
            z-index: 4;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            gap: 5px;
            padding: 14px 12px 12px;
            background: linear-gradient(
                to top,
                rgba(0, 0, 0, 0.97) 0%,
                rgba(0, 0, 0, 0.86) 40%,
                rgba(0, 0, 0, 0.35) 75%,
                rgba(0, 0, 0, 0) 100%
            );
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            transition: background 0.35s ease;
        }
        #${GALLERY_ID} .gallery-overlay::-webkit-scrollbar {
            width: 0; height: 0; display: none;
        }
        #${GALLERY_ID} .gallery-item:hover .gallery-overlay,
        #${GALLERY_ID} .gallery-item.active .gallery-overlay {
            background: linear-gradient(
                to top,
                rgba(0, 0, 0, 0.98) 0%,
                rgba(0, 0, 0, 0.92) 45%,
                rgba(0, 0, 0, 0.55) 80%,
                rgba(0, 0, 0, 0.1) 100%
            );
        }

        /* ═══ Typography ═══ */
        #${GALLERY_ID} .gallery-brand {
            font-family: "Inter", sans-serif;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #60a5fa;
            line-height: 1;
        }
        #${GALLERY_ID} .gallery-title {
            font-family: "Inter", sans-serif;
            font-size: 12px;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            color: #fff;
            margin: 0;
        }
        #${GALLERY_ID} .gallery-subtitle {
            font-size: 9.5px;
            font-weight: 500;
            line-height: 1.3;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
        }
        #${GALLERY_ID} .gallery-price-row {
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 1px;
        }
        #${GALLERY_ID} .gallery-price {
            font-size: 12px;
            font-weight: 800;
            color: #fff;
            letter-spacing: -0.01em;
        }
        #${GALLERY_ID} .gallery-old-price {
            font-size: 9px;
            color: rgba(255, 255, 255, 0.4);
            text-decoration: line-through;
        }
        #${GALLERY_ID} .gallery-discount {
            font-size: 8px;
            font-weight: 800;
            color: #fca5a5;
            background: rgba(239, 68, 68, 0.2);
            padding: 2px 7px;
            border-radius: 999px;
            letter-spacing: 0.04em;
        }
        #${GALLERY_ID} .gallery-stars {
            display: flex;
            align-items: center;
            gap: 2px;
            font-size: 8.5px;
            color: #facc15;
            font-weight: 700;
            line-height: 1;
        }
        #${GALLERY_ID} .gallery-stars small {
            color: rgba(255, 255, 255, 0.5);
            font-weight: 600;
            font-size: 8.5px;
            margin-left: 3px;
        }
        #${GALLERY_ID} .gallery-desc {
            margin: 1px 0 0;
            font-size: 9px;
            line-height: 1.4;
            color: rgba(255, 255, 255, 0.62);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        #${GALLERY_ID} .gallery-meta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
            margin-top: 2px;
        }
        #${GALLERY_ID} .gallery-chip {
            font-size: 7.5px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.14);
            color: rgba(255, 255, 255, 0.8);
            white-space: nowrap;
        }

        /* ═══════════════════════════════════════════════════════════════
           "Show Collection" button — HIDDEN by default, revealed on hover
           ═══════════════════════════════════════════════════════════════ */
        #${GALLERY_ID} .gallery-btn {
            margin-top: 8px;
            align-self: flex-start;
            padding: 8px 16px;
            border: none;
            border-radius: 999px;
            background: #fff;
            color: #000;
            font-family: "Inter", sans-serif;
            font-size: 8.5px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            width: fit-content;
            cursor: pointer;

            opacity: 0;
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
            margin-top: 0;
            overflow: hidden;
            transform: translateY(6px);

            transition: opacity 0.3s ease,
                        transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        max-height 0.35s ease,
                        padding 0.35s ease,
                        margin 0.35s ease,
                        background 0.2s ease,
                        color 0.2s ease;
        }
        #${GALLERY_ID} .gallery-item:hover .gallery-btn,
        #${GALLERY_ID} .gallery-item.active .gallery-btn,
        #${GALLERY_ID} .gallery-item:focus-within .gallery-btn {
            opacity: 1;
            max-height: 40px;
            padding-top: 8px;
            padding-bottom: 8px;
            margin-top: 8px;
            transform: translateY(0);
        }
        #${GALLERY_ID} .gallery-btn:hover {
            background: #d4af37;
            color: #fff;
        }
        #${GALLERY_ID} .gallery-btn:active {
            transform: scale(0.95);
        }

        /* ═══ Bigger tiles get slightly larger type ═══ */
        #${GALLERY_ID} .gallery-item.g-tall .gallery-title,
        #${GALLERY_ID} .gallery-item.g-xtall .gallery-title,
        #${GALLERY_ID} .gallery-item.g-wide .gallery-title,
        #${GALLERY_ID} .gallery-item.g-xwide .gallery-title,
        #${GALLERY_ID} .gallery-item.g-feat .gallery-title,
        #${GALLERY_ID} .gallery-item.g-hero .gallery-title,
        #${GALLERY_ID} .gallery-item.g-banner .gallery-title {
            font-size: 15px;
        }
        #${GALLERY_ID} .gallery-item.g-tall .gallery-desc,
        #${GALLERY_ID} .gallery-item.g-xtall .gallery-desc,
        #${GALLERY_ID} .gallery-item.g-wide .gallery-desc,
        #${GALLERY_ID} .gallery-item.g-xwide .gallery-desc,
        #${GALLERY_ID} .gallery-item.g-feat .gallery-desc,
        #${GALLERY_ID} .gallery-item.g-hero .gallery-desc,
        #${GALLERY_ID} .gallery-item.g-banner .gallery-desc {
            -webkit-line-clamp: 3;
            font-size: 9.5px;
        }
        #${GALLERY_ID} .gallery-item.g-feat .gallery-title,
        #${GALLERY_ID} .gallery-item.g-hero .gallery-title,
        #${GALLERY_ID} .gallery-item.g-banner .gallery-title {
            font-size: 18px;
        }

        @media (prefers-reduced-motion: reduce) {
            #${GALLERY_ID},
            #${BADGE_ID},
            #${GALLERY_ID} .gallery-item img,
            #${GALLERY_ID} .gallery-overlay,
            #${GALLERY_ID} .gallery-btn,
            #${GALLERY_ID} .gallery-item::after {
                transition-duration: 0.01ms !important;
                animation-duration: 0.01ms !important;
            }
        }
    `;

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════════════════════════════
     2. HELPERS
     ═══════════════════════════════════════════════════════════════════ */
  function esc(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function appData() {
    try {
      if (
        window.PeacockApp &&
        typeof window.PeacockApp.getData === "function"
      ) {
        return window.PeacockApp.getData() || {};
      }
    } catch (_) {
      /* injector not ready */
    }
    return {};
  }

  function currencyCode() {
    const data = appData();
    return (
      (data.platform &&
        data.platform.currency &&
        data.platform.currency.code) ||
      "EGP"
    );
  }

  function money(value) {
    if (value == null || value === "" || isNaN(Number(value))) return "";
    return currencyCode() + " " + Math.round(Number(value)).toLocaleString();
  }

  function productById(id) {
    if (!id) return null;
    const products = appData().products || {};
    return products[id] || null;
  }

  function isTouchLike() {
    try {
      return window.matchMedia("(hover: none), (pointer: coarse)").matches;
    } catch (_) {
      return false;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     3. BENTO RHYTHM — 8 shapes, long varied cycle
     ═══════════════════════════════════════════════════════════════════ */
  const LAYOUT_RHYTHM = [
    "g-hero", // 2×3 — large opener
    "g-sq",
    "g-tall", // 1×2
    "g-sq",
    "g-wide", // 2×1
    "g-sq",
    "g-sq",
    "g-xtall", // 1×3
    "g-sq",
    "g-sq",
    "g-feat", // 2×2
    "g-sq",
    "g-wide",
    "g-sq",
    "g-tall",
    "g-sq",
    "g-banner", // 3×2 — wide banner
    "g-sq",
    "g-xwide", // 3×1 — full-width strip
    "g-sq",
    "g-tall",
    "g-sq",
    "g-sq",
    "g-xtall",
    "g-sq",
    "g-wide",
    "g-sq",
    "g-feat",
    "g-sq",
    "g-sq",
    "g-hero",
    "g-sq",
    "g-wide",
    "g-sq",
    "g-tall",
    "g-sq",
    "g-xwide",
    "g-sq",
    "g-sq",
    "g-banner",
    "g-sq",
    "g-sq",
    "g-tall",
    "g-sq",
    "g-feat",
    "g-sq",
    "g-wide",
    "g-sq",
  ];

  const ALL_SHAPES = [
    "g-sq",
    "g-tall",
    "g-xtall",
    "g-wide",
    "g-xwide",
    "g-feat",
    "g-hero",
    "g-banner",
  ];

  function applyLayoutRhythm() {
    const wrap = document.getElementById(GALLERY_ID);
    if (!wrap) return;
    const items = wrap.querySelectorAll(".gallery-item");
    items.forEach(function (item, i) {
      const next = LAYOUT_RHYTHM[i % LAYOUT_RHYTHM.length];
      if (
        item.classList.contains(next) &&
        item.classList.contains("g-rhythm-wired")
      ) {
        return;
      }
      ALL_SHAPES.forEach(function (cls) {
        item.classList.remove(cls);
      });
      item.classList.add(next, "g-rhythm-wired");
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     4. DATA EXTRACTION
     ═══════════════════════════════════════════════════════════════════ */
  function dataFor(item) {
    const ds = item.dataset || {};
    const id = ds.product || ds.id || ds.productId || "";
    const product = productById(id) || {};

    const overlay = item.querySelector(".gallery-overlay");
    const overlayTitle = overlay
      ? (
          (overlay.querySelector(".gallery-title") || {}).textContent || ""
        ).trim()
      : "";
    const overlaySubtitle = overlay
      ? (
          (overlay.querySelector(".gallery-subtitle") || {}).textContent || ""
        ).trim()
      : "";

    const num = (raw, fallback) => {
      if (raw === undefined || raw === null || raw === "") return fallback;
      const n = Number(raw);
      return isNaN(n) ? fallback : n;
    };

    const img = item.querySelector("img");

    return {
      id: id || product.id || "",
      title: ds.title || product.title || overlayTitle || "",
      brand: ds.brand || product.brand || "",
      category: ds.category || product.category || overlayTitle || "",
      subtitle: ds.subtitle || overlaySubtitle || "",
      description: ds.description || product.description || "",
      price: num(ds.price, product.price),
      oldPrice: num(ds.oldPrice, product.oldPrice),
      discount: num(ds.discount, product.discount),
      rating: num(ds.rating, product.rating),
      reviews: num(ds.reviews, product.reviewCount),
      colors: product.colors || [],
      sizes: product.sizes || [],
      stock: product.stock || ds.stock || "",
      image:
        ds.image ||
        (img && img.getAttribute("src")) ||
        (product.images && product.images[0]) ||
        "",
    };
  }

  /* ═══════════════════════════════════════════════════════════════════
     5. OVERLAY MARKUP
     ═══════════════════════════════════════════════════════════════════ */
  function overlayHTML(d) {
    const parts = [];

    if (d.brand) {
      parts.push('<span class="gallery-brand">' + esc(d.brand) + "</span>");
    }
    if (d.title) {
      parts.push('<h3 class="gallery-title">' + esc(d.title) + "</h3>");
    }

    const subBits = [];
    if (d.category && d.category !== d.title) subBits.push(d.category);
    if (d.subtitle && d.subtitle !== d.category) subBits.push(d.subtitle);
    if (subBits.length) {
      parts.push(
        '<p class="gallery-subtitle">' + esc(subBits.join(" · ")) + "</p>",
      );
    }

    /* price row */
    const priceBits = [];
    if (d.price != null && !isNaN(d.price)) {
      priceBits.push(
        '<span class="gallery-price">' + esc(money(d.price)) + "</span>",
      );
    }
    if (d.oldPrice) {
      priceBits.push(
        '<span class="gallery-old-price">' + esc(money(d.oldPrice)) + "</span>",
      );
    }
    if (d.discount) {
      priceBits.push(
        '<span class="gallery-discount">-' + esc(d.discount) + "%</span>",
      );
    }
    if (priceBits.length) {
      parts.push(
        '<div class="gallery-price-row">' + priceBits.join("") + "</div>",
      );
    }

    /* rating */
    if (d.rating) {
      const filled = Math.round(Number(d.rating));
      let stars = "";
      for (let i = 0; i < 5; i++) {
        stars +=
          '<i class="bi ' +
          (i < filled ? "bi-star-fill" : "bi-star") +
          '"></i>';
      }
      parts.push(
        '<div class="gallery-stars">' +
          stars +
          "<small>" +
          esc(Number(d.rating).toFixed(1)) +
          (d.reviews ? " (" + esc(d.reviews) + ")" : "") +
          "</small></div>",
      );
    }

    if (d.description) {
      parts.push('<p class="gallery-desc">' + esc(d.description) + "</p>");
    }

    /* chips */
    const chips = [];
    (d.colors || []).slice(0, 3).forEach((c) => {
      const label = typeof c === "string" ? c : c.value || "";
      if (label) {
        chips.push('<span class="gallery-chip">' + esc(label) + "</span>");
      }
    });
    (d.sizes || []).slice(0, 4).forEach((s) => {
      chips.push('<span class="gallery-chip">' + esc(s) + "</span>");
    });
    if (d.stock) {
      const label =
        d.stock === "out"
          ? "Out of stock"
          : d.stock === "low"
            ? "Low stock"
            : "In stock";
      chips.push('<span class="gallery-chip">' + esc(label) + "</span>");
    }
    if (chips.length) {
      parts.push('<div class="gallery-meta-row">' + chips.join("") + "</div>");
    }

    parts.push(
      '<button type="button" class="gallery-btn">Show Collection</button>',
    );

    return parts.join("");
  }

  /* ═══════════════════════════════════════════════════════════════════
     6. ITEM ENHANCEMENT
     ═══════════════════════════════════════════════════════════════════ */
  function enhanceGalleryItem(item) {
    if (!item || item.__peacockEnriched) return;

    const d = dataFor(item);
    const existing = item.querySelector(".gallery-overlay");
    const hasData = !!(
      d.title ||
      d.brand ||
      (d.price != null && !isNaN(d.price)) ||
      d.description
    );

    /* If the host wrote its own overlay and we have nothing to add,
       leave it but make sure the collection button exists. */
    if (!hasData && existing && existing.innerHTML.trim()) {
      if (!existing.querySelector(".gallery-btn")) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gallery-btn";
        btn.textContent = "Show Collection";
        existing.appendChild(btn);
      }
      item.dataset.collection = item.dataset.collection || d.category || "";
      item.__peacockEnriched = true;
      return;
    }

    let overlay = existing;
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "gallery-overlay";
      item.appendChild(overlay);
    }
    overlay.innerHTML = overlayHTML(d);

    item.dataset.collection = item.dataset.collection || d.category || "";
    if (!item.hasAttribute("tabindex")) item.setAttribute("tabindex", "0");

    item.__peacockEnriched = true;
  }

  function scanGallery() {
    const wrap = document.getElementById(GALLERY_ID);
    if (!wrap) return;
    wrap.querySelectorAll(".gallery-item").forEach(enhanceGalleryItem);
    applyLayoutRhythm();
  }

  /* ═══════════════════════════════════════════════════════════════════
     7. FALLBACK RENDERER
     ═══════════════════════════════════════════════════════════════════
     Pulls imagery from  assets/gallery/  (see section 0) and, when the
     host data has products, uses them for overlay metadata (title,
     category, price…). If no products exist, we still render the
     images so the layout is visible. */
  function ensureGalleryRendered() {
    const wrap = document.getElementById(GALLERY_ID);
    if (!wrap) return;

    let grid = wrap.querySelector(".gallery-grid");
    if (!grid) {
      grid = document.createElement("div");
      grid.className = "gallery-grid";
      (wrap.querySelector(".gallery-content") || wrap).appendChild(grid);
    }

    if (grid.querySelector(".gallery-item")) return;

    const assets = galleryAssetList();
    const products = appData().products || {};
    const productIds = Object.keys(products);
    const hasProducts = productIds.length > 0;

    const count = assets.length || productIds.length;
    if (!count) return;

    grid.innerHTML = Array.from({ length: count })
      .map((_, i) => {
        const pid = hasProducts ? productIds[i % productIds.length] : "";
        const p = (hasProducts && products[pid]) || {};

        const img = assets[i] || (p.images && p.images[0]) || "";

        const title = p.title || "";
        const category = p.category || "";

        return (
          '<article class="gallery-item" data-product="' +
          esc(pid) +
          '" data-collection="' +
          esc(category) +
          '" data-title="' +
          esc(title) +
          '" tabindex="0">' +
          '<img src="' +
          esc(img) +
          '" alt="' +
          esc(title || "Gallery image") +
          '" loading="lazy">' +
          "</article>"
        );
      })
      .join("");

    scanGallery();
  }

  /* ═══════════════════════════════════════════════════════════════════
     8. RETURN BADGE
     ═══════════════════════════════════════════════════════════════════ */
  function ensureReturnBadge() {
    let badge = document.getElementById(BADGE_ID);
    if (badge) return badge;

    badge = document.createElement("button");
    badge.id = BADGE_ID;
    badge.type = "button";
    badge.setAttribute("aria-label", "Return to cart mode");
    badge.innerHTML =
      '<i class="bi bi-bag-check-fill" aria-hidden="true"></i>' +
      "<span>Return to Cart Mode</span>";

    badge.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.togglePresentationMode();
    });

    document.body.appendChild(badge);
    return badge;
  }

  /* ═══════════════════════════════════════════════════════════════════
     9. COLLECTION
     ═══════════════════════════════════════════════════════════════════ */
  function findBestCategoryMatch(name) {
    if (!name) return "";
    const products = appData().products || {};
    const cats = new Set();
    Object.keys(products).forEach((id) => {
      const p = products[id];
      if (p && p.category) cats.add(p.category);
    });
    const list = Array.from(cats);
    if (!list.length) return name;
    if (list.indexOf(name) !== -1) return name;
    const lower = String(name).toLowerCase();
    const found = list.find((c) => String(c).toLowerCase() === lower);
    return found || name;
  }

  function openCollection(category) {
    const cat = findBestCategoryMatch(category);

    if (cat && typeof window.openCategory === "function") {
      window.openCategory(cat);
      return;
    }
    if (window.PeacockApp && typeof window.PeacockApp.open === "function") {
      window.PeacockApp.open("categories");
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     10. MODE TOGGLE
     ═══════════════════════════════════════════════════════════════════ */
  function syncToggleButton() {
    const btn = document.getElementById("modeToggleBtn");
    if (!btn) return;
    const isGallery = document.body.classList.contains("is-gallery-active");
    btn.innerHTML = isGallery
      ? '<i class="bi bi-bag-check"></i> Cart Mode'
      : '<i class="bi bi-grid-3x3-gap-fill"></i> Gallery Mode';
  }

  window.togglePresentationMode = function (silent) {
    const isGallery = document.body.classList.toggle("is-gallery-active");

    // Audio feedback from system sounds
    const soundEngine = window.ShopEaseSounds || window.MatagerSounds;
    if (soundEngine && typeof soundEngine.play === "function") {
      soundEngine.play(isGallery ? "toggle-on" : "toggle-off");
    }

    // ANTIGRAVITY EFFECT: Push the main storefront back in Z-space
    const shell = document.querySelector(".matager-customer-shell");
    const stickyCta = document.getElementById("stickyCta");

    if (isGallery) {
      if (shell) {
        shell.style.transform = "scale(0.95) translateZ(-50px)";
        shell.style.filter = "blur(4px) brightness(0.7)";
        shell.style.transition = "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
      }
      if (stickyCta) {
        stickyCta.style.transform = "translate3d(-50%, 0, 80px) scale(1.04)";
      }
    } else {
      if (shell) {
        shell.style.transform = "scale(1) translateZ(0)";
        shell.style.filter = "none";
      }
      if (stickyCta) {
        stickyCta.style.transform = "translate3d(-50%, 0, 0) scale(1)";
      }
    }

    syncToggleButton();
    ensureReturnBadge();

    if (isGallery) {
      ensureGalleryRendered();
      scanGallery();
    }

    if (!silent && typeof window.showAlert === "function") {
      window.showAlert("success", isGallery ? "Gallery Mode" : "Cart Mode");
    }

    return isGallery;
  };

  /* ═══════════════════════════════════════════════════════════════════
     11. ITEM INTERACTION
     ═══════════════════════════════════════════════════════════════════ */
  /* Kept for backward compatibility with inline `onclick` markup. */
  window.toggleGalleryItemActive = function (element) {
    if (!element) return;
    const wasActive = element.classList.contains("active");

    const wrap = document.getElementById(GALLERY_ID);
    if (wrap) {
      wrap.querySelectorAll(".gallery-item.active").forEach(function (el) {
        if (el !== element) el.classList.remove("active");
      });
    }

    element.classList.toggle("active", !wasActive);
  };

  /* Delegated click — any click on the card opens the collection,
     exactly like clicking the "Show Collection" button. */
  document.addEventListener(
    "click",
    function (e) {
      if (!e.target || !e.target.closest) return;

      const item = e.target.closest("#" + GALLERY_ID + " .gallery-item");
      if (!item) return;

      e.stopPropagation();
      e.preventDefault();
      const collection =
        item.dataset.collection ||
        item.dataset.category ||
        "" ||
        dataFor(item).category ||
        "";
      openCollection(collection);
    },
    true,
  );

  /* Keyboard support — Enter / Space on a focused tile opens it. */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (!e.target || !e.target.closest) return;
    const item = e.target.closest("#" + GALLERY_ID + " .gallery-item");
    if (!item) return;
    e.preventDefault();
    const collection =
      item.dataset.collection ||
      item.dataset.category ||
      "" ||
      dataFor(item).category ||
      "";
    openCollection(collection);
  });

  /* ═══════════════════════════════════════════════════════════════════
     12. OBSERVER
     ═══════════════════════════════════════════════════════════════════ */
  let scanTimer = null;

  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(function () {
      scanTimer = null;
      scanGallery();
      syncToggleButton();
    }, 120);
  }

  function startObserver() {
    if (!window.MutationObserver) return;
    const observer = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.target && m.target.closest && m.target.closest(".gallery-item")) {
          continue;
        }
        for (let j = 0; j < m.addedNodes.length; j++) {
          const node = m.addedNodes[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains("gallery-item")) {
            scheduleScan();
            return;
          }
          if (node.querySelector && node.querySelector(".gallery-item")) {
            scheduleScan();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════════════
     13. INIT
     ═══════════════════════════════════════════════════════════════════ */
  function initSwitcher() {
    ensureReturnBadge();
    syncToggleButton();
    scanGallery();
    startObserver();

    setTimeout(function () {
      ensureGalleryRendered();
      scanGallery();
    }, 400);
    setTimeout(scanGallery, 900);
    setTimeout(scanGallery, 1600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSwitcher, { once: true });
  } else {
    initSwitcher();
  }
})();
