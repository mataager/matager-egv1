/* =========================================================================
   PEACOCK STORE — STICKY CTA  (v5.1)
   Single-call initializer. Injects CSS + DOM and wires up every controller.
   Usage:  initStickyCTA();   // auto-runs on DOM ready if not called manually

   v2: shell, lightbox, gallery dots, nav stack, categories view.
   v3: lightbox return-to-origin, 16px input guard, single-slot toast queue.
   v4: "Other Stores" hub tile + stores view (followed row, category
       dropdop cascade, searchable list).
   v4.1: "Browse by category" now uses the host .dropdop component with
         sub-category cascade; top-level categories = Apparel & Accessories,
         Home & Garden, Beauty & Wellness, Electronics & Gadgets.
   v4.2: • Hub AI chat (Gemini-ready, local intent parser fallback)
         • Light/dark theme toggle (persisted in localStorage)
         • Store list can be sorted by rating (used by the AI)
   v4.3: • Promo banner flush to top of hub (no padding)
         • Notification layer strictly under hub (z-index)
         • Notification slide animation (bottom to top)
         • Left-side notification stacking visual with count
         • Circular notification icons with high contrast
         • No emojis in notification texts (sanitized)
         • CSS variables for dark mode palette

   v5.0: • datainjector.js is the single source of truth (maestro) — doc.js
           ships with ZERO hard-coded data.
         • Sticky bar is ALWAYS visible (no scroll trigger).
         • Notification system moved to an inline strip at the top of the
           card: a grey area that smoothly expands in height.
         • Notification card: circular bordered icon, x-count badge on the
           LEFT, heading, text and full date/time.
         • Promo ads are centered and auto-scroll (marquee) when the text is
           wider than the available area.
         • window.PeacockApp.setStore(id) re-hydrates + re-renders everything.

   v5.1: • Product-detail Color / Size selectors migrated to the host
           `.dropdop` component (color uses data-type="status" so each option
           paints its real hex; size uses data-type="search").
         • New `initPaneDropdops(root)` helper re-instantiates DropDop inside
           the quick-look pane every time T.quickLookBody() is injected.
         • Legacy #selectedColorText / #selectedSizeText are mirrored on
           every pick so existing listeners keep working.
         • CSS additions for the in-pane dropdops (dark + light themes).
   ========================================================================= */
(function () {
  "use strict";

  const STYLE_ID = "peacock-sticky-styles";
  const ROOT_ID = "peacock-sticky-root";

  /* ═══════════════════════════════════════════════════════════════════
     1. CSS
     ═══════════════════════════════════════════════════════════════════ */
  const CSS = `
:root {
  --hub-bg: #232323;
  --hub-panel-bg: #17171a;
  --hub-border: #4b4b4b;
  --notif-bg: rgba(12,12,15,.92);
  --notif-border: rgba(255,255,255,.1);
  --notif-text: rgba(255,255,255,.82);
  --tone-success: #10b981;
  --tone-error: #ef4444;
  --tone-info: #3b82f6;
  --tone-warning: #f59e0b;
}
.sticky-cta{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:9990;display:flex;flex-direction:column;width:min(400px,calc(100vw - 32px));height:min(85vh,720px);background:var(--hub-bg);backdrop-filter:blur(16px) saturate(130%);-webkit-backdrop-filter:blur(16px) saturate(130%);border-radius:25px;overflow:hidden;clip-path:inset(calc(100% - 60px) 0 0 0 round 35px);transform:translate3d(-50%,calc(100% + 40px),0);opacity:0;pointer-events:none;contain:layout paint style;will-change:clip-path,transform,opacity;transition:clip-path .36s cubic-bezier(.16,1,.3,1),transform .36s cubic-bezier(.16,1,.3,1),opacity .18s ease}
.sticky-cta.is-visible{transform:translate3d(-50%,0,0);opacity:1;pointer-events:auto}
.sticky-cta.is-expanded{clip-path:inset(0 0 0 0 round 34px)}
.sticky-promo-banner{position:relative;z-index:20;display:flex;align-items:center;gap:8px;height:36px;padding:0 16px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.06);border-radius:25px 25px 0 0;box-sizing:border-box;overflow:hidden;flex-shrink:0;margin:0}
/* ── v5 · inline notification strip (expands smoothly) ─────────────── */
.sticky-notif-zone{position:relative;z-index:22;flex:0 0 auto;display:grid;grid-template-rows:0fr;background:transparent;transition:grid-template-rows .5s cubic-bezier(.16,1,.3,1)}
.sticky-notif-zone.is-open{grid-template-rows:1fr}
.sticky-notif-zone-inner{overflow:hidden;min-height:0}
.sticky-notif-card{display:flex;align-items:center;gap:12px;padding:10px 14px 10px 22px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02)),var(--notif-bg);border-bottom:1px solid var(--notif-border);transform:translateY(-12px);opacity:0;transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .34s ease}
.sticky-notif-zone.is-open .sticky-notif-card{transform:translateY(0);opacity:1}
.sticky-notif-ico-wrap{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;margin-left:6px}
.sticky-notif-ico{position:relative;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;background:color-mix(in srgb,var(--tone,#94a3b8) 24%,transparent);border:2px solid var(--tone,#94a3b8);box-shadow:0 0 0 3px color-mix(in srgb,var(--tone,#94a3b8) 14%,transparent)}
.sticky-notif-ico i{font-size:14px}
/* ── v5.2 · notification ring-loader + overflow hint ─────────────── */
/* The icon keeps its tinted background + tone outline as the static
   "track"; the SVG progress arc draws on top and drains to empty.
   The icon is already position:relative (above) so inset:0 works. */
.sticky-notif-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);pointer-events:none}
/* We render the static outline as a real CSS border on .sticky-notif-ico,
   so the SVG track is hidden to avoid doubling it. */
.sticky-notif-ring-track{display:none}
.sticky-notif-ring-progress{fill:none;stroke:var(--tone,#94a3b8);stroke-width:3;stroke-linecap:round;stroke-dasharray:106.81;stroke-dashoffset:0;animation:notifRingDrain var(--notif-duration,4200ms) linear forwards}
@keyframes notifRingDrain{from{stroke-dashoffset:0}to{stroke-dashoffset:106.81}}
/* The old .sticky-notif-count badge that used to overlap the icon is
   no longer emitted. Keep a no-op rule so nothing blows up if a stale
   reference sneaks through. */
.sticky-notif-count{display:none!important}
/* Overflow hint line, shown under the message when >1 alert is queued */
.sticky-notif-hint{display:inline-flex;align-items:center;gap:2px;margin-top:3px;font-size:9.5px;font-weight:700;letter-spacing:.01em;color:color-mix(in srgb,var(--tone,#94a3b8) 72%,#fff);text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--tone,#94a3b8) 35%,transparent);text-underline-offset:2px}
.sticky-notif-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.sticky-notif-head{display:flex;align-items:center;gap:8px}
.sticky-notif-title{font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--tone,#94a3b8)}
.sticky-notif-date{margin-left:auto;font-size:8.5px;font-weight:600;color:rgba(255,255,255,.38);white-space:nowrap}
.sticky-notif-text{margin:0;font-size:11px;line-height:1.35;color:var(--notif-text);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sticky-notif-close{flex:0 0 auto;width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;transition:background .2s,color .2s,transform .14s}
.sticky-notif-close:hover{background:rgba(255,255,255,.12);color:#fff}
.sticky-notif-close:active{transform:scale(.9)}
.sticky-cta-panel{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;opacity:0;transform:translate3d(0,8px,0);pointer-events:none;transition:opacity .24s ease,transform .3s cubic-bezier(.16,1,.3,1);backface-visibility:hidden;z-index:1}
.sticky-cta.is-expanded .sticky-cta-panel{opacity:1;transform:translate3d(0,0,0);pointer-events:auto;transition-delay:.04s,.04s}
.sticky-cta-panel-inner{position:absolute;background:var(--hub-panel-bg);border-bottom:1px solid var(--hub-border);inset:0;transform:translateZ(0);z-index:1}
.sticky-view{position:absolute;inset:0;padding:16px 16px 14px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:none;-ms-overflow-style:none;contain:layout paint style;opacity:0;transform:translate3d(16px,0,0);pointer-events:none;transition:opacity .26s cubic-bezier(.16,1,.3,1),transform .34s cubic-bezier(.16,1,.3,1);backface-visibility:hidden}
.sticky-view::-webkit-scrollbar{width:0;height:0;display:none}
.sticky-view.is-active{opacity:1;transform:translate3d(0,0,0);pointer-events:auto;will-change:opacity,transform}
.sticky-view.is-exiting-left{opacity:0;transform:translate3d(-16px,0,0);will-change:opacity,transform}
.sticky-view.is-exiting-right{opacity:0;transform:translate3d(16px,0,0);will-change:opacity,transform}
.hub-inner{display:flex;flex-direction:column;gap:10px}
.view-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;min-height:30px}
.view-head--tight{margin-bottom:4px}
.view-head-main{min-width:0}
.view-eyebrow{display:block;font-size:8.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;margin-bottom:1px;line-height:1}
.view-title{font-size:13.5px;font-weight:700;letter-spacing:-.01em;color:#fff;margin:0;line-height:1.15}
.view-head-side{flex-shrink:0}
.mini-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:8.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.75);white-space:nowrap;transition:background .25s,color .25s,border-color .25s}
.mini-pill.is-accent{background:rgba(59,130,246,.16);border-color:rgba(59,130,246,.3);color:#93c5fd}
.mv-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18);animation:pulseDot 2s ease-in-out infinite}
@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.45}}
.mini-label{display:block;font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);line-height:1}
/* ── v5 · promo ads: centered + marquee when overflowing ───────────── */
.hub-ad{position:relative;display:flex;align-items:center;gap:8px;height:32px;padding:0 11px;border-radius:11px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#cfcfcf}
.hub-ad-icon{flex:0 0 auto;font-size:11px;color:#93c5fd;opacity:.9}
.hub-ad-viewport{position:relative;flex:1 1 auto;height:100%;overflow:hidden}
.hub-ad-msg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .45s ease;overflow:hidden}
.hub-ad-msg.is-active{opacity:1}
.hub-ad-msg.is-scrolling{justify-content:flex-start}
.hub-ad-msg-text{display:inline-block;white-space:nowrap;font-size:10px;font-weight:600;color:rgba(255,255,255,.88);text-align:center}
.hub-ad-msg.is-scrolling .hub-ad-msg-text{padding-right:32px;animation:adMarquee 9s linear infinite}
@keyframes adMarquee{0%,8%{transform:translateX(0)}92%,100%{transform:translateX(calc(-1 * var(--ad-shift,0px)))}} 
.cta-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.cta-tile{position:relative;display:flex;align-items:center;gap:6px;height:38px;padding:0 9px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#cfcfcf;font-family:inherit;font-size:9.5px;font-weight:600;letter-spacing:.01em;cursor:pointer;overflow:hidden;text-align:left;transition:background .2s,border-color .2s,color .2s,transform .16s}
.cta-tile:hover{background:rgba(59,130,246,.09);border-color:rgba(59,130,246,.28);color:#fff}
.cta-tile:active{transform:scale(.96)}
.cta-tile-ico{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .22s,transform .28s cubic-bezier(.16,1,.3,1)}
.cta-tile-ico i{font-size:11.5px;color:#60a5fa}
.cta-tile-label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cta-tile-badge{flex-shrink:0;min-width:15px;height:15px;padding:0 4px;border-radius:999px;background:rgba(239,68,68,.9);color:#fff;font-size:8px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;line-height:1}
.cta-tile-badge.is-hidden{display:none}
.cta-metrics{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:11px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
.cta-metric{flex:1 1 0;display:flex;align-items:center;gap:6px;min-width:0}
.cta-metric .mini-label{flex-shrink:0}
.cta-metric-value{margin-left:auto;font-size:13px;font-weight:700;color:#fff;letter-spacing:-.02em;line-height:1}
.cta-metrics-sep{width:1px;height:16px;background:rgba(255,255,255,.08);flex-shrink:0}
.sticky-cta-bar{position:relative;z-index:1;flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:8px;height:60px;box-sizing:border-box}
.sticky-cta-primary{flex:1 1 auto;justify-content:center;height:44px;padding:0 22px;background:#fff!important;color:#000!important;border:1px solid rgba(0,0,0,.1)!important;display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.06em;border-radius:999px;text-decoration:none;transition:background .2s}
.sticky-cta-primary:hover{background:#f3f4f6!important}
.sticky-cta-primary i{font-size:16px}
.sticky-cta-back,.sticky-cta-toggle{flex:0 0 44px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,border-color .2s,transform .34s cubic-bezier(.16,1,.3,1),opacity .25s,width .3s cubic-bezier(.16,1,.3,1),flex-basis .3s cubic-bezier(.16,1,.3,1)}
.sticky-cta-back{font-size:14px}
.sticky-cta-back:hover{background:rgba(255,255,255,.12)}
.sticky-cta-back:active{transform:scale(.94)}
.sticky-cta[data-current="hub"] .sticky-cta-back,.sticky-cta:not([data-current]) .sticky-cta-back{opacity:0;pointer-events:none;width:0;flex-basis:0;margin-right:-8px;border-width:0}
.sticky-cta-toggle i{font-size:20px;transition:transform .38s cubic-bezier(.16,1,.3,1)}
.sticky-cta-toggle:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.16)}
.sticky-cta.is-expanded .sticky-cta-toggle{background:rgba(239,68,68,.9);border-color:rgba(239,68,68,.9);color:#fff}
body.sticky-cta-open{overflow:hidden}
.sticky-cta-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9989;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s cubic-bezier(.16,1,.3,1),visibility .3s}
.sticky-cta-overlay.is-visible{opacity:1;visibility:visible;pointer-events:auto}
.filter{position:relative}
.filter-trigger{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:#e5e7eb;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s,border-color .2s;white-space:nowrap}
.filter-trigger:hover{background:rgba(255,255,255,.09)}
.filter-trigger>i{font-size:10px;opacity:.5;transition:transform .28s}
.filter-trigger[aria-expanded="true"]>i{transform:rotate(180deg)}
.filter-label{opacity:.45;font-weight:600;font-size:8.5px;text-transform:uppercase;letter-spacing:.08em;margin-right:4px}
.filter-selected{color:#60a5fa}
.filter-dropdown{position:absolute;top:calc(100% + 6px);left:0;min-width:190px;max-width:260px;background:rgba(14,14,17,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:8px;box-shadow:0 18px 44px -12px rgba(0,0,0,.85);opacity:0;visibility:hidden;transform:translateY(-6px) scale(.97);transition:.2s cubic-bezier(.16,1,.3,1);z-index:60}
.filter-dropdown.open{opacity:1;visibility:visible;transform:none}
.filter-dropdown-header{font-size:8.5px;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);padding:4px 8px 8px;font-weight:700}
.filter-options{display:flex;flex-direction:column;gap:2px;max-height:210px;overflow-y:auto;scrollbar-width:none}
.filter-options::-webkit-scrollbar{display:none}
.filter-option{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:9px;border:none;background:transparent;color:rgba(255,255,255,.75);font-size:11px;font-weight:600;cursor:pointer;text-align:left;font-family:inherit;width:100%;transition:background .16s,color .16s}
.filter-option:hover{background:rgba(255,255,255,.07);color:#fff}
.filter-option.is-selected{background:rgba(59,130,246,.14);color:#93c5fd}
.option-left{display:inline-flex;align-items:center;gap:8px}
.color-swatch{width:14px;height:14px;border-radius:50%;background:var(--swatch);box-shadow:inset 0 0 0 1px rgba(255,255,255,.25);flex-shrink:0}
.option-check{opacity:0;font-size:12px}
.filter-option.is-selected .option-check{opacity:1}
.size-options{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.size-options .filter-option{justify-content:center;padding:8px 4px}
.status-dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:6px;background:#64748b}
.pd-layout{display:flex;flex-direction:column;gap:14px}
.pd-gallery-frame{position:relative;width:100%;aspect-ratio:11/11;border-radius:14px;overflow:hidden;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
.pd-gallery-track{display:flex;height:100%;width:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.pd-gallery-track::-webkit-scrollbar{display:none}
.ql-slide{width:100%;height:100%;object-fit:cover;flex-shrink:0;scroll-snap-align:center}
.pd-gallery-badge{position:absolute;bottom:8px;right:8px;padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);color:rgba(255,255,255,.85);font-size:9px;font-weight:600}
.pd-info{display:flex;flex-direction:column;gap:12px}
.pd-title{font-size:17px;font-weight:300;letter-spacing:-.01em;color:#fff;margin:0;line-height:1.2}
.pd-brand{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#60a5fa;margin-bottom:-6px}
.pd-tabs{display:flex;gap:14px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid rgba(255,255,255,.08)}
.pd-tabs::-webkit-scrollbar{display:none}
.tab-btn{padding:0 0 7px;border:none;background:transparent;border-bottom:2px solid transparent;font-family:inherit;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.4);cursor:pointer;white-space:nowrap;transition:color .22s,border-color .22s}
.tab-btn:hover{color:rgba(255,255,255,.75)}
.tab-btn.is-active{color:#60a5fa;border-bottom-color:#3b82f6}
.pd-panes{position:relative;z-index:15}
.pd-pane{display:none;flex-direction:column;gap:10px;overflow:visible}
.pd-pane.is-active{display:flex}
.pd-price-row{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.pd-price{font-size:18px;font-weight:500;color:#fff;letter-spacing:-.02em}
.pd-old-price{font-size:11px;color:rgba(255,255,255,.35);text-decoration:line-through}
.pd-discount{margin-left:auto;font-size:10px;font-weight:800;color:#ef4444;background:rgba(239,68,68,.12);padding:2px 8px;border-radius:999px}
.pd-badges{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:10px;color:rgba(255,255,255,.7)}
.pd-badges i{color:#10b981;margin-right:3px}
.pd-badges-sep{width:1px;height:11px;background:rgba(255,255,255,.12)}
.pd-options{display:flex;flex-wrap:wrap;gap:6px;position:relative;z-index:15}

/* ── v5.1 · dropdops inside the product panes ────────────────────── */
.pd-options .dropdop{flex:1 1 160px;min-width:0;z-index:20}
.pd-options .dropdop .btndop{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;border-radius:11px;padding:9px 12px;font-size:11px;font-weight:700;letter-spacing:.01em;min-height:36px;box-shadow:none}
.pd-options .dropdop .btndop:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.16)}
.pd-options .dropdop.active .btndop{border-color:rgba(59,130,246,.55);box-shadow:0 0 0 3px rgba(59,130,246,.15)}
.pd-options .dropdop .btndop .caret{color:rgba(255,255,255,.55)}
.pd-options .dropdop .menudop{border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 18px 44px -12px rgba(0,0,0,.85);background:rgba(14,14,17,.98);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:60}
.pd-options .dropdop .optdop{font-size:11px;padding:9px 12px}
.pd-options .dropdop .optdop .color-swatch{width:12px;height:12px}
.pd-options .dropdop .search-wrap{background:rgba(14,14,17,.98);border-bottom-color:rgba(255,255,255,.08)}
.pd-options .dropdop .searchdop{background:rgba(255,255,255,.06);font-size:12px}

.pd-whatsapp{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:inherit;text-align:left;transition:background .2s,border-color .2s}
.pd-whatsapp:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}
.pd-whatsapp-ico{font-size:17px;color:#25D366;flex-shrink:0}
.pd-whatsapp-body{display:flex;flex-direction:column;flex:1 1 auto;min-width:0}
.pd-whatsapp-body strong{font-size:11px;font-weight:700;color:#fff}
.pd-whatsapp-body small{font-size:9.5px;color:rgba(255,255,255,.45)}
.pd-whatsapp-arrow{font-size:11px;color:rgba(255,255,255,.3);transition:color .2s}
.pd-whatsapp:hover .pd-whatsapp-arrow{color:#fff}
.pd-actions{display:flex;align-items:center;gap:6px}
.pd-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;padding:9px 12px;border-radius:11px;border:1px solid transparent;font-family:inherit;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;transition:background .2s,border-color .2s,transform .14s,color .2s;white-space:nowrap}
.pd-btn:active{transform:scale(.96)}
.pd-btn i{font-size:12px}
.pd-btn--primary{flex:1 1 0;min-width:0;background:#fff;color:#000;border-color:rgba(0,0,0,.1)}
.pd-btn--primary:hover{background:#e5e7eb}
.pd-btn--icon{flex:0 0 auto;padding:9px 11px;background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.09);color:rgba(255,255,255,.6)}
.pd-btn--icon:hover{color:#f87171}
.pd-btn--ghost{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.09);color:rgba(255,255,255,.8)}
.pd-btn--ghost:hover{background:rgba(255,255,255,.09);color:#fff}
.pd-btn--muted{background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);border-color:rgba(255,255,255,.08)}
.pd-btn--danger{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.25);color:#f87171}
.pd-btn--danger:hover{background:rgba(239,68,68,.2)}
.pd-btn--block{width:100%}
.pd-section-label{font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.4);margin:0}
.pd-text{font-size:10.5px;line-height:1.6;color:rgba(255,255,255,.75);margin:0;font-weight:300}
.pd-text--muted{opacity:.7}
.pd-strong{color:#fff;font-weight:600}
.pd-note{padding:10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.pd-delivery{display:flex;flex-direction:column;gap:6px}
.pd-delivery-item{display:flex;align-items:flex-start;gap:10px;padding:10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.pd-delivery-item i{font-size:13px;color:rgba(255,255,255,.55);margin-top:1px}
.pd-delivery-item p{margin:0;font-size:10.5px;font-weight:600;color:#fff}
.pd-delivery-item small{font-size:9px;color:rgba(255,255,255,.5)}
.pd-rating-summary{display:flex;flex-wrap:wrap;align-items:center;gap:16px;padding:12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
.pd-rating-score{display:flex;align-items:center;gap:10px}
.pd-rating-score>span{font-size:22px;font-weight:500;color:#fff;letter-spacing:-.02em}
.pd-stars{display:flex;gap:1px;color:#facc15;font-size:10px}
.pd-stars--sm{font-size:10px;margin-top:6px}
.pd-rating-count{font-size:9px;color:rgba(255,255,255,.45)}
.pd-rating-bars{flex:1 1 200px;display:grid;grid-template-columns:repeat(2,1fr);gap:2px 14px}
.pd-rating-bar{display:flex;align-items:center;gap:7px}
.pd-rating-bar-label{width:26px;font-size:9px;color:rgba(255,255,255,.5)}
.pd-rating-bar-track{flex:1;height:5px;border-radius:999px;background:rgba(255,255,255,.09);overflow:hidden}
.pd-rating-bar-fill{height:100%;background:#facc15;border-radius:999px}
.pd-rating-bar-value{width:30px;text-align:right;font-size:9px;color:rgba(255,255,255,.5)}
.pd-review-toolbar{display:flex;justify-content:flex-end}
.pd-review-form{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .38s cubic-bezier(.16,1,.3,1),opacity .24s ease}
.pd-review-form>*{overflow:hidden;min-height:0}
.pd-review-form.is-open{grid-template-rows:1fr;opacity:1}
.pd-review-form-inner{display:flex;flex-direction:column;gap:10px;padding:12px;margin-top:8px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.pd-reviewer{display:flex;align-items:center;gap:10px}
.pd-reviewer-avatar{width:28px;height:28px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0}
.pd-reviewer-name{display:block;font-size:11.5px;font-weight:700;color:#fff}
.pd-reviewer-verified{font-size:9px;color:rgba(255,255,255,.4)}
.pd-star-input{display:flex;align-items:center;gap:4px;cursor:pointer}
.pd-star-input .bi-star-fill{font-size:18px;color:rgba(255,255,255,.18);transition:color .16s,transform .16s}
.pd-star-input .bi-star-fill.is-on{color:#facc15}
.pd-star-input .bi-star-fill:hover{transform:scale(1.12)}
.pd-star-input>span{font-size:10px;color:rgba(255,255,255,.45);margin-left:6px}
.pd-textarea-wrap{position:relative}
.pd-textarea-wrap textarea{width:100%;min-height:68px;resize:none;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;font-family:inherit;font-size:11px;outline:none;transition:border-color .2s}
.pd-textarea-wrap textarea:focus{border-color:rgba(59,130,246,.5)}
.pd-charcount{position:absolute;right:10px;bottom:8px;font-size:9px;color:rgba(255,255,255,.3)}
.pd-review-form-actions{display:flex;justify-content:flex-end;gap:6px}
.pd-reviews-feed{display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;scrollbar-width:none;padding-right:2px}
.pd-reviews-feed::-webkit-scrollbar{display:none}
.pd-review-card{padding:12px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);transition:border-color .2s,background .2s}
.pd-review-card:hover{border-color:rgba(255,255,255,.14)}
.pd-review-head{display:flex;gap:10px;align-items:flex-start}
.pd-review-avatar{width:30px;height:30px;border-radius:50%;background:rgba(99,102,241,.25);color:#a5b4fc;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0}
.pd-review-meta{flex:1 1 auto;min-width:0}
.pd-review-name-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.pd-review-name{font-size:11.5px;font-weight:700;color:#fff}
.pd-review-verified{display:inline-flex;align-items:center;gap:3px;font-size:7.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#34d399;background:rgba(16,185,129,.12);padding:2px 6px;border-radius:999px}
.pd-review-date{margin-left:auto;font-size:9px;color:rgba(255,255,255,.35)}
.pd-review-variants{display:flex;gap:5px;font-size:9.5px;color:rgba(255,255,255,.45);margin-top:2px}
.pd-review-text-wrap{overflow:hidden;transition:max-height .32s cubic-bezier(.16,1,.3,1)}
.pd-review-text-wrap.is-clamped{max-height:42px}
.pd-review-text{margin:0;font-size:11px;line-height:1.55;color:rgba(255,255,255,.7)}
.pd-review-more{margin-top:5px;border:none;background:none;padding:0;font-family:inherit;font-size:10px;font-weight:700;color:#60a5fa;cursor:pointer}
.pd-review-more:hover{text-decoration:underline}
.pd-review-foot{display:flex;gap:16px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06)}
.pd-review-foot button{display:inline-flex;align-items:center;gap:4px;border:none;background:none;padding:0;font-family:inherit;font-size:10px;color:rgba(255,255,255,.4);cursor:pointer;transition:color .2s}
.pd-review-foot button:hover{color:rgba(255,255,255,.8)}
.search-modes{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-bottom:10px}
.search-modes::-webkit-scrollbar{display:none}
.search-mode-btn{flex-shrink:0;padding:7px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.55);font-family:inherit;font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.search-mode-btn:hover{background:rgba(255,255,255,.08);color:#fff}
.search-mode-btn.is-active{background:#fff;color:#000;border-color:rgba(0,0,0,.1)}
.search-input-wrap{position:relative;margin-bottom:10px}
.search-input{width:100%;padding:11px 40px 11px 14px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;font-family:inherit;font-size:12px;outline:none;transition:border-color .2s,background .2s}
.search-input::placeholder{color:rgba(255,255,255,.3)}
.search-input:focus{border-color:rgba(59,130,246,.5);background:rgba(255,255,255,.07)}
.search-input-ico{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.3);font-size:13px}
.search-suggestions{animation:fadeUp .26s ease-out}
@keyframes fadeUp{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
.search-block{margin-bottom:14px}
.search-block-head{display:flex;align-items:center;justify-content:space-between;padding:0 4px 8px;font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35)}
.search-count{color:#60a5fa;letter-spacing:.02em}
.search-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
.search-tile{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);color:#fff;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;text-align:left;transition:background .2s,border-color .2s,transform .14s}
.search-tile:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14)}
.search-tile:active{transform:scale(.98)}
.search-tile i{font-size:10px;opacity:.35}
.search-tile-count{font-size:9px;font-weight:700;color:rgba(255,255,255,.35)}
.search-rows{display:flex;flex-direction:column;gap:4px;max-height:330px;overflow-y:auto;scrollbar-width:none}
.search-rows::-webkit-scrollbar{display:none}
.search-row{display:flex;align-items:center;gap:10px;padding:8px;border-radius:12px;cursor:pointer;transition:background .2s}
.search-row:hover{background:rgba(255,255,255,.06)}
.search-row-thumb{width:44px;height:44px;border-radius:10px;overflow:hidden;background:rgba(255,255,255,.05);flex-shrink:0}
.search-row-thumb img{width:100%;height:100%;object-fit:cover}
.search-row-icon{width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5);flex-shrink:0}
.search-row-body{flex:1 1 auto;min-width:0}
.search-row-title{margin:0;font-size:11.5px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.search-row-meta{display:flex;align-items:center;gap:6px;font-size:9.5px;color:rgba(255,255,255,.45);margin-top:1px}
.search-dot{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.25)}
.search-row-price{margin:2px 0 0;font-size:10.5px;font-weight:800;color:#60a5fa}
.search-row-chev{font-size:11px;color:rgba(255,255,255,.2);flex-shrink:0}
.search-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:36px 16px;text-align:center}
.search-empty-ico{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.2);font-size:20px;margin-bottom:12px}
.search-empty p{margin:0;font-size:12px;font-weight:700;color:rgba(255,255,255,.45)}
.search-empty small{font-size:10px;color:rgba(255,255,255,.25);margin-top:4px}
.notif-list{display:flex;flex-direction:column;gap:6px;max-height:340px;overflow-y:auto;scrollbar-width:none;padding-right:2px}
.notif-list::-webkit-scrollbar{display:none}
.notif-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px 16px;font-size:11px;color:rgba(255,255,255,.3)}
.notif-empty i{font-size:20px}
.notif-card{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);font-family:inherit;text-align:left;cursor:pointer;transition:background .2s,border-color .2s,transform .14s}
.notif-card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}
.notif-card:active{transform:scale(.99)}
.notif-ico{flex:0 0 30px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--tone,#94a3b8);background:color-mix(in srgb,var(--tone,#94a3b8) 15%,transparent);border:1px solid color-mix(in srgb,var(--tone,#94a3b8) 28%,transparent);font-size:12px}
.notif-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.notif-top{display:flex;align-items:center;gap:6px}
.notif-label{font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--tone,#94a3b8)}
.notif-dot{width:5px;height:5px;border-radius:50%;background:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.18)}
.notif-time{margin-left:auto;font-size:8.5px;color:rgba(255,255,255,.3)}
.notif-msg{font-size:11px;line-height:1.4;color:rgba(255,255,255,.72);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.notif-chev{font-size:11px;color:rgba(255,255,255,.2);flex-shrink:0}
.notif-footer{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07)}
.notif-footer-btn{border:none;background:none;padding:4px 8px;border-radius:8px;font-family:inherit;font-size:10px;font-weight:700;color:#60a5fa;cursor:pointer;transition:background .2s,color .2s}
.notif-footer-btn:hover{background:rgba(59,130,246,.1)}
.notif-footer-btn--danger{color:rgba(248,113,113,.75)}
.notif-footer-btn--danger:hover{background:rgba(239,68,68,.1);color:#f87171}
.orders-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.orders-list{display:flex;flex-direction:column;gap:8px;max-height:450px;overflow-y:auto;scrollbar-width:none;padding-right:2px}
.orders-list::-webkit-scrollbar{display:none}
.order-card{border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);transition:border-color .24s,background .24s,box-shadow .24s}
.order-card:hover{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.055)}
.order-card-head{position:relative;display:block;width:100%;padding:12px;border:none;background:none;font-family:inherit;text-align:left;cursor:pointer}
.order-card-head-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.order-status{font-size:8.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:6px}
.order-status.is-pending{color:#fbbf24;background:rgba(245,158,11,.12)}
.order-status.is-shipped{color:#a78bfa;background:rgba(139,92,246,.14)}
.order-status.is-delivered{color:#34d399;background:rgba(16,185,129,.14)}
.order-id{font-size:9px;color:rgba(255,255,255,.35);font-weight:600}
.order-card-title{margin:0;font-size:12px;font-weight:700;color:#fff;padding-right:22px;transition:color .2s}
.order-card-head-bottom{display:flex;align-items:center;justify-content:space-between;margin-top:5px}
.order-date{font-size:9.5px;color:rgba(255,255,255,.4)}
.order-total{font-size:11.5px;font-weight:800;color:#fff}
.order-chevron{position:absolute;top:35px;right:12px;font-size:11px;color:rgba(255,255,255,.3);transition:transform .34s cubic-bezier(.16,1,.3,1),color .25s}
.order-card.is-open .order-chevron{transform:rotate(180deg)}
.order-details{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .4s cubic-bezier(.16,1,.3,1),opacity .26s ease}
.order-details>.order-details-inner{overflow:hidden;min-height:0}
.order-card.is-open .order-details{grid-template-rows:1fr;opacity:1}
.order-details-inner{display:flex;flex-direction:column;gap:8px;padding:0 12px 12px}
.order-panel{padding:10px;border-radius:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.order-panel--mini{padding:8px 10px}
.order-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4)}
.order-stage-pill{font-size:8px;font-weight:800;letter-spacing:.06em;color:#fbbf24;background:rgba(245,158,11,.12);padding:2px 7px;border-radius:999px}
.order-panel-label{margin:0 0 2px;font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38)}
.order-panel-value{margin:0;font-size:10.5px;font-weight:600;color:rgba(255,255,255,.85)}
.order-timeline{position:relative;display:flex;justify-content:space-between;padding-top:2px}
.order-timeline::before{content:'';position:absolute;top:6px;left:8%;right:8%;height:2px;background:rgba(255,255,255,.08);border-radius:999px}
.order-timeline-step{position:relative;z-index:1;flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:6px}
.order-timeline-dot{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(8,8,10,.9);transition:background .28s,box-shadow .28s,transform .28s}
.order-timeline-step.is-done .order-timeline-dot{background:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.15)}
.order-timeline-step.is-current .order-timeline-dot{background:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.2);animation:pulseDot 2s ease-in-out infinite;transform:scale(1.1)}
.order-timeline-label{font-size:8.5px;font-weight:600;color:rgba(255,255,255,.3);text-align:center}
.order-timeline-step.is-done .order-timeline-label{color:rgba(255,255,255,.6)}
.order-timeline-step.is-current .order-timeline-label{color:#fbbf24;font-weight:800}
.order-items{display:flex;flex-direction:column;gap:6px}
.order-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)}
.order-item-main{display:flex;align-items:center;gap:10px;min-width:0}
.order-item-thumb{width:40px;height:40px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,.05);flex-shrink:0}
.order-item-thumb img{width:100%;height:100%;object-fit:cover}
.order-item-body{min-width:0}
.order-item-name{margin:0;font-size:10.5px;font-weight:700;color:#fff}
.order-item-meta{margin:1px 0 0;font-size:9px;color:rgba(255,255,255,.45)}
.order-item-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.order-item-qty{font-size:9.5px;color:rgba(255,255,255,.45)}
.order-item-price{font-size:10.5px;font-weight:700;color:#fff}
.order-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
.order-actions{display:flex;gap:6px}
.order-actions .pd-btn{flex:1 1 0}
.cart-step{display:flex;flex-direction:column;gap:14px}
.cart-step.is-hidden{display:none}
.cart-items{display:flex;flex-direction:row;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.cart-items::-webkit-scrollbar{display:none}
.cart-item-row{flex:0 0 auto;min-width:250px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);transition:background .2s}
.cart-item-row:hover{background:rgba(255,255,255,.06)}
.cart-item-main{display:flex;align-items:center;gap:10px;min-width:0}
.cart-item-thumb{width:50px;height:50px;border-radius:10px;overflow:hidden;background:rgba(255,255,255,.05);flex-shrink:0}
.cart-item-thumb img{width:100%;height:100%;object-fit:cover}
.cart-item-meta{min-width:0}
.cart-item-title{margin:0;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cart-item-variants{display:flex;align-items:center;gap:5px;margin-top:3px}
.cart-chip{font-size:8px;font-weight:800;text-transform:uppercase;color:rgba(255,255,255,.5);background:rgba(255,255,255,.07);padding:1px 5px;border-radius:4px}
.cart-dot{width:5px;height:5px;border-radius:50%;background:#3b82f6}
.cart-variant{font-size:9px;font-weight:700;color:rgba(255,255,255,.45)}
.cart-qty{font-size:9px;color:rgba(255,255,255,.35);margin-left:3px}
.cart-item-price{margin:3px 0 0;font-size:10px;font-weight:800;color:#60a5fa}
.cart-remove{flex-shrink:0;border:none;background:none;padding:4px 8px;border-radius:8px;font-family:inherit;font-size:9.5px;font-weight:700;color:rgba(248,113,113,.6);cursor:pointer;transition:background .2s,color .2s}
.cart-remove:hover{background:rgba(239,68,68,.08);color:#f87171}
.cart-section{padding-top:12px;border-top:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;gap:9px}
.cart-section-label{font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.42)}
.cart-section-label em{font-style:normal;text-transform:none;letter-spacing:0;opacity:.5}
.cart-section-toggle{display:flex;align-items:center;justify-content:space-between;border:none;background:none;padding:0;font-family:inherit;cursor:pointer;width:100%}
.cart-section-status{font-size:10px;font-weight:800;color:#60a5fa;transition:color .2s}
.cart-section-status.is-success{color:#34d399}
.cart-section-status.is-error{color:#f87171}
.ship-toggle{display:flex;gap:5px;padding:3px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
.ship-toggle-btn{flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 8px;border-radius:9px;border:none;background:transparent;color:rgba(255,255,255,.5);font-family:inherit;font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:background .22s,color .22s}
.ship-toggle-btn:hover{color:#fff}
.ship-toggle-btn.is-active{background:#fff;color:#000}
.ship-toggle-btn.is-disabled{opacity:.35;cursor:not-allowed;pointer-events:none}
.ship-panel{display:flex;flex-direction:column;gap:8px}
.ship-panel.is-hidden{display:none}
.address-list{display:flex;flex-direction:column;gap:6px}
.address-card{display:flex;align-items:flex-start;gap:10px;padding:10px;border-radius:12px;border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);cursor:pointer;transition:border-color .22s,background .22s,box-shadow .22s}
.address-card:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.15)}
.address-card.is-selected{border-color:rgba(59,130,246,.5);background:rgba(59,130,246,.08);box-shadow:0 0 0 1px rgba(59,130,246,.15) inset}
.address-icon{flex:0 0 30px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:13px;color:rgba(255,255,255,.6);transition:background .2s,color .2s}
.address-card.is-selected .address-icon{background:rgba(59,130,246,.15);color:#60a5fa}
.address-body{flex:1 1 auto;min-width:0}
.address-head{display:flex;align-items:center;gap:6px;margin-bottom:2px}
.address-label{font-size:11px;font-weight:700;color:#fff}
.address-tag{font-size:7.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#34d399;background:rgba(16,185,129,.12);padding:2px 6px;border-radius:999px}
.address-tag--blue{color:#60a5fa;background:rgba(59,130,246,.12)}
.address-line{margin:0;font-size:10px;line-height:1.45;color:rgba(255,255,255,.55)}
.address-phone{margin:2px 0 0;font-size:9px;color:rgba(255,255,255,.38)}
.address-check{opacity:0;transform:scale(.5);transition:opacity .24s cubic-bezier(.16,1,.3,1),transform .24s cubic-bezier(.16,1,.3,1);color:#34d399;font-size:13px;flex-shrink:0}
.address-card.is-selected .address-check{opacity:1;transform:scale(1)}
.cart-dashed-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;border-radius:11px;border:1px dashed rgba(255,255,255,.16);background:transparent;color:rgba(255,255,255,.5);font-family:inherit;font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:background .2s,border-color .2s,color .2s}
.cart-dashed-btn:hover{color:#fff;border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.04)}
.cart-form-box{display:flex;flex-direction:column;gap:7px;padding:10px;margin-top:8px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}
.cart-input{width:100%;padding:9px 11px;border-radius:9px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:#fff;font-family:inherit;font-size:11px;outline:none;transition:border-color .2s}
.cart-input::placeholder{color:rgba(255,255,255,.3)}
.cart-input:focus{border-color:rgba(59,130,246,.5)}
.cart-form-actions{display:flex;gap:6px;padding-top:2px}
.cart-form-actions .pd-btn{flex:1 1 0}
.cart-alert{display:flex;flex-direction:column;gap:3px;padding:12px;border-radius:12px;text-align:center;align-items:center}
.cart-alert--error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2)}
.cart-alert--error i{font-size:18px;color:#f87171;margin-bottom:4px}
.cart-alert--error p{margin:0;font-size:10.5px;color:rgba(248,113,113,.85)}
.cart-alert--info{flex-direction:row;text-align:left;align-items:flex-start;gap:8px;margin-top:8px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.15)}
.cart-alert--info i{font-size:12px;color:#60a5fa;margin-top:1px}
.cart-alert--info p{margin:0;font-size:9.5px;line-height:1.5;color:rgba(147,197,253,.8)}
.promo-input-wrapper{display:flex;gap:6px;padding:4px 8px;background:rgba(255,255,255,.04);border-radius:11px;border:1px solid rgba(255,255,255,.08);transition:border-color .2s}
.promo-input-wrapper:focus-within{border-color:rgba(59,130,246,.4)}
.promo-input{flex:1 1 auto;min-width:0;background:transparent;border:none;outline:none;color:#fff;font-family:inherit;font-size:11px;font-weight:500;padding:8px 4px}
.promo-input::placeholder{color:rgba(255,255,255,.25)}
.promo-apply-btn{flex-shrink:0;padding:6px 16px;border-radius:8px;border:none;background:#fff;color:#000;font-family:inherit;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;transition:background .2s,transform .14s}
.promo-apply-btn:hover{background:#e5e7eb}
.promo-apply-btn:active{transform:scale(.96)}
.promo-suggestions{padding:8px 2px 2px}
.promo-suggestions-label{font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.3);font-weight:800;margin-bottom:6px}
.promo-tags{display:flex;flex-wrap:wrap;gap:5px}
.promo-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04);color:rgba(255,255,255,.7);font-size:9px;font-weight:700;cursor:pointer;transition:background .2s,border-color .2s,color .2s}
.promo-tag:hover{background:rgba(59,130,246,.14);border-color:rgba(59,130,246,.3);color:#fff}
.promo-tag-code{letter-spacing:.04em}
.promo-tag-discount{font-size:7.5px;opacity:.6}
.cart-totals{gap:7px}
.cart-total-row{display:flex;align-items:center;justify-content:space-between;font-size:10.5px;color:rgba(255,255,255,.5)}
.cart-total-row span:last-child{color:#fff;font-weight:600}
.cart-total-row--grand{padding-top:8px;margin-top:2px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;font-weight:800;color:#fff}
.cart-total-row--grand span:last-child{font-size:14px;font-weight:800}
.cart-discount{color:#34d399!important}
.cart-primary-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:13px;border-radius:13px;border:1px solid rgba(0,0,0,.1);background:#fff;color:#000;font-family:inherit;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;transition:background .2s,transform .14s}
.cart-primary-btn:hover{background:#e5e7eb}
.cart-primary-btn:active{transform:scale(.98)}
.cart-primary-btn:disabled{opacity:.6;cursor:wait}
.cart-back-btn{display:inline-flex;align-items:center;gap:5px;border:none;background:none;padding:0;font-family:inherit;font-size:10.5px;font-weight:700;color:#60a5fa;cursor:pointer;align-self:flex-start}
.cart-back-btn:hover{text-decoration:underline}
.cart-summary-card{padding:12px;border-radius:13px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:8px}
.cart-summary-head{display:flex;align-items:center;justify-content:space-between;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4)}
.cart-textarea{width:100%;min-height:68px;resize:none;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;font-family:inherit;font-size:11px;outline:none;transition:border-color .2s}
.cart-textarea::placeholder{color:rgba(255,255,255,.3)}
.cart-textarea:focus{border-color:rgba(59,130,246,.5)}
.payment-list{display:flex;flex-direction:column;gap:6px}
.payment-option{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);cursor:pointer;transition:border-color .22s,background .22s,box-shadow .22s}
.payment-option:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.15)}
.payment-option.is-selected{border-color:rgba(59,130,246,.5);background:rgba(59,130,246,.08);box-shadow:0 0 0 1px rgba(59,130,246,.15) inset}
.payment-icon{flex:0 0 30px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:13px;color:rgba(255,255,255,.6);transition:background .2s,color .2s}
.payment-option.is-selected .payment-icon{background:rgba(59,130,246,.15);color:#60a5fa}
.payment-body{flex:1 1 auto;min-width:0}
.payment-title{margin:0;font-size:11px;font-weight:700;color:#fff}
.payment-sub{margin:2px 0 0;font-size:9px;color:rgba(255,255,255,.4)}
.payment-check{opacity:0;transform:scale(.5);transition:opacity .24s cubic-bezier(.16,1,.3,1),transform .24s cubic-bezier(.16,1,.3,1);color:#34d399;font-size:13px;flex-shrink:0}
.payment-option.is-selected .payment-check{opacity:1;transform:scale(1)}
.cart-spinner{display:inline-block;width:12px;height:12px;border:2px solid rgba(0,0,0,.2);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;margin-right:6px}
@keyframes spin{to{transform:rotate(360deg)}}
.profile-stack{display:flex;flex-direction:column;gap:10px}
.profile-card{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}
.profile-row{display:flex;align-items:center;gap:12px}
.profile-row--between{justify-content:space-between}
.profile-avatar{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.45);flex-shrink:0}
.profile-avatar svg{width:22px;height:22px}
.profile-id{display:flex;flex-direction:column;gap:1px;min-width:0}
.profile-name{font-size:12px;font-weight:700;color:#fff}
.profile-mail{font-size:10px;color:rgba(255,255,255,.45)}
.profile-actions{display:flex;gap:6px}
.profile-actions .pd-btn{flex:1 1 0}
.profile-edit{flex-shrink:0;padding:5px 12px;border-radius:9px;border:none;background:rgba(59,130,246,.12);color:#60a5fa;font-family:inherit;font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:background .2s}
.profile-edit:hover{background:rgba(59,130,246,.2)}
.profile-link{border:none;background:none;padding:0;font-family:inherit;font-size:10px;font-weight:700;color:#60a5fa;cursor:pointer;align-self:center}
.profile-link:hover{text-decoration:underline}
.auth-wrap{display:flex;flex-direction:column;gap:14px;padding-top:4px}
.auth-form{display:flex;flex-direction:column;gap:10px;padding:14px}
.auth-field{display:flex;flex-direction:column;gap:4px}
.auth-label{font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45)}
.auth-input-wrap{position:relative}
.auth-input{width:100%;padding:11px 12px 11px 38px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;font-family:inherit;font-size:12px;outline:none;transition:border-color .2s,background .2s}
.auth-input::placeholder{color:rgba(255,255,255,.3)}
.auth-input:focus{border-color:rgba(59,130,246,.5);background:rgba(255,255,255,.07)}
.auth-input-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.35);font-size:13px;pointer-events:none}
.auth-input-toggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:none;color:rgba(255,255,255,.4);cursor:pointer;padding:4px;border-radius:6px;transition:color .2s,background .2s}
.auth-input-toggle:hover{color:#fff;background:rgba(255,255,255,.06)}
.auth-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:10px;color:rgba(255,255,255,.55)}
.auth-check{display:inline-flex;align-items:center;gap:6px;cursor:pointer;user-select:none}
.auth-check input{display:none}
.auth-check-box{width:14px;height:14px;border-radius:4px;border:1.5px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;transition:background .2s,border-color .2s}
.auth-check input:checked+.auth-check-box{background:#3b82f6;border-color:#3b82f6}
.auth-check-box i{font-size:9px;color:#fff;opacity:0}
.auth-check input:checked+.auth-check-box i{opacity:1}
.auth-link{border:none;background:none;padding:0;font-family:inherit;font-size:10px;font-weight:700;color:#60a5fa;cursor:pointer}
.auth-link:hover{text-decoration:underline}
.auth-submit{margin-top:2px}
.auth-divider{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.3);font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08)}
.auth-socials{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.auth-social{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);color:#fff;font-family:inherit;font-size:10.5px;font-weight:700;cursor:pointer;transition:background .2s,border-color .2s}
.auth-social:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.18)}
.auth-social i{font-size:14px}
.auth-foot{text-align:center;font-size:10.5px;color:rgba(255,255,255,.5)}
.auth-foot b{color:#60a5fa;cursor:pointer;font-weight:800}
.auth-foot b:hover{text-decoration:underline}
.auth-error{font-size:10px;color:#f87171;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.22);padding:8px 10px;border-radius:9px;display:none}
.auth-error.is-visible{display:block}
.smooth-dropdown{display:grid;grid-template-rows:0fr;opacity:0;pointer-events:none;transition:grid-template-rows .36s cubic-bezier(.16,1,.3,1),opacity .22s ease}
.smooth-dropdown>*{overflow:hidden;min-height:0}
.smooth-dropdown.is-open{grid-template-rows:1fr;opacity:1;pointer-events:auto}
.gallery-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.gallery-card{display:flex;flex-direction:column;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);cursor:pointer;font-family:inherit;text-align:left;padding:0;transition:background .2s,border-color .2s,transform .14s}
.gallery-card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}
.gallery-card:active{transform:scale(.98)}
.gallery-thumb{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:rgba(255,255,255,.04)}
.gallery-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.gallery-fav{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;transition:color .2s,background .2s,transform .14s}
.gallery-fav:hover{color:#f472b6;background:rgba(0,0,0,.7)}
.gallery-fav.is-on{color:#ec4899;background:rgba(236,72,153,.2);border-color:rgba(236,72,153,.4)}
.gallery-fav:active{transform:scale(.9)}
.gallery-meta{padding:8px 10px 10px;display:flex;flex-direction:column;gap:2px}
.gallery-brand{font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#60a5fa}
.gallery-title{margin:0;font-size:11px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gallery-price{font-size:11px;font-weight:800;color:#fff;margin-top:2px}
.pd-dots{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 0 2px;flex-wrap:wrap}
.pd-dot{width:6px;height:6px;border-radius:999px;padding:0;border:none;cursor:pointer;background:rgba(255,255,255,.22);transition:width .28s cubic-bezier(.16,1,.3,1),background .22s,transform .16s}
.pd-dot:hover{background:rgba(255,255,255,.45)}
.pd-dot:active{transform:scale(.85)}
.pd-dot.is-active{width:20px;background:#fff}
.pd-gallery-expand{position:absolute;top:8px;left:8px;z-index:2;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;transition:background .2s,transform .14s}
.pd-gallery-expand:hover{background:rgba(0,0,0,.75)}
.pd-gallery-expand:active{transform:scale(.9)}
.pd-lightbox{position:fixed;inset:0;z-index:10050;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(6,6,8,.94);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .28s ease,visibility .28s}
.pd-lightbox.is-open{opacity:1;visibility:visible;pointer-events:auto}
.pd-lightbox-frame{position:relative;width:min(680px,calc(100vw - 28px));height:min(72vh,620px);border-radius:22px;overflow:hidden;background:#111114;border:1px solid rgba(255,255,255,.10);box-shadow:0 30px 80px -20px rgba(0,0,0,.9)}
.pd-lightbox-track{display:flex;height:100%;width:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.pd-lightbox-track::-webkit-scrollbar{display:none}
.pd-lightbox-slide{width:100%;height:100%;object-fit:contain;flex-shrink:0;scroll-snap-align:center;background:#0d0d10}
.pd-lightbox-counter{position:absolute;right:10px;bottom:10px;padding:3px 9px;border-radius:999px;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);color:rgba(255,255,255,.85);font-size:9px;font-weight:700}
.pd-lightbox-close{position:absolute;top:calc(18px + env(safe-area-inset-top,0px));right:18px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;transition:background .2s,transform .14s}
.pd-lightbox-close:hover{background:rgba(255,255,255,.16)}
.pd-lightbox-close:active{transform:scale(.93)}
.gallery-filterbar{display:flex;gap:6px;margin-bottom:9px;min-height:0}
.gallery-chip{display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border-radius:999px;background:rgba(59,130,246,.14);border:1px solid rgba(59,130,246,.30);color:#93c5fd;font-family:inherit;font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:background .2s,border-color .2s}
.gallery-chip:hover{background:rgba(59,130,246,.24);border-color:rgba(59,130,246,.5)}
.gallery-chip i{font-size:10px;opacity:.85}
.category-count{position:absolute;left:8px;bottom:8px;padding:3px 9px;border-radius:999px;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);color:#fff;font-size:9px;font-weight:800;letter-spacing:.03em}
/* ── v4 · other stores ─────────────────────────────────────────────── */
.stores-section{margin-bottom:14px}
.stores-section-head{display:flex;align-items:center;justify-content:space-between;padding:0 4px 8px;font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.35)}
.stores-section-title{display:inline-flex;align-items:center;gap:5px}
.stores-section-title i{font-size:10px;color:#60a5fa}
.stores-section-count{color:#60a5fa;letter-spacing:.02em}
.stores-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.stores-row::-webkit-scrollbar{display:none}
.store-card{flex:0 0 auto;width:150px;display:flex;flex-direction:column;gap:7px;padding:11px;border-radius:13px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);cursor:pointer;text-align:left;transition:background .2s,border-color .2s,transform .14s}
.store-card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}
.store-card:active{transform:scale(.98)}
.store-card-logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;letter-spacing:.02em}
.store-card-name{margin:0;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.store-card-meta{display:flex;align-items:center;gap:4px;font-size:9px;color:rgba(255,255,255,.45)}
.store-card-rating{color:#facc15;font-weight:700}
.store-follow-btn{margin-top:auto;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:rgba(255,255,255,.7);font-family:inherit;font-size:9px;font-weight:800;letter-spacing:.05em;cursor:pointer;transition:background .2s,color .2s,border-color .2s;align-self:flex-start}
.store-follow-btn:hover{background:rgba(255,255,255,.1);color:#fff}
.store-follow-btn.is-following{background:rgba(59,130,246,.16);border-color:rgba(59,130,246,.35);color:#93c5fd}
.stores-list{display:flex;flex-direction:column;gap:6px;max-height:260px;overflow-y:auto;scrollbar-width:none;padding-right:2px}
.stores-list::-webkit-scrollbar{display:none}
.store-row{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);cursor:pointer;font-family:inherit;text-align:left;width:100%;transition:background .2s,border-color .2s}
.store-row:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}
.store-row-logo{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;flex-shrink:0}
.store-row-body{flex:1 1 auto;min-width:0}
.store-row-name{display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.store-row-verified{color:#34d399;font-size:11px}
.store-row-meta{display:flex;align-items:center;gap:5px;font-size:9.5px;color:rgba(255,255,255,.45);margin-top:1px}
.store-row-cats{font-size:9px;color:rgba(255,255,255,.35);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.store-row-chev{font-size:11px;color:rgba(255,255,255,.2);flex-shrink:0}
.stores-cat-desc{margin:6px 2px 0;font-size:9.5px;color:rgba(255,255,255,.38);font-style:italic;line-height:1.45}
.stores-cat-desc:empty{display:none}
#storeMainCatDropdop{width:100%}
#storeSubCatWrap{width:100%}
#storeSubCatWrap .dropdop{width:100%}
/* ── v4.2 · AI chat ───────────────────────────────────────────────── */
.hub-chat{display:flex;flex-direction:column;gap:8px;padding:11px;border-radius:13px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)}
.hub-chat-head{display:flex;align-items:center;gap:6px;font-size:8.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45)}
.hub-chat-head>i{color:#a78bfa;font-size:11px}
.hub-chat-badge{margin-left:auto;font-size:7.5px;font-weight:800;letter-spacing:.05em;padding:2px 7px;border-radius:999px;background:rgba(148,163,184,.16);color:#cbd5e1;border:1px solid rgba(148,163,184,.28)}
.hub-chat-badge.is-live{background:rgba(34,197,94,.16);color:#86efac;border-color:rgba(34,197,94,.35)}
.hub-chat-feed{display:flex;flex-direction:column;gap:6px;max-height:210px;min-height:36px;overflow-y:auto;scrollbar-width:none;padding:2px 2px 0}
.hub-chat-feed::-webkit-scrollbar{display:none}
.chat-user-msg{align-self:flex-end;max-width:88%;padding:7px 11px;border-radius:12px 12px 4px 12px;background:#3b82f6;color:#fff;font-size:11.5px;line-height:1.4;word-wrap:break-word;white-space:pre-wrap}
.chat-ai-msg{align-self:flex-start;max-width:88%;padding:8px 11px;border-radius:12px 12px 12px 4px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.9);font-size:11.5px;line-height:1.45;word-wrap:break-word;white-space:pre-wrap;animation:fadeUp .26s ease-out}
.chat-ai-msg.is-typing{opacity:.55;font-style:italic}
.hub-chat-suggests{display:flex;flex-wrap:wrap;gap:4px}
.chat-ai-suggest{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:rgba(255,255,255,.7);font-family:inherit;font-size:9.5px;font-weight:600;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.chat-ai-suggest:hover{background:rgba(167,139,250,.16);border-color:rgba(167,139,250,.35);color:#fff}
.hub-chat-input-row{display:flex;gap:6px;align-items:flex-end}
.chat-input{flex:1 1 auto;min-height:38px;max-height:110px;resize:none;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;font-family:inherit;font-size:11.5px;line-height:1.4;outline:none;transition:border-color .2s,background .2s}
.chat-input::placeholder{color:rgba(255,255,255,.3)}
.chat-input:focus{border-color:rgba(167,139,250,.55);background:rgba(255,255,255,.07)}
.chat-send-btn{flex:0 0 auto;width:38px;height:38px;border-radius:50%;border:none;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:transform .14s,opacity .2s}
.chat-send-btn:hover{transform:scale(1.05)}
.chat-send-btn:active{transform:scale(.95)}
.chat-send-btn:disabled{opacity:.5;cursor:wait}
.theme-toggle-btn{flex:0 0 auto;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;transition:background .2s,border-color .2s,transform .14s}
.theme-toggle-btn:hover{background:rgba(255,255,255,.1)}
.theme-toggle-btn:active{transform:scale(.9)}
/* ── v4.2 · Light theme ───────────────────────────────────────────── */
.sticky-cta[data-theme="light"]{background:#e8e8ec}
.sticky-cta[data-theme="light"] .sticky-promo-banner{background:#f9fafb;border-bottom-color:#e5e7eb}
.sticky-cta[data-theme="light"] .sticky-cta-panel-inner{background:#fff;border-bottom-color:#e5e7eb}
.sticky-cta[data-theme="light"] .sticky-notif-card{background:#fff;border-bottom-color:#e5e7eb}
.sticky-cta[data-theme="light"] .sticky-notif-title{color:#2563eb}
.sticky-cta[data-theme="light"] .sticky-notif-text{color:#374151}
.sticky-cta[data-theme="light"] .sticky-notif-date{color:rgba(0,0,0,.45)}
.sticky-cta[data-theme="light"] .sticky-notif-close{background:#f3f4f6;border-color:#e5e7eb;color:rgba(0,0,0,.5)}
.sticky-cta[data-theme="light"] .sticky-notif-hint{color:#1d4ed8;text-decoration-color:rgba(29,78,216,.3)}
.sticky-cta[data-theme="light"] .sticky-cta-back,
.sticky-cta[data-theme="light"] .sticky-cta-toggle{background:#fff;border-color:#e5e7eb;color:#111}
.sticky-cta[data-theme="light"] .sticky-cta-back:hover,
.sticky-cta[data-theme="light"] .sticky-cta-toggle:hover{background:#f3f4f6}
.sticky-cta[data-theme="light"] .sticky-cta-primary{background:#111!important;color:#fff!important;border-color:#111!important}
.sticky-cta[data-theme="light"] .sticky-cta-primary:hover{background:#333!important}
.sticky-cta[data-theme="light"] .view-title,
.sticky-cta[data-theme="light"] .cta-metric-value,
.sticky-cta[data-theme="light"] .pd-title,
.sticky-cta[data-theme="light"] .gallery-title,
.sticky-cta[data-theme="light"] .gallery-price,
.sticky-cta[data-theme="light"] .store-card-name,
.sticky-cta[data-theme="light"] .store-row-name,
.sticky-cta[data-theme="light"] .order-card-title,
.sticky-cta[data-theme="light"] .order-total,
.sticky-cta[data-theme="light"] .cart-item-title,
.sticky-cta[data-theme="light"] .profile-name,
.sticky-cta[data-theme="light"] .pd-price,
.sticky-cta[data-theme="light"] .pd-section-label,
.sticky-cta[data-theme="light"] .notif-msg,
.sticky-cta[data-theme="light"] .pd-text,
.sticky-cta[data-theme="light"] .address-label,
.sticky-cta[data-theme="light"] .pd-review-name,
.sticky-cta[data-theme="light"] .pd-review-text,
.sticky-cta[data-theme="light"] .payment-title,
.sticky-cta[data-theme="light"] .order-item-name,
.sticky-cta[data-theme="light"] .order-item-price,
.sticky-cta[data-theme="light"] .order-panel-value,
.sticky-cta[data-theme="light"] .search-row-title,
.sticky-cta[data-theme="light"] .chat-ai-msg{color:#111}
.sticky-cta[data-theme="light"] .pd-text--muted{color:#4b5563;opacity:1}
.sticky-cta[data-theme="light"] .pd-old-price{color:rgba(0,0,0,.4)}
.sticky-cta[data-theme="light"] .cta-tile,
.sticky-cta[data-theme="light"] .hub-ad,
.sticky-cta[data-theme="light"] .cta-metrics,
.sticky-cta[data-theme="light"] .gallery-card,
.sticky-cta[data-theme="light"] .store-card,
.sticky-cta[data-theme="light"] .store-row,
.sticky-cta[data-theme="light"] .notif-card,
.sticky-cta[data-theme="light"] .order-card,
.sticky-cta[data-theme="light"] .order-panel,
.sticky-cta[data-theme="light"] .order-item,
.sticky-cta[data-theme="light"] .cart-item-row,
.sticky-cta[data-theme="light"] .address-card,
.sticky-cta[data-theme="light"] .payment-option,
.sticky-cta[data-theme="light"] .profile-card,
.sticky-cta[data-theme="light"] .pd-rating-summary,
.sticky-cta[data-theme="light"] .pd-review-card,
.sticky-cta[data-theme="light"] .pd-delivery-item,
.sticky-cta[data-theme="light"] .pd-note,
.sticky-cta[data-theme="light"] .cart-summary-card,
.sticky-cta[data-theme="light"] .cart-form-box,
.sticky-cta[data-theme="light"] .pd-whatsapp,
.sticky-cta[data-theme="light"] .auth-social,
.sticky-cta[data-theme="light"] .auth-form,
.sticky-cta[data-theme="light"] .hub-chat,
.sticky-cta[data-theme="light"] .ship-toggle{background:#f9fafb;border-color:#e5e7eb}
.sticky-cta[data-theme="light"] .cta-tile:hover,
.sticky-cta[data-theme="light"] .gallery-card:hover,
.sticky-cta[data-theme="light"] .store-card:hover,
.sticky-cta[data-theme="light"] .store-row:hover,
.sticky-cta[data-theme="light"] .notif-card:hover{background:#f3f4f6;border-color:#d1d5db}
.sticky-cta[data-theme="light"] .hub-ad-msg-text,
.sticky-cta[data-theme="light"] .cta-tile,
.sticky-cta[data-theme="light"] .cta-tile-label,
.sticky-cta[data-theme="light"] .search-row-meta,
.sticky-cta[data-theme="light"] .store-row-meta,
.sticky-cta[data-theme="light"] .store-row-cats,
.sticky-cta[data-theme="light"] .order-date,
.sticky-cta[data-theme="light"] .cart-item-price{color:#4b5563}
.sticky-cta[data-theme="light"] .mini-pill{background:#f3f4f6;border-color:#e5e7eb;color:#374151}
.sticky-cta[data-theme="light"] .view-eyebrow,
.sticky-cta[data-theme="light"] .gallery-brand,
.sticky-cta[data-theme="light"] .pd-brand{color:#2563eb}
.sticky-cta[data-theme="light"] .mini-label,
.sticky-cta[data-theme="light"] .cart-section-label,
.sticky-cta[data-theme="light"] .stores-section-head,
.sticky-cta[data-theme="light"] .search-block-head,
.sticky-cta[data-theme="light"] .promo-suggestions-label,
.sticky-cta[data-theme="light"] .hub-chat-head{color:rgba(0,0,0,.5)}
.sticky-cta[data-theme="light"] .search-input,
.sticky-cta[data-theme="light"] .cart-input,
.sticky-cta[data-theme="light"] .cart-textarea,
.sticky-cta[data-theme="light"] .promo-input,
.sticky-cta[data-theme="light"] .auth-input,
.sticky-cta[data-theme="light"] .pd-textarea-wrap textarea,
.sticky-cta[data-theme="light"] .chat-input{background:#fff;border-color:#d1d5db;color:#111}
.sticky-cta[data-theme="light"] .search-input::placeholder,
.sticky-cta[data-theme="light"] .cart-input::placeholder,
.sticky-cta[data-theme="light"] .cart-textarea::placeholder,
.sticky-cta[data-theme="light"] .promo-input::placeholder,
.sticky-cta[data-theme="light"] .auth-input::placeholder,
.sticky-cta[data-theme="light"] .pd-textarea-wrap textarea::placeholder,
.sticky-cta[data-theme="light"] .chat-input::placeholder{color:rgba(0,0,0,.35)}
.sticky-cta[data-theme="light"] .pd-btn--primary,
.sticky-cta[data-theme="light"] .cart-primary-btn,
.sticky-cta[data-theme="light"] .promo-apply-btn{background:#111;color:#fff;border-color:#111}
.sticky-cta[data-theme="light"] .pd-btn--primary:hover,
.sticky-cta[data-theme="light"] .cart-primary-btn:hover{background:#333}
.sticky-cta[data-theme="light"] .pd-btn--ghost,
.sticky-cta[data-theme="light"] .pd-btn--muted,
.sticky-cta[data-theme="light"] .pd-btn--icon,
.sticky-cta[data-theme="light"] .cart-dashed-btn{background:#f3f4f6;border-color:#d1d5db;color:#374151}
.sticky-cta[data-theme="light"] .pd-btn--ghost:hover,
.sticky-cta[data-theme="light"] .pd-btn--muted:hover{background:#e5e7eb}
.sticky-cta[data-theme="light"] .tab-btn{color:rgba(0,0,0,.5)}
.sticky-cta[data-theme="light"] .tab-btn.is-active{color:#2563eb;border-bottom-color:#2563eb}
.sticky-cta[data-theme="light"] .search-mode-btn{background:#f3f4f6;border-color:#e5e7eb;color:#374151}
.sticky-cta[data-theme="light"] .search-mode-btn.is-active{background:#111;color:#fff;border-color:#111}
.sticky-cta[data-theme="light"] .search-tile{background:#f9fafb;border-color:#e5e7eb;color:#111}
.sticky-cta[data-theme="light"] .search-tile:hover{background:#f3f4f6}
.sticky-cta[data-theme="light"] .filter-trigger{background:#f3f4f6;border-color:#e5e7eb;color:#111}
.sticky-cta[data-theme="light"] .filter-dropdown{background:#fff;border-color:#e5e7eb;box-shadow:0 18px 44px -12px rgba(0,0,0,.15)}
.sticky-cta[data-theme="light"] .filter-dropdown-header{color:rgba(0,0,0,.5)}
.sticky-cta[data-theme="light"] .filter-option{color:#374151}
.sticky-cta[data-theme="light"] .filter-option:hover{background:#f3f4f6;color:#111}
.sticky-cta[data-theme="light"] .filter-option.is-selected{background:rgba(37,99,235,.1);color:#2563eb}
/* Light theme for the pane dropdops */
.sticky-cta[data-theme="light"] .pd-options .dropdop .btndop{background:#f3f4f6;border-color:#e5e7eb;color:#111}
.sticky-cta[data-theme="light"] .pd-options .dropdop .btndop:hover{background:#e5e7eb}
.sticky-cta[data-theme="light"] .pd-options .dropdop .menudop{background:#fff;border-color:#e5e7eb}
.sticky-cta[data-theme="light"] .pd-options .dropdop .optdop{color:#111}
.sticky-cta[data-theme="light"] .pd-options .dropdop .optdop:hover{background:#f3f4f6}
.sticky-cta[data-theme="light"] .pd-options .dropdop .search-wrap{background:#fff;border-bottom-color:#e5e7eb}
.sticky-cta[data-theme="light"] .pd-options .dropdop .searchdop{background:#f3f4f6;color:#111}
.sticky-cta[data-theme="light"] .store-follow-btn{background:#fff;border-color:#d1d5db;color:#374151}
.sticky-cta[data-theme="light"] .store-follow-btn.is-following{background:rgba(37,99,235,.12);border-color:rgba(37,99,235,.3);color:#2563eb}
.sticky-cta[data-theme="light"] .notif-empty,
.sticky-cta[data-theme="light"] .search-empty p,
.sticky-cta[data-theme="light"] .pd-review-date,
.sticky-cta[data-theme="light"] .pd-review-variants{color:rgba(0,0,0,.5)}
.sticky-cta[data-theme="light"] .search-empty small,
.sticky-cta[data-theme="light"] .pd-rating-count,
.sticky-cta[data-theme="light"] .address-line,
.sticky-cta[data-theme="light"] .address-phone{color:rgba(0,0,0,.4)}
.sticky-cta[data-theme="light"] .store-row-chev,
.sticky-cta[data-theme="light"] .search-row-chev,
.sticky-cta[data-theme="light"] .notif-chev,
.sticky-cta[data-theme="light"] .order-chevron{color:rgba(0,0,0,.3)}
.sticky-cta[data-theme="light"] .cart-section,
.sticky-cta[data-theme="light"] .pd-review-foot,
.sticky-cta[data-theme="light"] .notif-footer,
.sticky-cta[data-theme="light"] .cart-total-row--grand{border-top-color:#e5e7eb}
.sticky-cta[data-theme="light"] .cart-total-row{color:rgba(0,0,0,.6)}
.sticky-cta[data-theme="light"] .cart-total-row span:last-child{color:#111}
.sticky-cta[data-theme="light"] .theme-toggle-btn{background:#f3f4f6;border-color:#e5e7eb;color:#111}
.sticky-cta[data-theme="light"] .chat-ai-msg{background:#f3f4f6;border-color:#e5e7eb}
.sticky-cta[data-theme="light"] .chat-ai-suggest{background:#f3f4f6;border-color:#e5e7eb;color:#374151}
.sticky-cta[data-theme="light"] .chat-ai-suggest:hover{background:#e5e7eb;color:#111}
.sticky-cta[data-theme="light"] .chat-user-msg{background:#111;color:#fff}
.sticky-cta[data-theme="light"] .auth-divider{color:rgba(0,0,0,.4)}
.sticky-cta[data-theme="light"] .auth-divider::before,
.sticky-cta[data-theme="light"] .auth-divider::after{background:#e5e7eb}
.sticky-cta[data-theme="light"] .auth-check-box{border-color:rgba(0,0,0,.3)}
.sticky-cta[data-theme="light"] .auth-row,
.sticky-cta[data-theme="light"] .auth-foot{color:rgba(0,0,0,.55)}
.sticky-cta[data-theme="light"] .order-id,
.sticky-cta[data-theme="light"] .order-item-meta,
.sticky-cta[data-theme="light"] .order-item-qty,
.sticky-cta[data-theme="light"] .order-panel-head{color:rgba(0,0,0,.45)}
.sticky-cta[data-theme="light"] .order-status{background:rgba(245,158,11,.15)}
.sticky-cta[data-theme="light"] .address-icon,
.sticky-cta[data-theme="light"] .payment-icon{background:#f3f4f6;color:#4b5563}
.sticky-cta[data-theme="light"] .pd-whatsapp:hover{background:#f3f4f6;border-color:#d1d5db}
.sticky-cta[data-theme="light"] .pd-rating-bar-track{background:#e5e7eb}
.sticky-cta[data-theme="light"] .pd-rating-bar-label,
.sticky-cta[data-theme="light"] .pd-rating-bar-value{color:rgba(0,0,0,.5)}
.sticky-cta[data-theme="light"] .pd-review-avatar{background:rgba(99,102,241,.15);color:#4f46e5}
.sticky-cta[data-theme="light"] .pd-reviewer-avatar{background:#4f46e5}
.sticky-cta[data-theme="light"] .promo-input-wrapper{background:#fff;border-color:#d1d5db}
.sticky-cta[data-theme="light"] .promo-tag{background:#f9fafb;border-color:#e5e7eb;color:#374151}
.sticky-cta[data-theme="light"] .promo-tag:hover{background:rgba(37,99,235,.1);color:#2563eb}
.sticky-cta[data-theme="light"] .cart-alert--info{background:rgba(37,99,235,.06);border-color:rgba(37,99,235,.18)}
.sticky-cta[data-theme="light"] .cart-alert--info p{color:#1d4ed8}
.sticky-cta[data-theme="light"] .cart-section-toggle .cart-section-status{color:#2563eb}
.sticky-cta[data-theme="light"] .gallery-fav{background:rgba(255,255,255,.85);border-color:rgba(0,0,0,.1);color:rgba(0,0,0,.5)}
.sticky-cta[data-theme="light"] .gallery-fav:hover{background:#fff;color:#ec4899}
.sticky-cta[data-theme="light"] .gallery-fav.is-on{background:rgba(236,72,153,.15);color:#ec4899}
.sticky-cta[data-theme="light"] .pd-gallery-expand{background:rgba(255,255,255,.9);border-color:rgba(0,0,0,.1);color:#111}
.sticky-cta[data-theme="light"] .pd-gallery-badge{background:rgba(255,255,255,.9);color:#111}
.sticky-cta[data-theme="light"] .gallery-chip{background:rgba(37,99,235,.1);border-color:rgba(37,99,235,.25);color:#1d4ed8}
.sticky-cta[data-theme="light"] .category-count{background:rgba(255,255,255,.9);color:#111}
.sticky-cta[data-theme="light"] .stores-cat-desc{color:rgba(0,0,0,.55)}
.sticky-cta[data-theme="light"] .pd-dot{background:rgba(0,0,0,.2)}
.sticky-cta[data-theme="light"] .pd-dot.is-active{background:#111}
.sticky-cta[data-theme="light"] .pd-star-input .bi-star-fill{color:rgba(0,0,0,.2)}
.sticky-cta[data-theme="light"] .pd-star-input .bi-star-fill.is-on{color:#f59e0b}
@media (max-width:480px){.sticky-cta{bottom:calc(14px + env(safe-area-inset-bottom,0px));backdrop-filter:blur(12px) saturate(120%);-webkit-backdrop-filter:blur(12px) saturate(120%)}.sticky-view{padding:14px 13px 12px}.cta-tile{height:34px;padding:0 7px;font-size:9px}.cta-tile-ico{width:20px;height:20px}.cta-tile-ico i{font-size:10.5px}.view-title{font-size:12.5px}.order-grid{grid-template-columns:1fr}.gallery-grid{grid-template-columns:repeat(2,1fr);gap:6px}.pd-lightbox-frame{height:min(64vh,520px)}.store-card{width:132px}.sticky-notif-card{padding:10px 12px 10px 18px;gap:10px}}
@media (max-width:820px),(hover:none) and (pointer:coarse){
  #peacock-sticky-root input:not([type="checkbox"]):not([type="radio"]),
  #peacock-sticky-root textarea,
  #peacock-sticky-root select,
  #pdLightbox input,
  #pdLightbox textarea,
  .dropdop input,.dropdop select,.dropdop textarea{font-size:16px!important}
}
@media (max-width:380px){.sticky-cta{backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}.cta-tile{padding:0 5px}.cta-tile-label{display:none}.cta-tile{justify-content:center}}
@media (prefers-reduced-motion:reduce){.sticky-cta,.sticky-promo-banner,.sticky-notif-zone,.sticky-notif-card,.sticky-cta-panel,.sticky-view,.sticky-cta-toggle,.sticky-cta-back,.cta-tile,.cta-tile-ico,.sticky-cta-overlay,.address-card,.payment-option,.smooth-dropdown,.order-details,.order-chevron,.pd-review-form,.pd-review-text-wrap,.hub-ad-msg,.hub-ad-msg-text,.mv-dot,.pd-dot,.pd-lightbox,.chat-ai-msg{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}.sticky-notif-ring-progress{animation:none!important;stroke-dashoffset:0!important}}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.sticky-cta{background:var(--hub-bg)}.sticky-promo-banner{background:#1a1a1a}.sticky-notif-card{background:var(--notif-bg)}.filter-dropdown{background:rgba(14,14,17,1)}.sticky-cta-overlay{background:rgba(0,0,0,.75)}.gallery-fav{background:rgba(0,0,0,.8)}.pd-lightbox{background:rgba(6,6,8,.98)}}
@supports not (background:color-mix(in srgb,red 50%,blue)){.sticky-notif-ico,.notif-ico{background:rgba(148,163,184,.16);border-color:rgba(148,163,184,.3)}.sticky-notif-hint{color:#e5e7eb;text-decoration-color:rgba(255,255,255,.25)}}
`;

  /* ═══════════════════════════════════════════════════════════════════
     2. ROOT HTML
     ═══════════════════════════════════════════════════════════════════ */
  const ROOT_HTML = `
<div id="sticky-cta-overlay" class="sticky-cta-overlay" aria-hidden="true"></div>
<div class="sticky-cta" id="stickyCta" data-current="hub" data-theme="dark" aria-hidden="true">
  <div class="sticky-promo-banner" id="stickyPromoBanner"></div>
  <div class="sticky-notif-zone" id="stickyNotifZone" aria-live="polite" aria-atomic="false">
    <div class="sticky-notif-zone-inner" id="stickyNotifInner"></div>
  </div>
  <div class="sticky-cta-panel" id="stickyCtaPanel">
    <div class="sticky-cta-panel-inner" id="stickyCtaViews"></div>
  </div>
  <div class="sticky-cta-bar">
    <button class="sticky-cta-back" type="button" id="stickyBackBtn" aria-label="Back">
      <i class="bi bi-chevron-left"></i>
    </button>
    <a href="#" class="sticky-cta-primary" id="stickyPrimaryCta">
      <span>Sign in</span>
      <i class="bi bi-arrow-right-short"></i>
    </a>
    <button class="sticky-cta-toggle" type="button" id="stickyToggleBtn" aria-expanded="false" aria-label="Expand quick access">
      <i class="bi bi-grid-3x3-gap-fill" id="stickyToggleIcon"></i>
    </button>
  </div>
</div>`;

  /* ═══════════════════════════════════════════════════════════════════
     3. DATA — provided entirely by datainjector.js (the "maestro").
        doc.js ships with ZERO hard-coded store data.
     ═══════════════════════════════════════════════════════════════════ */
  let PLATFORM = {};
  let STORE = {};
  let PRODUCTS = {};
  let SHIPPING_ADDRESSES = [];
  let PICKUP_BRANCH = { line: "", hours: "", phone: "", cost: 0 };
  let ORDERS = [];
  let SEARCH_DATA = { products: [], categories: [], stores: [], orders: [] };
  let POPULAR = { brands: [], categories: [] };
  let MAIN_CATEGORIES = [{ id: "all", name: "All categories", desc: "" }];
  let MAIN_CAT_SUBS = {};
  let OTHER_STORES = [];
  let PROMO_BANNER = [];
  let SEED_NOTIFICATIONS = [];
  let STORE_COUPONS = [];
  let CART_SEED_ITEMS = [];
  let CURRENCY = "EGP";
  let STORE_HAS_PICKUP = false;

  const ALERT_TYPES = {
    cart: {
      icon: "bi-bag-check-fill",
      tone: "#10b981",
      label: "Cart",
      view: "cart",
    },
    order: {
      icon: "bi-box-seam-fill",
      tone: "#f59e0b",
      label: "Orders",
      view: "orders",
    },
    auth: {
      icon: "bi-shield-lock-fill",
      tone: "#3b82f6",
      label: "Account",
      view: "profile",
    },
    success: {
      icon: "bi-check-circle-fill",
      tone: "#10b981",
      label: "Success",
      view: null,
    },
    logout: {
      icon: "bi-door-open-fill",
      tone: "#f97316",
      label: "Session",
      view: "profile",
    },
    favorite: {
      icon: "bi-heart-fill",
      tone: "#ec4899",
      label: "Wishlist",
      view: "favorites",
    },
    shipping: {
      icon: "bi-truck",
      tone: "#6366f1",
      label: "Delivery",
      view: "cart",
    },
    reminder: {
      icon: "bi-bell-fill",
      tone: "#f59e0b",
      label: "Restock",
      view: "notfications",
    },
    search: {
      icon: "bi-search",
      tone: "#3b82f6",
      label: "Search",
      view: "search",
    },
    product: {
      icon: "bi-bag",
      tone: "#8b5cf6",
      label: "Product",
      view: "quick-look",
    },
    info: {
      icon: "bi-info-circle-fill",
      tone: "#94a3b8",
      label: "Notice",
      view: null,
    },
    error: {
      icon: "bi-exclamation-triangle-fill",
      tone: "#ef4444",
      label: "Error",
      view: null,
    },
  };

  const I18N = {
    en: {
      quickAccess: "Quick access",
      storeName: "Store",
      live: "Live",
      fitYou: "Fit you",
      inCart: "In cart",
      ordersCount: "Orders",
      promoTitle: "Promo codes",
      promoTap: "Tap to apply",
      cart: "Cart",
      orders: "Orders",
      search: "Search",
      alerts: "Alerts",
      favorites: "Favorites",
      gallery: "Gallery",
      categories: "Categories",
      profile: "Profile",
      stores: "Stores",
    },
    ar: {
      quickAccess: "وصول سريع",
      storeName: "المتجر",
      live: "مباشر",
      fitYou: "يناسبك",
      inCart: "في السلة",
      ordersCount: "الطلبات",
      promoTitle: "أكواد الخصم",
      promoTap: "اضغط للتطبيق",
      cart: "السلة",
      orders: "الطلبات",
      search: "بحث",
      alerts: "التنبيهات",
      favorites: "المفضلة",
      gallery: "المعرض",
      categories: "الفئات",
      profile: "الحساب",
      stores: "المتاجر",
    },
  };

  /* ── Helpers ─────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? "" : s).replace(
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
  function money(n) {
    return CURRENCY + " " + Math.round(Number(n) || 0).toLocaleString();
  }
  function initialsOf(name) {
    return String(name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase();
  }
  function notifDateLabel(ts) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "Just now";
    const now = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    if (d.toDateString() === now.toDateString())
      return "Today · " + hh + ":" + mm;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return d.getDate() + " " + months[d.getMonth()] + " · " + hh + ":" + mm;
  }

  /* ── Hydration ───────────────────────────────────────────────────── */
  function hydrateData() {
    const injector = window.PEACOCK_DATA;
    if (!injector || typeof injector.toLegacy !== "function") {
      console.error(
        "[Peacock] datainjector.js is required and must be loaded BEFORE doc.js.",
      );
      return false;
    }
    let legacy;
    try {
      legacy = injector.toLegacy() || {};
    } catch (err) {
      console.error("[Peacock] DataInjector.toLegacy() threw:", err);
      return false;
    }

    PLATFORM = legacy.PLATFORM || {};
    STORE = legacy.STORE || {};
    PRODUCTS = legacy.PRODUCTS || {};
    SHIPPING_ADDRESSES = legacy.SHIPPING_ADDRESSES || [];
    PICKUP_BRANCH = legacy.PICKUP_BRANCH || {
      line: "",
      hours: "",
      phone: "",
      cost: 0,
    };
    ORDERS = legacy.ORDERS || [];
    SEARCH_DATA = legacy.SEARCH_DATA || {
      products: [],
      categories: [],
      stores: [],
      orders: [],
    };
    POPULAR = legacy.POPULAR || { brands: [], categories: [] };
    MAIN_CATEGORIES = legacy.MAIN_CATEGORIES || [
      { id: "all", name: "All categories", desc: "" },
    ];
    MAIN_CAT_SUBS = legacy.MAIN_CAT_SUBS || {};
    OTHER_STORES = legacy.OTHER_STORES || [];
    PROMO_BANNER = legacy.PROMO_BANNER || [];
    SEED_NOTIFICATIONS = legacy.NOTIFICATIONS || [];
    STORE_COUPONS = legacy.COUPONS || [];
    CART_SEED_ITEMS = legacy.CART_SEED || [];
    CURRENCY = (PLATFORM.currency && PLATFORM.currency.code) || "EGP";
    STORE_HAS_PICKUP = !!(STORE.pickup && STORE.pickup.available);

    console.info(
      "[Peacock] data hydrated from injector · store: " +
        (STORE.name || "—") +
        " · products: " +
        Object.keys(PRODUCTS).length +
        " · stores: " +
        OTHER_STORES.length,
    );
    return true;
  }

  /* ═══════════════════════════════════════════════════════════════════
     4. TEMPLATES
     ═══════════════════════════════════════════════════════════════════ */
  const T = {};
  const ORDER_STAGES = ["Placed", "Processed", "Shipped", "Delivered"];

  /* ── shared partials ─────────────────────────────────────────────── */
  function cartRowsHTML() {
    if (!CART_SEED_ITEMS.length) {
      return (
        '<div class="search-empty" style="width:100%;padding:24px 12px">' +
        '<div class="search-empty-ico"><i class="bi bi-bag"></i></div>' +
        "<p>Your cart is empty</p><small>Add something you love</small></div>"
      );
    }
    return CART_SEED_ITEMS.map((it) => {
      const p = PRODUCTS[it.productId] || {};
      const price = Number(p.price) || 0;
      const qty = Number(it.qty) || 1;
      return (
        '<div class="cart-item-row" data-item-price="' +
        price +
        '" data-quantity="' +
        qty +
        '">' +
        '<div class="cart-item-main">' +
        '<div class="cart-item-thumb"><img src="' +
        esc((p.images && p.images[0]) || "") +
        '" alt=""></div>' +
        '<div class="cart-item-meta">' +
        '<p class="cart-item-title">' +
        esc(p.title || "Item") +
        "</p>" +
        '<div class="cart-item-variants">' +
        '<span class="cart-chip">' +
        esc(it.size || "—") +
        "</span>" +
        '<span class="cart-dot"></span>' +
        '<span class="cart-variant">' +
        esc(it.color || "—") +
        "</span>" +
        '<span class="cart-qty">Qty: ' +
        qty +
        "</span>" +
        "</div>" +
        '<p class="cart-item-price">' +
        money(price * qty) +
        "</p>" +
        "</div>" +
        "</div>" +
        '<button onclick="removeCartItemRow(this)" class="cart-remove">Remove</button>' +
        "</div>"
      );
    }).join("");
  }

  function addressListHTML() {
    if (!SHIPPING_ADDRESSES.length) {
      return (
        '<div class="search-empty" style="padding:20px 12px">' +
        '<div class="search-empty-ico"><i class="bi bi-geo-alt"></i></div>' +
        "<p>No saved addresses</p><small>Add one below</small></div>"
      );
    }
    return SHIPPING_ADDRESSES.map(
      (a, i) =>
        '<div class="address-card' +
        (i === 0 ? " is-selected" : "") +
        '" data-address-id="' +
        esc(a.id) +
        '" data-shipping-cost="' +
        (Number(a.cost) || 0) +
        '" onclick="selectAddress(this)">' +
        '<div class="address-icon"><i class="bi ' +
        esc(a.icon || "bi-geo-alt") +
        '"></i></div>' +
        '<div class="address-body">' +
        '<div class="address-head">' +
        '<span class="address-label">' +
        esc(a.label || "Address") +
        "</span>" +
        (a.tag ? '<span class="address-tag">' + esc(a.tag) + "</span>" : "") +
        "</div>" +
        '<p class="address-line">' +
        esc(a.line || "") +
        "</p>" +
        (a.phone ? '<p class="address-phone">' + esc(a.phone) + "</p>" : "") +
        "</div>" +
        '<i class="bi bi-check-circle-fill address-check"></i>' +
        "</div>",
    ).join("");
  }

  function pickupPanelHTML() {
    if (!STORE_HAS_PICKUP) {
      return (
        '<div class="cart-alert cart-alert--error">' +
        '<i class="bi bi-x-octagon"></i>' +
        "<p><strong>Store pickup is currently unavailable</strong></p>" +
        "<p>This store does not offer in-store pickup at the moment.</p></div>"
      );
    }
    return (
      '<div class="address-card is-selected" data-shipping-cost="0">' +
      '<div class="address-icon"><i class="bi bi-shop"></i></div>' +
      '<div class="address-body">' +
      '<div class="address-head">' +
      '<span class="address-label">' +
      esc(STORE.name || "Pickup point") +
      " — Pickup Point</span>" +
      '<span class="address-tag address-tag--blue">Free</span>' +
      "</div>" +
      '<p class="address-line">' +
      esc(PICKUP_BRANCH.line || "") +
      "</p>" +
      (PICKUP_BRANCH.hours
        ? '<p class="address-phone">' + esc(PICKUP_BRANCH.hours) + "</p>"
        : "") +
      (PICKUP_BRANCH.phone
        ? '<p class="address-phone">' + esc(PICKUP_BRANCH.phone) + "</p>"
        : "") +
      "</div>" +
      '<i class="bi bi-check-circle-fill address-check"></i>' +
      "</div>" +
      '<div class="cart-alert cart-alert--info">' +
      '<i class="bi bi-info-circle"></i>' +
      "<p>You'll receive a notification when your order is ready for pickup. Please bring a valid ID.</p>" +
      "</div>"
    );
  }

  function promoTagsHTML() {
    const list = STORE_COUPONS.length
      ? STORE_COUPONS
      : [{ code: "WELCOME", desc: "Welcome offer" }];
    return list
      .map((c) => {
        const label =
          c.type === "shipping"
            ? "Free shipping"
            : c.value
              ? c.value + "% off"
              : c.desc || "Offer";
        return (
          '<span class="promo-tag" onclick="setPromoCode(\'' +
          esc(c.code) +
          "')\">" +
          '<span class="promo-tag-code">' +
          esc(c.code) +
          "</span>" +
          '<span class="promo-tag-discount">' +
          esc(label) +
          "</span>" +
          "</span>"
        );
      })
      .join("");
  }

  function orderTimelineHTML(stage) {
    let html = '<div class="order-timeline">';
    ORDER_STAGES.forEach((label, i) => {
      const st = i < stage ? "is-done" : i === stage ? "is-current" : "is-todo";
      html +=
        '<div class="order-timeline-step ' +
        st +
        '">' +
        '<span class="order-timeline-dot"></span>' +
        '<span class="order-timeline-label">' +
        label +
        "</span></div>";
    });
    return html + "</div>";
  }

  function orderCardHTML(order) {
    const itemsHTML = (order.items || [])
      .map(
        (it) =>
          '<div class="order-item">' +
          '<div class="order-item-main">' +
          (it.image
            ? '<div class="order-item-thumb"><img src="' +
              esc(it.image) +
              '" alt="' +
              esc(it.name) +
              '"></div>'
            : "") +
          '<div class="order-item-body">' +
          '<p class="order-item-name">' +
          esc(it.name) +
          "</p>" +
          '<p class="order-item-meta">' +
          esc(it.meta) +
          "</p>" +
          "</div>" +
          "</div>" +
          '<div class="order-item-right">' +
          '<span class="order-item-qty">×' +
          (it.qty || 1) +
          "</span>" +
          '<span class="order-item-price">' +
          esc(it.price) +
          "</span>" +
          "</div>" +
          "</div>",
      )
      .join("");

    return (
      '<article class="order-card" data-order-id="' +
      esc(order.id) +
      '">' +
      '<button type="button" class="order-card-head" onclick="toggleOrderCard(this)" aria-expanded="false">' +
      '<div class="order-card-head-top">' +
      '<span class="order-status ' +
      esc(order.statusClass || "is-pending") +
      '">' +
      esc(order.status) +
      "</span>" +
      '<span class="order-id">#' +
      esc(order.id) +
      "</span>" +
      "</div>" +
      '<p class="order-card-title">' +
      esc(order.title) +
      "</p>" +
      '<div class="order-card-head-bottom">' +
      '<span class="order-date">' +
      esc(order.date) +
      "</span>" +
      '<span class="order-total">' +
      esc(order.total) +
      "</span>" +
      "</div>" +
      '<i class="bi bi-chevron-down order-chevron"></i>' +
      "</button>" +
      '<div class="order-details"><div class="order-details-inner">' +
      '<div class="order-panel">' +
      '<div class="order-panel-head"><span>Live tracking</span>' +
      '<span class="order-stage-pill">' +
      esc(order.stageLabel || "") +
      "</span></div>" +
      orderTimelineHTML(Number(order.stage) || 0) +
      "</div>" +
      '<div class="order-panel"><p class="order-panel-label">Items</p>' +
      '<div class="order-items">' +
      itemsHTML +
      "</div></div>" +
      '<div class="order-grid">' +
      '<div class="order-panel order-panel--mini"><p class="order-panel-label">Shipping to</p><p class="order-panel-value">' +
      esc(order.destination || "—") +
      "</p></div>" +
      '<div class="order-panel order-panel--mini"><p class="order-panel-label">Courier</p><p class="order-panel-value">' +
      esc(order.courier || "—") +
      "</p></div>" +
      '<div class="order-panel order-panel--mini"><p class="order-panel-label">Payment</p><p class="order-panel-value">' +
      esc(order.payment || "—") +
      "</p></div>" +
      '<div class="order-panel order-panel--mini"><p class="order-panel-label">Total paid</p><p class="order-panel-value">' +
      esc(order.total) +
      "</p></div>" +
      "</div>" +
      '<div class="order-actions">' +
      '<button class="pd-btn pd-btn--ghost" onclick="event.stopPropagation(); showAlert(\'shipping\',\'Tracking details copied.\')"><i class="bi bi-geo-alt"></i> Track order</button>' +
      '<button class="pd-btn pd-btn--danger" onclick="event.stopPropagation(); cancelOrder(\'' +
      esc(order.id) +
      "')\">Cancel order</button>" +
      "</div>" +
      "</div></div>" +
      "</article>"
    );
  }

  /* ── views ───────────────────────────────────────────────────────── */
  T.hub = () => `
<div class="sticky-view is-active" data-view="hub">
  <div class="hub-inner">
    <header class="view-head view-head--tight">
      <div class="view-head-main">
        <span class="view-eyebrow" data-i18n="quickAccess">Quick access</span>
        <h4 class="view-title" data-store-name>${esc(STORE.name || "Peacock Store")}</h4>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="mini-pill"><span class="mv-dot"></span><span data-i18n="live">Live</span></span>
        <button type="button" class="theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle light/dark mode" title="Toggle light/dark mode">
          <i class="bi bi-sun-fill"></i>
        </button>
      </div>
    </header>

    <div class="hub-chat" id="hubChat">
      <div class="hub-chat-head">
        <i class="bi bi-stars"></i>
        <span>Ask Peacock AI</span>
        <span class="hub-chat-badge" id="hubChatBadge">Local</span>
      </div>
      <div class="hub-chat-feed" id="hubChatFeed" aria-live="polite"></div>
      <div class="hub-chat-suggests" id="hubChatSuggests">
        <button type="button" class="chat-ai-suggest" data-prompt="Open my cart">Open cart</button>
        <button type="button" class="chat-ai-suggest" data-prompt="Best store sells best clothing">Top clothing stores</button>
        <button type="button" class="chat-ai-suggest" data-prompt="Search for Nike">Search Nike</button>
        <button type="button" class="chat-ai-suggest" data-prompt="Light mode">Light mode</button>
      </div>
      <div class="hub-chat-input-row">
        <textarea id="hubChatInput" class="chat-input" rows="1"
                  placeholder="Ask me anything… e.g. best store sells best clothing"></textarea>
        <button type="button" class="chat-send-btn" id="hubChatSend" aria-label="Send message">
          <i class="bi bi-send-fill"></i>
        </button>
      </div>
    </div>

    <div class="cta-tiles">
      <button type="button" class="cta-tile" data-target="cart">
        <span class="cta-tile-ico"><i class="bi bi-bag"></i></span>
        <span class="cta-tile-label" data-i18n="cart">Cart</span>
        <span class="cta-tile-badge" data-badge="cart">0</span>
      </button>
      <button type="button" class="cta-tile" data-target="orders">
        <span class="cta-tile-ico"><i class="bi bi-box-seam"></i></span>
        <span class="cta-tile-label" data-i18n="orders">Orders</span>
        <span class="cta-tile-badge" data-badge="orders">${ORDERS.length}</span>
      </button>
      <button type="button" class="cta-tile" data-target="search">
        <span class="cta-tile-ico"><i class="bi bi-search"></i></span>
        <span class="cta-tile-label" data-i18n="search">Search</span>
      </button>
      <button type="button" class="cta-tile" data-target="notfications">
        <span class="cta-tile-ico"><i class="bi bi-bell"></i></span>
        <span class="cta-tile-label" data-i18n="alerts">Alerts</span>
        <span class="cta-tile-badge is-hidden" data-badge="notfications">0</span>
      </button>
      <button type="button" class="cta-tile" data-target="favorites">
        <span class="cta-tile-ico"><i class="bi bi-heart"></i></span>
        <span class="cta-tile-label" data-i18n="favorites">Favorites</span>
        <span class="cta-tile-badge" data-badge="favorites">0</span>
      </button>
      <button type="button" class="cta-tile" data-target="categories">
        <span class="cta-tile-ico"><i class="bi bi-diagram-3"></i></span>
        <span class="cta-tile-label" data-i18n="categories">Categories</span>
      </button>
      <button type="button" class="cta-tile" data-target="gallery">
        <span class="cta-tile-ico"><i class="bi bi-grid-3x3-gap"></i></span>
        <span class="cta-tile-label" data-i18n="gallery">Gallery</span>
      </button>
      <button type="button" class="cta-tile" data-target="stores">
        <span class="cta-tile-ico"><i class="bi bi-shop"></i></span>
        <span class="cta-tile-label" data-i18n="stores">Stores</span>
      </button>
      <button type="button" class="cta-tile" data-target="profile">
        <span class="cta-tile-ico"><i class="bi bi-person"></i></span>
        <span class="cta-tile-label" data-i18n="profile">Profile</span>
      </button>
      <button type="button" class="cta-tile" data-lang-toggle aria-label="Change language">
        <span class="cta-tile-ico"><i class="bi bi-translate"></i></span>
        <span class="cta-tile-label" id="langLabel">EN</span>
      </button>
    </div>

    <div class="cta-metrics">
      <div class="cta-metric"><span class="mini-label" data-i18n="fitYou">Fit you</span><span class="cta-metric-value">${Object.keys(PRODUCTS).length}</span></div>
      <div class="cta-metrics-sep"></div>
      <div class="cta-metric"><span class="mini-label" data-i18n="inCart">In cart</span><span class="cta-metric-value" id="hubMetricCart">0</span></div>
      <div class="cta-metrics-sep"></div>
      <div class="cta-metric"><span class="mini-label" data-i18n="ordersCount">Orders</span><span class="cta-metric-value">${ORDERS.length}</span></div>
    </div>
  </div>
</div>`;

  T.quickLookShell = () => `
<div class="sticky-view" data-view="quick-look">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Product</span>
      <h4 class="view-title">Quick look</h4>
    </div>
    <div class="line-badges">
      <span class="mini-pill" id="qlStockPill"><span class="mv-dot"></span>In stock</span>
    </div>
  </header>
  <div id="quickLookMount"></div>
</div>`;

  T.quickLookBody = (p) => {
    return `
<div class="pd-layout">
  <div class="pd-gallery">
    <div class="pd-gallery-frame">
      <div id="ql-image-container" class="pd-gallery-track">
        ${(p.images || []).map((u) => `<img src="${esc(u)}" class="ql-slide" loading="lazy" alt="${esc(p.title)}">`).join("")}
      </div>
      <button type="button" class="pd-gallery-expand" onclick="openImageLightbox()" aria-label="Expand image">
        <i class="bi bi-arrows-fullscreen"></i>
      </button>
      <div class="pd-gallery-badge"><span id="image-counter">1/${(p.images || []).length || 1}</span></div>
    </div>
    <div class="pd-dots" id="ql-dots"></div>
  </div>

  <div class="pd-info">
    <span class="pd-brand">${esc(p.brand)} · ${esc(p.category)}</span>
    <h3 class="pd-title" id="ql-title">${esc(p.title)}</h3>

    <div class="pd-tabs">
      <button id="tab-overview" onclick="switchPDTab('overview')" class="tab-btn is-active">Buy &amp; Overview</button>
      <button id="tab-details"  onclick="switchPDTab('details')"  class="tab-btn">Specs</button>
      <button id="tab-shipping" onclick="switchPDTab('shipping')" class="tab-btn">Delivery</button>
      <button id="tab-reviews"  onclick="switchPDTab('reviews')"  class="tab-btn">Reviews</button>
    </div>

    <div class="pd-panes">
      <div id="pane-overview" class="pd-pane is-active">
        <div class="pd-price-row">
          <span class="pd-price">${money(p.price)}</span>
          ${p.oldPrice ? `<span class="pd-old-price">${money(p.oldPrice)}</span>` : ""}
          ${p.discount ? `<span class="pd-discount">-${p.discount}%</span>` : ""}
        </div>
        <div class="pd-options">
          <!-- COLOR → dropdop (type="status" paints each option from the hex after the colon) -->
          <div class="dropdop pd-color-dop"
               data-optnum="6"
               data-selected="Choose Color"
               data-type="status"
               data-style="outline"
               data-showcount="true"
               data-size="sm"
               data-options="${(p.colors || [])
                 .map((c) => `${c.value}:${c.hex || "#888888"}`)
                 .join(",")}">
          </div>

          <!-- SIZE → dropdop (search type gives a filter box when there are many sizes) -->
          <div class="dropdop pd-size-dop"
               data-optnum="6"
               data-selected="Choose Size"
               data-type="search"
               data-style="outline"
               data-showcount="true"
               data-size="sm"
               data-options="${(p.sizes || []).join(",")}">
          </div>

          <!-- kept for backwards compatibility: any legacy code reading
               #selectedColorText / #selectedSizeText still gets a value -->
          <span id="selectedColorText" hidden></span>
          <span id="selectedSizeText"  hidden></span>
        </div>

        <button type="button" class="pd-whatsapp" onclick="askOwnerOnWhatsApp('${esc(p.id)}')">
          <span class="pd-whatsapp-ico"><i class="bi bi-whatsapp"></i></span>
          <span class="pd-whatsapp-body">
            <strong>Ask about this item</strong>
            <small>Chat with the store on WhatsApp</small>
          </span>
          <i class="bi bi-arrow-up-right pd-whatsapp-arrow"></i>
        </button>

        <div class="pd-actions">
          <button type="button" class="pd-btn pd-btn--primary" onclick="handleProductQuickBuy('${esc(p.id)}')">
            <i class="bi bi-lightning-fill"></i><span>Quick Buy</span>
          </button>
          <button type="button" class="pd-btn pd-btn--icon" aria-label="Add to favorites"
                  onclick="event.stopPropagation(); toggleFavorite('${esc(p.id)}', true)">
            <i class="bi bi-heart"></i>
          </button>
          <button type="button" class="pd-btn pd-btn--primary" onclick="handleProductAddToBag('${esc(p.id)}')">
            <i class="bi bi-bag-plus"></i><span>Add to Bag</span>
          </button>
        </div>
      </div>

      <div id="pane-details" class="pd-pane">
        <h4 class="pd-section-label">Materials</h4>
        <p class="pd-text">${p.specs || ""}</p>
        <div class="pd-note"><p class="pd-text pd-text--muted">${p.model || ""}</p></div>
        <h4 class="pd-section-label" style="margin-top:6px">About</h4>
        <p class="pd-text pd-text--muted">${esc(p.description || "")}</p>
      </div>

      <div id="pane-shipping" class="pd-pane">
        <h4 class="pd-section-label">Delivery</h4>
        <div class="pd-delivery">
          ${(p.delivery || [])
            .map(
              (d) => `
            <div class="pd-delivery-item">
              <i class="bi ${esc(d.icon || "bi-box")}"></i>
              <div><p>${esc(d.title)}</p><small>${d.detail || ""}</small></div>
            </div>`,
            )
            .join("")}
        </div>
      </div>

      <div id="pane-reviews" class="pd-pane">
        <div class="pd-rating-summary">
          <div class="pd-rating-score">
            <span>${p.rating}</span>
            <div>
              <div class="pd-stars">${'<i class="bi bi-star-fill"></i>'.repeat(5)}</div>
              <span class="pd-rating-count">Based on ${Number(p.reviewCount || 0).toLocaleString()} reviews</span>
            </div>
          </div>
          <div class="pd-rating-bars">
            ${[
              { s: 5, w: 80 },
              { s: 4, w: 10 },
              { s: 3, w: 5 },
              { s: 2, w: 3 },
            ]
              .map(
                (b) => `
              <div class="pd-rating-bar">
                <span class="pd-rating-bar-label">${b.s} ★</span>
                <div class="pd-rating-bar-track"><div class="pd-rating-bar-fill" style="width:${b.w}%"></div></div>
                <span class="pd-rating-bar-value">${b.w}%</span>
              </div>`,
              )
              .join("")}
          </div>
        </div>

        <div class="pd-review-toolbar">
          <button onclick="toggleReviewForm()" class="pd-btn pd-btn--ghost">
            <i class="bi bi-pencil-square"></i> Write a review
          </button>
        </div>

        <div id="review-form-panel" class="pd-review-form">
          <div class="pd-review-form-inner">
            <p class="pd-section-label">Share your experience</p>
            <div class="pd-reviewer">
              <div class="pd-reviewer-avatar">JD</div>
              <div>
                <span class="pd-reviewer-name">John Doe</span>
                <span class="pd-reviewer-verified">Verified account</span>
              </div>
            </div>
            <div class="pd-star-input" id="star-rating-input">
              <i class="bi bi-star-fill" data-value="1"></i>
              <i class="bi bi-star-fill" data-value="2"></i>
              <i class="bi bi-star-fill" data-value="3"></i>
              <i class="bi bi-star-fill" data-value="4"></i>
              <i class="bi bi-star-fill" data-value="5"></i>
              <span id="rating-text">Select rating</span>
            </div>
            <div class="pd-textarea-wrap">
              <textarea id="form-review-text" rows="2" placeholder="Write your experience..." maxlength="200"></textarea>
              <span class="pd-charcount"><span id="char-count">0</span>/200</span>
            </div>
            <div class="pd-review-form-actions">
              <button onclick="toggleReviewForm()" class="pd-btn pd-btn--muted">Cancel</button>
              <button onclick="submitUserReview()" class="pd-btn pd-btn--primary"><i class="bi bi-send"></i> Post</button>
            </div>
          </div>
        </div>

        <div id="reviews-feed-container" class="pd-reviews-feed">
          ${(p.reviews || [])
            .map((r) => {
              const isLong = String(r.text || "").length > 90;
              const stars = Array.from(
                { length: 5 },
                (_, i) =>
                  `<i class="bi bi-star-fill"${i + 1 > r.rating ? ' style="opacity:.25"' : ""}></i>`,
              ).join("");
              return `
          <div class="pd-review-card">
            <div class="pd-review-head">
              <div class="pd-review-avatar">${esc(r.initials || initialsOf(r.author))}</div>
              <div class="pd-review-meta">
                <div class="pd-review-name-row">
                  <span class="pd-review-name">${esc(r.author)}</span>
                  ${r.verified ? '<span class="pd-review-verified"><i class="bi bi-check-circle-fill"></i> Verified</span>' : ""}
                  <span class="pd-review-date">${esc(r.date || "")}</span>
                </div>
                <div class="pd-review-variants">
                  ${r.size ? `<span>Size: ${esc(r.size)}</span>` : ""}
                  ${r.color ? `<span>·</span><span>Color: ${esc(r.color)}</span>` : ""}
                </div>
              </div>
            </div>
            <div class="pd-stars pd-stars--sm">${stars}</div>
            <div class="pd-review-text-wrap${isLong ? " is-clamped" : ""}">
              <p class="pd-review-text">${esc(r.text)}</p>
            </div>
            ${isLong ? `<button class="pd-review-more" onclick="toggleReviewExpand(this)">Read more</button>` : ""}
            <div class="pd-review-foot">
              <button><i class="bi bi-hand-thumbs-up"></i> Helpful (${r.helpful || 0})</button>
              <button><i class="bi bi-chat"></i> Reply${r.replies ? " (" + r.replies + ")" : ""}</button>
            </div>
          </div>`;
            })
            .join("")}
        </div>
      </div>
    </div>
  </div>
</div>`;
  };

  T.categories = () => `
<div class="sticky-view" data-view="categories">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Browse</span>
      <h4 class="view-title">Store Categories</h4>
    </div>
    <span class="mini-pill" id="categoriesCountPill">0</span>
  </header>
  <div class="gallery-grid" id="categoriesGrid"></div>
</div>`;

  T.gallery = () => `
<div class="sticky-view" data-view="gallery">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Browse</span>
      <h4 class="view-title" id="galleryTitle">Store Gallery</h4>
    </div>
    <span class="mini-pill" id="galleryCountPill">0 items</span>
  </header>
  <div class="gallery-filterbar" id="galleryFilterBar"></div>
  <div class="gallery-grid" id="galleryGrid"></div>
</div>`;

  T.stores = () => `
<div class="sticky-view" data-view="stores">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Discover</span>
      <h4 class="view-title">Other Stores</h4>
    </div>
    <span class="mini-pill" id="storesCountPill">0 stores</span>
  </header>

  <div class="search-input-wrap" style="margin-bottom:12px">
    <input type="text" id="store-search-input" placeholder="Search stores..." class="search-input" autocomplete="off">
    <i class="bi bi-search search-input-ico"></i>
  </div>

  <div class="stores-section" id="followedStoresSection">
    <div class="stores-section-head">
      <span class="stores-section-title"><i class="bi bi-heart-fill"></i> Followed stores</span>
      <span class="stores-section-count" id="followedStoresCount">0</span>
    </div>
    <div class="stores-row" id="followedStoresRow"></div>
  </div>

  <div class="stores-section">
    <div class="stores-section-head">
      <span class="stores-section-title"><i class="bi bi-grid"></i> Browse by category</span>
    </div>
    <div class="dropdop" id="storeMainCatDropdop"
         data-optnum="3"
         data-selected="All categories"
         data-type="search"
         data-style="outline"
         data-showcount="true"
         data-size="sm"
         data-options="${MAIN_CATEGORIES.map((c) => esc(c.name).replace(/&/g, "&amp;")).join(",")}">
    </div>
    <p class="stores-cat-desc" id="storeCatDesc"></p>
    <div id="storeSubCatWrap" style="display:none;margin-top:8px"></div>
  </div>

  <div class="stores-section">
    <div class="stores-section-head">
      <span class="stores-section-title"><i class="bi bi-shop"></i> All stores</span>
      <span class="stores-section-count" id="allStoresCount">0</span>
    </div>
    <div class="stores-list" id="allStoresList"></div>
  </div>
</div>`;

  T.favorites = () => `
<div class="sticky-view" data-view="favorites">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Wishlist</span>
      <h4 class="view-title">Your Favorites</h4>
    </div>
    <span class="mini-pill" id="favCountPill">0 items</span>
  </header>
  <div class="gallery-grid" id="favoritesGrid"></div>
</div>`;

  T.search = () => `
<div class="sticky-view" data-view="search">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Discover</span>
      <h4 class="view-title">Search</h4>
    </div>
  </header>
  <div class="search-modes">
    <button id="mode-products"   onclick="switchSearchMode('products')"   class="search-mode-btn is-active">Products</button>
    <button id="mode-categories" onclick="switchSearchMode('categories')" class="search-mode-btn">Categories</button>
    <button id="mode-stores"     onclick="switchSearchMode('stores')"     class="search-mode-btn">Stores</button>
    <button id="mode-orders"     onclick="switchSearchMode('orders')"     class="search-mode-btn">Orders</button>
  </div>
  <div class="search-input-wrap">
    <input type="text" id="search-input" placeholder="Search products..." class="search-input" autocomplete="off">
    <i class="bi bi-search search-input-ico"></i>
  </div>
  <div id="search-suggestions-area" class="search-suggestions"></div>
</div>`;

  T.notfications = () => `
<div class="sticky-view" data-view="notfications">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Inbox</span>
      <h4 class="view-title">Notifications</h4>
    </div>
    <div class="view-head-side">
      <span id="notification-badge-counter" class="mini-pill">0 Unread</span>
    </div>
  </header>
  <div class="notif-list" id="notification-scroll-container"></div>
  <div class="notif-footer">
    <button onclick="clearAllNotifications()" class="notif-footer-btn notif-footer-btn--danger">Clear all</button>
    <button onclick="markAllNotificationsAsRead()" class="notif-footer-btn">Mark all as read</button>
  </div>
</div>`;

  T.orders = () => `
<div class="sticky-view" data-view="orders">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">History</span>
      <h4 class="view-title">Your Orders</h4>
    </div>
    <div class="view-head-side">
      <span class="mini-pill" id="ordersCountPill">${ORDERS.length} orders</span>
    </div>
  </header>
  <div class="orders-filters">
    <div class="dropdop"
         data-optnum="3"
         data-selected="Order Status"
         data-type="search"
         data-style="outline"
         data-showcount="true"
         data-size="sm"
         data-options="Pending,Accepted,Shipped,Canceled,Returned">
    </div>
  </div>
  <div class="orders-list" id="ordersList">${ORDERS.map(orderCardHTML).join("")}</div>
</div>`;

  T.cart = () => `
<div class="sticky-view" data-view="cart">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Checkout</span>
      <h4 class="view-title" id="cart-head-title">Your Cart</h4>
    </div>
    <div class="view-head-side">
      <span id="cart-badge-counter" class="mini-pill">0 Items</span>
    </div>
  </header>

  <div id="cart-step-1" class="cart-step">
    <div id="cart-items" class="cart-items">${cartRowsHTML()}</div>

    <div class="cart-section">
      <span class="cart-section-label">Shipping method</span>
      <div class="ship-toggle">
        <button type="button" id="tab-shipping-home"   onclick="selectShippingMethod('home')"   class="ship-toggle-btn is-active"><i class="bi bi-house-door"></i> Home Delivery</button>
        <button type="button" id="tab-shipping-pickup" onclick="selectShippingMethod('pickup')" class="ship-toggle-btn${STORE_HAS_PICKUP ? "" : " is-disabled"}"><i class="bi bi-shop"></i> Store Pickup</button>
      </div>

      <div id="shipping-home-panel" class="ship-panel">
        <div id="address-list" class="address-list">${addressListHTML()}</div>

        <button type="button" onclick="toggleNewAddressForm()" class="cart-dashed-btn">
          <i class="bi bi-plus-lg"></i> Add new address
        </button>

        <div id="new-address-form" class="smooth-dropdown">
          <div class="cart-form-box">
            <input type="text" id="new-addr-label"  placeholder="Label (e.g. Home, Work)" class="cart-input">
            <input type="text" id="new-addr-street" placeholder="Street, building, apt" class="cart-input">
            <input type="text" id="new-addr-city"   placeholder="City" class="cart-input">
            <input type="tel"  id="new-addr-phone"  placeholder="Phone number" class="cart-input">
            <div class="cart-form-actions">
              <button type="button" onclick="toggleNewAddressForm()" class="pd-btn pd-btn--muted">Cancel</button>
              <button type="button" onclick="saveNewAddress()" class="pd-btn pd-btn--primary">Save address</button>
            </div>
          </div>
        </div>
      </div>

      <div id="shipping-pickup-panel" class="ship-panel is-hidden">
        ${pickupPanelHTML()}
      </div>
    </div>

    <div class="cart-section">
      <button type="button" onclick="togglePromoArea()" class="cart-section-toggle">
        <span class="cart-section-label">Promo code</span>
        <span class="cart-section-status" id="promo-status-text">Add</span>
      </button>
      <div id="promoArea" class="smooth-dropdown">
        <div class="promo-input-wrapper">
          <input type="text" id="promo-input" class="promo-input" placeholder="Enter code">
          <button type="button" class="promo-apply-btn" onclick="applyPromoCode()">Apply</button>
        </div>
        <div class="promo-suggestions">
          <div class="promo-suggestions-label">Suggested</div>
          <div class="promo-tags">${promoTagsHTML()}</div>
        </div>
      </div>
    </div>

    <div class="cart-section cart-totals">
      <div class="cart-total-row"><span>Subtotal</span><span id="cart-subtotal">${money(0)}</span></div>
      <div class="cart-total-row"><span>Shipping</span><span id="cart-shipping">${money(0)}</span></div>
      <div class="cart-total-row" id="cart-promo-row" style="display:none">
        <span>Promo discount</span><span id="cart-promo" class="cart-discount">-${money(0)}</span>
      </div>
      <div class="cart-total-row cart-total-row--grand">
        <span>Total</span><span id="checkout-total-price">${money(0)}</span>
      </div>
    </div>

    <button onclick="goToCheckoutStep2()" class="cart-primary-btn">Continue to checkout <i class="bi bi-arrow-right"></i></button>
  </div>

  <div id="cart-step-2" class="cart-step is-hidden">
    <button onclick="goToCheckoutStep1()" class="cart-back-btn"><i class="bi bi-arrow-left"></i> Back to cart</button>
    <div class="cart-summary-card">
      <div class="cart-summary-head">
        <span>Order summary</span><span id="summary-item-count">0 items</span>
      </div>
      <div class="cart-total-row cart-total-row--grand">
        <span>Total</span><span id="summary-total">${money(0)}</span>
      </div>
    </div>
    <div class="cart-section">
      <span class="cart-section-label">Order notes <em>(optional)</em></span>
      <textarea id="order-notes" rows="2" class="cart-textarea" placeholder="Add delivery instructions, gift note, etc..."></textarea>
    </div>
    <div class="cart-section">
      <span class="cart-section-label">Payment method</span>
      <div class="payment-list">
        <div class="payment-option is-selected" data-payment="card" onclick="selectPayment(this)">
          <div class="payment-icon"><i class="bi bi-credit-card"></i></div>
          <div class="payment-body">
            <p class="payment-title">Credit / Debit Card</p>
            <p class="payment-sub">Visa, Mastercard, Meeza</p>
          </div>
          <i class="bi bi-check-circle-fill payment-check"></i>
        </div>
        <div class="payment-option" data-payment="cod" onclick="selectPayment(this)">
          <div class="payment-icon"><i class="bi bi-cash-coin"></i></div>
          <div class="payment-body">
            <p class="payment-title">Cash on Delivery</p>
            <p class="payment-sub">Pay when your order arrives</p>
          </div>
          <i class="bi bi-check-circle-fill payment-check"></i>
        </div>
        <div class="payment-option" data-payment="wallet" onclick="selectPayment(this)">
          <div class="payment-icon"><i class="bi bi-wallet2"></i></div>
          <div class="payment-body">
            <p class="payment-title">Digital Wallet</p>
            <p class="payment-sub">Vodafone Cash, InstaPay</p>
          </div>
          <i class="bi bi-check-circle-fill payment-check"></i>
        </div>
      </div>
    </div>
    <div class="cart-section cart-totals">
      <div class="cart-total-row"><span>Subtotal</span><span id="final-subtotal">${money(0)}</span></div>
      <div class="cart-total-row"><span>Shipping</span><span id="final-shipping">${money(0)}</span></div>
      <div class="cart-total-row" id="final-promo-row" style="display:none">
        <span>Promo discount</span><span id="final-promo" class="cart-discount">-${money(0)}</span>
      </div>
      <div class="cart-total-row cart-total-row--grand">
        <span>Total</span><span id="final-total">${money(0)}</span>
      </div>
    </div>
    <button id="pay-submit-btn" onclick="submitOrder(this)" class="cart-primary-btn">
      <i class="bi bi-lock-fill"></i> Pay &amp; Submit • ${money(0)}
    </button>
  </div>
</div>`;

  T.profile = () => `
<div class="sticky-view" data-view="profile">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Account</span>
      <h4 class="view-title">Your Profile</h4>
    </div>
  </header>
  <div class="profile-stack">
    <div class="profile-card">
      <div class="profile-row">
        <div class="profile-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div class="profile-id">
          <span class="profile-name">Guest User</span>
          <span class="profile-mail">Sign in for full access</span>
        </div>
      </div>
      <div class="profile-actions">
        <button onclick="openSignIn()" class="pd-btn pd-btn--primary">Sign in</button>
        <button onclick="openSignUp()" class="pd-btn pd-btn--ghost">Create account</button>
      </div>
    </div>
    <div class="profile-card">
      <div class="profile-row profile-row--between">
        <div>
          <span class="profile-name">${esc((PLATFORM.supportEmail || "guest").split("@")[0])}</span>
          <span class="profile-mail">${esc(PLATFORM.supportEmail || "")}</span>
        </div>
        <button class="profile-edit">Edit</button>
      </div>
      <button onclick="showAlert('auth','Change password flow opened.')" class="pd-btn pd-btn--ghost pd-btn--block">Change password</button>
      <button onclick="showAlert('auth','Reset link sent to your email.')" class="profile-link">Forgot password? <u>Reset via email</u></button>
    </div>
    <button onclick="signOut()" class="pd-btn pd-btn--danger pd-btn--block">Sign out</button>
  </div>
</div>`;

  T.signin = () => `
<div class="sticky-view" data-view="signin">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Welcome back</span>
      <h4 class="view-title">Sign in</h4>
    </div>
  </header>
  <div class="auth-wrap">
    <form class="auth-form" id="signinForm" onsubmit="return handleSignIn(event)">
      <div class="auth-error" id="signinError"></div>
      <div class="auth-field">
        <label class="auth-label" for="signinEmail">Email</label>
        <div class="auth-input-wrap">
          <i class="bi bi-envelope auth-input-ico"></i>
          <input type="email" id="signinEmail" class="auth-input" placeholder="you@example.com" autocomplete="email" required>
        </div>
      </div>
      <div class="auth-field">
        <label class="auth-label" for="signinPassword">Password</label>
        <div class="auth-input-wrap">
          <i class="bi bi-lock auth-input-ico"></i>
          <input type="password" id="signinPassword" class="auth-input" placeholder="Enter your password" autocomplete="current-password" required>
          <button type="button" class="auth-input-toggle" onclick="togglePassword('signinPassword', this)" aria-label="Show password">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </div>
      <div class="auth-row">
        <label class="auth-check">
          <input type="checkbox" id="signinRemember">
          <span class="auth-check-box"><i class="bi bi-check-lg"></i></span>
          <span>Remember me</span>
        </label>
        <button type="button" class="auth-link" onclick="showAlert('auth','Reset link sent to your email.')">Forgot password?</button>
      </div>
      <button type="submit" class="pd-btn pd-btn--primary pd-btn--block auth-submit">
        <i class="bi bi-box-arrow-in-right"></i> Sign in
      </button>
    </form>
    <div class="auth-divider">or</div>
    <div class="auth-socials">
      <button type="button" class="auth-social" onclick="showAlert('info','Google sign in (demo).')">
        <i class="bi bi-google"></i> Google
      </button>
      <button type="button" class="auth-social" onclick="showAlert('info','Apple sign in (demo).')">
        <i class="bi bi-apple"></i> Apple
      </button>
    </div>
    <p class="auth-foot">New here? <b onclick="openSignUp()">Create an account</b></p>
  </div>
</div>`;

  T.signup = () => `
<div class="sticky-view" data-view="signup">
  <header class="view-head">
    <div class="view-head-main">
      <span class="view-eyebrow">Get started</span>
      <h4 class="view-title">Create account</h4>
    </div>
  </header>
  <div class="auth-wrap">
    <form class="auth-form" id="signupForm" onsubmit="return handleSignUp(event)">
      <div class="auth-error" id="signupError"></div>
      <div class="auth-field">
        <label class="auth-label" for="signupName">Full name</label>
        <div class="auth-input-wrap">
          <i class="bi bi-person auth-input-ico"></i>
          <input type="text" id="signupName" class="auth-input" placeholder="Your full name" autocomplete="name" required>
        </div>
      </div>
      <div class="auth-field">
        <label class="auth-label" for="signupEmail">Email</label>
        <div class="auth-input-wrap">
          <i class="bi bi-envelope auth-input-ico"></i>
          <input type="email" id="signupEmail" class="auth-input" placeholder="you@example.com" autocomplete="email" required>
        </div>
      </div>
      <div class="auth-field">
        <label class="auth-label" for="signupPassword">Password</label>
        <div class="auth-input-wrap">
          <i class="bi bi-lock auth-input-ico"></i>
          <input type="password" id="signupPassword" class="auth-input" placeholder="Create a strong password" autocomplete="new-password" minlength="6" required>
          <button type="button" class="auth-input-toggle" onclick="togglePassword('signupPassword', this)" aria-label="Show password">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </div>
      <div class="auth-field">
        <label class="auth-label" for="signupConfirm">Confirm password</label>
        <div class="auth-input-wrap">
          <i class="bi bi-shield-lock auth-input-ico"></i>
          <input type="password" id="signupConfirm" class="auth-input" placeholder="Re-enter your password" autocomplete="new-password" minlength="6" required>
        </div>
      </div>
      <label class="auth-check" style="font-size:10px;color:rgba(255,255,255,.55)">
        <input type="checkbox" id="signupTerms" required>
        <span class="auth-check-box"><i class="bi bi-check-lg"></i></span>
        <span>I agree to the <u>Terms</u> &amp; <u>Privacy Policy</u></span>
      </label>
      <button type="submit" class="pd-btn pd-btn--primary pd-btn--block auth-submit">
        <i class="bi bi-person-plus"></i> Create account
      </button>
    </form>
    <p class="auth-foot">Already have an account? <b onclick="openSignIn()">Sign in</b></p>
  </div>
</div>`;

  /* ═══════════════════════════════════════════════════════════════════
     5. INIT FUNCTION
     ═══════════════════════════════════════════════════════════════════ */
  function initStickyCTA(userConfig) {
    const config = Object.assign({ defaultLang: "en" }, userConfig || {});

    if (document.getElementById(ROOT_ID)) return window.__stickyCtaApi;

    /* ── 5.1 hydrate from the maestro (datainjector.js) ── */
    if (!hydrateData()) return null;

    /* ── 5.2 inject styles ── */
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    /* ── 5.3 inject DOM ── */
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = ROOT_HTML;
    document.body.appendChild(root);

    const mount = document.getElementById("stickyCtaViews");
    const promoBannerEl = document.getElementById("stickyPromoBanner");
    const notifZone = document.getElementById("stickyNotifZone");
    const notifInner = document.getElementById("stickyNotifInner");
    const stickyEl = document.getElementById("stickyCta");

    /* ── 5.4 shared state ── */
    const state = {
      favorites: new Set(),
      followedStores: new Set(),
      storeMainCategory: "all",
      storeSubCategory: "all",
      storeSortMode: "default",
      theme: (() => {
        try {
          return localStorage.getItem("peacock-theme") || "dark";
        } catch (_) {
          return "dark";
        }
      })(),
      geminiKey: null,
      chatMessages: [],
      chatBusy: false,
      lang: config.defaultLang,
      notifications: [],
      notificationSeq: 1,
      galleryCategory: null,
    };
    window.__stickyState = state;

    /* seed favourites / followed stores from the injector dataset */
    Object.keys(PRODUCTS)
      .slice(0, 2)
      .forEach((id) => state.favorites.add(id));
    OTHER_STORES.slice(0, 2).forEach((s) => state.followedStores.add(s.id));

    /* ── 5.5 text sanitizer (no emojis) ── */
    function sanitizeText(text) {
      const emojiRegex =
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
      return String(text || "")
        .replace(emojiRegex, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    window.ShopEaseSounds = window.ShopEaseSounds || { play() {} };

    /* ══════════════════════════════════════════════════════════════════
       5.5b DROPDOP RE-INIT for dynamically injected pd-panes
            dropdop.js only auto-inits once on DOMContentLoaded; the
            quick-look body is injected later, so we re-scan and mirror
            the picked value into the hidden #selectedColorText /
            #selectedSizeText spans (kept for backwards compatibility).
       ══════════════════════════════════════════════════════════════════ */
    function initPaneDropdops(rootEl) {
      if (typeof DropDop === "undefined") return;
      const scope = rootEl || document;
      scope
        .querySelectorAll(".pd-options .dropdop:not([data-dop-ready])")
        .forEach(function (el) {
          el.setAttribute("data-dop-ready", "1");
          new DropDop(el);

          el.addEventListener("click", function (e) {
            const opt = e.target.closest && e.target.closest(".optdop");
            if (!opt) return;
            const value = opt.getAttribute("data-value");

            if (el.classList.contains("pd-color-dop")) {
              const c = document.getElementById("selectedColorText");
              if (c) c.textContent = value;
            } else if (el.classList.contains("pd-size-dop")) {
              const s = document.getElementById("selectedSizeText");
              if (s) s.textContent = value;
            }

            el.dispatchEvent(
              new CustomEvent("pd:select", {
                bubbles: true,
                detail: {
                  kind: el.classList.contains("pd-color-dop")
                    ? "color"
                    : "size",
                  value: value,
                },
              }),
            );
          });
        });
    }

    /* ══════════════════════════════════════════════════════════════════
       5.6 NOTIFICATION CORE  (inline strip + inbox list)
       ══════════════════════════════════════════════════════════════════ */
    /* ═══════════════════════════════════════════════════════════════════
  /* ═══════════════════════════════════════════════════════════════════
   5.6 NOTIFICATION CORE  — v2
       • Latest-wins: a new alert instantly replaces the visible one.
       • No blocking "+N" counter — the badge that used to overlap the
         icon (see screenshot) has been removed entirely.
       • Each alert's own `duration` (type + message length) drives both
         the auto-hide timer AND the circular ring-loader animation.
       • When the ring empties, the strip hides by itself. Anything
         still unread is left for the Notifications Center.
       • If more alerts are waiting, an overflow hint is shown inside
         the toast body: "You have N more notifications — view all in
         Notifications". Clicking the toast OR the hint opens the
         Notifications view.
   ═══════════════════════════════════════════════════════════════════ */

    /* 2πr with r = 17 inside a 36×36 viewBox */
    const RING_LEN = 106.81;

    let stripEntryId = null; // id of the alert currently on the strip
    let stripTimer = null; // auto-hide timer for that alert
    let stripDeadline = 0; // timestamp the current alert expires at
    let stripRemaining = 0; // ms left, kept while hover-paused
    let stripClearTimer = null; // delayed innerHTML cleanup

    /* ── how long does this particular alert live? ───────────────────── */
    function alertEndingTime(entry) {
      const cfg = ALERT_TYPES[entry.type] || ALERT_TYPES.info;
      const base = Number(cfg.ttl) || 4200;
      const len = String(entry.message || "").length;
      // longer messages need more reading time (capped both ways)
      const extra = Math.min(2800, Math.max(0, len - 36) * 28);
      return Math.max(2600, Math.min(14000, base + extra));
    }

    function pushNotification(type, message, ts) {
      const cfg = ALERT_TYPES[type] || ALERT_TYPES.info;
      const stamp = ts || Date.now();
      const entry = {
        id: state.notificationSeq++,
        type,
        icon: cfg.icon,
        tone: cfg.tone,
        label: cfg.label,
        view: cfg.view,
        message: sanitizeText(message),
        ts: stamp,
        date: notifDateLabel(stamp),
        read: false,
        stripDone: false,
      };
      entry.duration = alertEndingTime(entry);
      state.notifications.unshift(entry); // newest-first
      return entry;
    }

    function unreadNotifications() {
      return state.notifications.filter((n) => !n.read);
    }

    /* How many OTHER unread alerts are waiting behind the visible one? */
    function overflowCount(excludeId) {
      let count = 0;
      for (let i = 0; i < state.notifications.length; i++) {
        const n = state.notifications[i];
        if (n.read || n.id === excludeId) continue;
        count++;
      }
      return count;
    }

    /* ── strip timing helpers ────────────────────────────────────────── */
    function clearStripTimer() {
      if (stripTimer !== null) {
        clearTimeout(stripTimer);
        stripTimer = null;
      }
    }

    function runStripTimer(ms) {
      clearStripTimer();
      stripRemaining = ms;
      stripDeadline = Date.now() + ms;
      stripTimer = setTimeout(function () {
        stripTimer = null;
        stripDeadline = 0;
        finishCurrentAlert();
      }, ms);
    }

    function pauseStripTimer() {
      if (stripTimer === null) return;
      clearTimeout(stripTimer);
      stripTimer = null;
      stripRemaining = Math.max(0, stripDeadline - Date.now());
      stripDeadline = 0;
    }

    function resumeStripTimer() {
      if (stripTimer !== null || stripDeadline) return;
      runStripTimer(stripRemaining > 0 ? stripRemaining : 2600);
    }

    function setRingPlayState(value) {
      if (!notifInner) return;
      const ring = notifInner.querySelector(".sticky-notif-ring-progress");
      if (ring) ring.style.animationPlayState = value;
    }

    /* ── strip lifecycle ─────────────────────────────────────────────── */
    function finishCurrentAlert() {
      // Ring finished draining → mark this entry as done on the strip,
      // then hide. We deliberately do NOT auto-advance to the next one.
      const cur = state.notifications.find(function (n) {
        return n.id === stripEntryId;
      });
      if (cur) cur.stripDone = true;
      stripEntryId = null;
      closeStrip();
    }

    function closeStrip() {
      clearStripTimer();
      stripEntryId = null;
      stripDeadline = 0;
      stripRemaining = 0;
      if (!notifZone) return;
      notifZone.classList.remove("is-open");
      if (stripClearTimer) clearTimeout(stripClearTimer);
      stripClearTimer = setTimeout(function () {
        stripClearTimer = null;
        if (!notifZone.classList.contains("is-open") && stripEntryId === null)
          notifInner.innerHTML = "";
      }, 520);
    }

    /* ── hint helper ─────────────────────────────────────────────────── */
    function buildHintText(others) {
      return (
        "You have " +
        others +
        " more notification" +
        (others === 1 ? "" : "s") +
        " — view all in Notifications"
      );
    }

    /* Recomputes the overflow hint in-place without restarting the timer */
    function refreshOverflowHint(excludeId) {
      if (!notifInner) return;
      const body = notifInner.querySelector(".sticky-notif-body");
      if (!body) return;
      const others = overflowCount(excludeId);
      const existing = body.querySelector(".sticky-notif-hint");
      if (others > 0) {
        const html =
          esc(buildHintText(others)) +
          ' <i class="bi bi-arrow-right-short"></i>';
        if (existing) existing.innerHTML = html;
        else {
          const span = document.createElement("span");
          span.className = "sticky-notif-hint";
          span.innerHTML = html;
          body.appendChild(span);
        }
      } else if (existing) {
        existing.remove();
      }
    }

    /* ── strip rendering ─────────────────────────────────────────────── */
    function showStripEntry(entry) {
      if (!notifZone || !notifInner) return;

      // Any alert that was visible but is not the one we are about to show
      // is considered "already surfaced" — we don't replay it later.
      if (stripEntryId !== null && stripEntryId !== entry.id) {
        const prev = state.notifications.find(function (n) {
          return n.id === stripEntryId;
        });
        if (prev) prev.stripDone = true;
      }

      clearStripTimer();
      stripEntryId = entry.id;

      const others = overflowCount(entry.id);
      const hintText = others > 0 ? buildHintText(others) : "";

      notifInner.innerHTML =
        '<div class="sticky-notif-card" style="--tone:' +
        entry.tone +
        ";--notif-duration:" +
        entry.duration +
        'ms" data-notif-id="' +
        entry.id +
        '" role="button" tabindex="0" aria-label="' +
        esc(entry.label) +
        ": " +
        esc(entry.message) +
        '">' +
        '<span class="sticky-notif-ico-wrap">' +
        '<span class="sticky-notif-ico">' +
        '<svg class="sticky-notif-ring" viewBox="0 0 36 36" aria-hidden="true">' +
        '<circle class="sticky-notif-ring-track" cx="18" cy="18" r="17"></circle>' +
        '<circle class="sticky-notif-ring-progress" cx="18" cy="18" r="17"></circle>' +
        "</svg>" +
        '<i class="bi ' +
        entry.icon +
        '"></i>' +
        "</span>" +
        "</span>" +
        '<span class="sticky-notif-body">' +
        '<span class="sticky-notif-head">' +
        '<span class="sticky-notif-title">' +
        esc(entry.label) +
        "</span>" +
        '<span class="sticky-notif-date">' +
        esc(entry.date) +
        "</span>" +
        "</span>" +
        '<span class="sticky-notif-text">' +
        esc(entry.message) +
        "</span>" +
        (hintText
          ? '<span class="sticky-notif-hint">' +
            esc(hintText) +
            ' <i class="bi bi-arrow-right-short"></i></span>'
          : "") +
        "</span>" +
        '<button type="button" class="sticky-notif-close" data-notif-close="' +
        entry.id +
        '" aria-label="Dismiss notification"><i class="bi bi-x-lg"></i></button>' +
        "</div>";

      requestAnimationFrame(function () {
        notifZone.classList.add("is-open");
      });

      // The SVG ring drains over exactly this duration, and the hide timer
      // fires at the same moment — they are one and the same clock.
      runStripTimer(entry.duration);
    }

    /* latest-wins entry point */
    function showLatestAlert() {
      if (!notifZone || !notifInner) return;
      const unread = unreadNotifications();
      if (!unread.length) {
        closeStrip();
        return;
      }
      // state.notifications is newest-first, so index 0 is the latest
      showStripEntry(unread[0]);
    }

    function renderNotifStrip() {
      if (!notifZone || !notifInner) return;

      // Something is already on screen and still unread → keep it, but
      // refresh the overflow hint in case the queue changed underneath us.
      if (stripEntryId !== null) {
        const cur = state.notifications.find(function (n) {
          return n.id === stripEntryId;
        });
        if (cur && !cur.read) {
          refreshOverflowHint(cur.id);
          return;
        }
        clearStripTimer();
        stripEntryId = null;
      }
      showLatestAlert();
    }

    /* ── Notifications Center list (unchanged) ───────────────────────── */
    function renderNotificationList() {
      const list = document.getElementById("notification-scroll-container");
      if (!list) return;
      if (!state.notifications.length) {
        list.innerHTML =
          '<div class="notif-empty"><i class="bi bi-bell-slash"></i><span>No notifications yet</span></div>';
        return;
      }
      list.innerHTML = state.notifications
        .map(
          (n) =>
            '<button type="button" class="notif-card' +
            (n.read ? "" : " is-unread") +
            '" ' +
            'style="--tone:' +
            n.tone +
            '" onclick="handleNotificationClick(' +
            n.id +
            ')">' +
            '<span class="notif-ico"><i class="bi ' +
            n.icon +
            '"></i></span>' +
            '<span class="notif-body">' +
            '<span class="notif-top">' +
            '<span class="notif-label">' +
            esc(n.label) +
            "</span>" +
            (n.read ? "" : '<span class="notif-dot"></span>') +
            '<span class="notif-time">' +
            esc(n.date) +
            "</span>" +
            "</span>" +
            '<span class="notif-msg">' +
            esc(n.message) +
            "</span>" +
            "</span>" +
            (n.view ? '<i class="bi bi-chevron-right notif-chev"></i>' : "") +
            "</button>",
        )
        .join("");
    }

    function updateAlertBadge() {
      const unread = unreadNotifications().length;
      const badge = document.querySelector('[data-badge="notfications"]');
      if (badge) {
        badge.textContent = unread;
        badge.classList.toggle("is-hidden", unread === 0);
      }
      const pill = document.getElementById("notification-badge-counter");
      if (pill) {
        pill.textContent = unread + " Unread";
        pill.classList.toggle("is-accent", unread > 0);
      }
    }

    /* ── dismissal ───────────────────────────────────────────────────── */
    function dismissNotification(id) {
      const entry = state.notifications.find(function (n) {
        return n.id === id;
      });
      if (entry) {
        entry.read = true;
        entry.stripDone = true;
      }

      if (stripEntryId === id) {
        // Visible alert was dismissed → hide the strip. Do NOT chain to the
        // next queued alert; the user asked to close this one.
        clearStripTimer();
        stripEntryId = null;
        closeStrip();
      } else {
        // Someone dismissed from the list — just refresh the hint.
        renderNotifStrip();
      }

      renderNotificationList();
      updateAlertBadge();
    }

    /* ── public API ──────────────────────────────────────────────────── */
    window.showAlert = function (type, message) {
      const entry = pushNotification(type, message);
      renderNotificationList();
      updateAlertBadge();
      // latest-wins: replace whatever is on screen right now
      showLatestAlert();
      return entry;
    };

    window.handleNotificationClick = function (id) {
      const entry = state.notifications.find(function (n) {
        return n.id === id;
      });
      if (!entry) return;
      entry.read = true;
      entry.stripDone = true;
      if (stripEntryId === id) {
        clearStripTimer();
        stripEntryId = null;
      }
      renderNotificationList();
      updateAlertBadge();
      renderNotifStrip();
      if (entry.view) window.openStickyView(entry.view);
    };

    window.markAllNotificationsAsRead = function () {
      state.notifications.forEach(function (n) {
        n.read = true;
        n.stripDone = true;
      });
      closeStrip();
      renderNotificationList();
      updateAlertBadge();
    };

    window.clearAllNotifications = function () {
      state.notifications = [];
      closeStrip();
      renderNotificationList();
      updateAlertBadge();
    };

    /* ── event wiring ────────────────────────────────────────────────── */
    if (notifZone) {
      /* hover keeps an alert on screen a little longer (and pauses the ring) */
      notifZone.addEventListener("mouseenter", function () {
        if (stripEntryId === null) return;
        pauseStripTimer();
        setRingPlayState("paused");
      });
      notifZone.addEventListener("mouseleave", function () {
        if (stripEntryId === null) return;
        resumeStripTimer();
        setRingPlayState("running");
      });

      notifZone.addEventListener("click", function (e) {
        // 1) Close button → dismiss just this alert
        const closeBtn = e.target.closest("[data-notif-close]");
        if (closeBtn) {
          e.preventDefault();
          e.stopPropagation();
          dismissNotification(Number(closeBtn.dataset.notifClose));
          return;
        }

        // 2) Anywhere else on the card (including the overflow hint) →
        //    mark as read and navigate to the Notifications Center.
        //    The hint span has no separate handler; it inherits this one.
        const card = e.target.closest(".sticky-notif-card");
        if (card) {
          e.preventDefault();
          e.stopPropagation();
          const id = Number(card.dataset.notifId);
          const entry = state.notifications.find(function (n) {
            return n.id === id;
          });
          if (entry) {
            entry.read = true;
            entry.stripDone = true;
          }
          renderNotificationList();
          updateAlertBadge();
          closeStrip();
          window.openStickyView("notfications");
        }
      });
    }

    /* ══════════════════════════════════════════════════════════════════
       5.7 STICKY CONTROLLER  (always visible)
       ══════════════════════════════════════════════════════════════════ */
    (function stickyController() {
      const sticky = document.getElementById("stickyCta");
      const overlay = document.getElementById("sticky-cta-overlay");
      const panel = document.getElementById("stickyCtaPanel");
      const toggle = document.getElementById("stickyToggleBtn");
      const icon = document.getElementById("stickyToggleIcon");
      const backBtn = document.getElementById("stickyBackBtn");
      const primaryCta = document.getElementById("stickyPrimaryCta");

      if (!sticky || !toggle || !panel) return;

      let isExpanded = false;
      let current = "hub";
      const navStack = [];

      function getViews() {
        return Array.prototype.slice.call(
          panel.querySelectorAll(".sticky-view"),
        );
      }

      function setExpanded(v, nameHint) {
        const name = nameHint || current;
        if (v === isExpanded && name === current) {
          sticky.classList.toggle("is-expanded", isExpanded);
          return;
        }
        isExpanded = v;
        sticky.classList.toggle("is-expanded", isExpanded);
        toggle.setAttribute("aria-expanded", String(isExpanded));
        if (icon)
          icon.className = isExpanded
            ? "bi bi-x-lg"
            : "bi bi-grid-3x3-gap-fill";
        document.body.classList.toggle("sticky-cta-open", isExpanded);
        if (overlay) {
          overlay.classList.toggle("is-visible", isExpanded);
          overlay.setAttribute("aria-hidden", String(!isExpanded));
        }
      }

      /* v5 — the dock is ALWAYS visible; no scroll trigger at all. */
      function showDock() {
        sticky.classList.add("is-visible");
        sticky.setAttribute("aria-hidden", "false");
      }
      function hideDock() {
        sticky.classList.remove("is-visible");
        sticky.setAttribute("aria-hidden", "true");
        if (isExpanded) setExpanded(false);
      }
      showDock();

      function goTo(name, direction, record) {
        direction = direction || "right";
        const views = getViews();
        if (name === current) {
          setExpanded(true);
          return;
        }
        const from = views.find((v) => v.dataset.view === current);
        const to = views.find((v) => v.dataset.view === name);
        if (!to) return;

        if (record !== false && direction === "right") navStack.push(current);
        if (name === "hub") navStack.length = 0;

        sticky.dataset.current = name;

        if (from) {
          from.classList.remove("is-active");
          from.classList.add(
            direction === "right" ? "is-exiting-left" : "is-exiting-right",
          );
          setTimeout(
            () => from.classList.remove("is-exiting-left", "is-exiting-right"),
            300,
          );
        }
        to.classList.remove("is-exiting-left", "is-exiting-right");
        void to.offsetWidth;
        to.classList.add("is-active");

        current = name;
        setExpanded(true, name);
      }

      function syncView() {
        const views = getViews();
        views.forEach((v) =>
          v.classList.remove(
            "is-active",
            "is-exiting-left",
            "is-exiting-right",
          ),
        );
        const target = views.find((v) => v.dataset.view === current);
        if (target) target.classList.add("is-active");
        else {
          const hub = views.find((v) => v.dataset.view === "hub");
          if (hub) hub.classList.add("is-active");
          current = "hub";
          sticky.dataset.current = "hub";
        }
      }

      /* delegated tile handling (survives re-render) */
      panel.addEventListener("click", (e) => {
        const tile = e.target.closest(".cta-tile");
        if (!tile) return;
        e.preventDefault();
        e.stopPropagation();
        if (tile.hasAttribute("data-lang-toggle")) {
          window.toggleLanguage();
          return;
        }
        const target = tile.dataset.target;
        if (!target) return;
        goTo(target, "right");
      });

      backBtn &&
        backBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (current !== "hub") {
            const prev = navStack.pop();
            goTo(prev && prev !== current ? prev : "hub", "left", false);
          } else setExpanded(false);
        });

      primaryCta &&
        primaryCta.addEventListener("click", (e) => {
          e.preventDefault();
          window.openStickyView("signin");
        });

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isExpanded) {
          setExpanded(false);
          setTimeout(() => {
            navStack.length = 0;
            if (current !== "hub") goTo("hub", "left", false);
          }, 240);
        } else {
          showDock();
          setExpanded(true);
        }
      });

      overlay &&
        overlay.addEventListener("click", () => {
          setExpanded(false);
          setTimeout(() => {
            navStack.length = 0;
            if (current !== "hub") goTo("hub", "left", false);
          }, 240);
        });

      document.addEventListener("click", (e) => {
        if (!isExpanded) return;
        if (sticky.contains(e.target)) return;
        const lb = document.getElementById("pdLightbox");
        if (lb && lb.contains(e.target)) return;
        setExpanded(false);
        setTimeout(() => {
          navStack.length = 0;
          if (current !== "hub") goTo("hub", "left", false);
        }, 240);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        const lb = document.getElementById("pdLightbox");
        if (lb && lb.classList.contains("is-open")) return;
        if (current !== "hub") goTo("hub", "left", false);
        else if (isExpanded) setExpanded(false);
      });

      window.openStickyView = function (name) {
        showDock();
        goTo(name, "right");
      };
      window.closeStickyCta = () => setExpanded(false);
      window.hideStickyCta = hideDock;
      window.showStickyCta = showDock;
      window.closeAllViews = () => {
        navStack.length = 0;
        goTo("hub", "left", false);
      };

      window.openCart = (e) => {
        e && e.preventDefault();
        window.openStickyView("cart");
      };
      window.openOrders = (e) => {
        e && e.preventDefault();
        window.openStickyView("orders");
      };
      window.openSearch = (e) => {
        e && e.preventDefault();
        window.openStickyView("search");
      };
      window.openNotifications = (e) => {
        e && e.preventDefault();
        window.openStickyView("notfications");
      };
      window.openProfile = (e) => {
        e && e.preventDefault();
        window.openStickyView("profile");
      };
      window.openGallery = (e) => {
        e && e.preventDefault();
        window.openStickyView("gallery");
      };
      window.openFavorites = (e) => {
        e && e.preventDefault();
        window.openStickyView("favorites");
      };
      window.openCategories = (e) => {
        e && e.preventDefault();
        window.openStickyView("categories");
      };
      window.openStores = (e) => {
        e && e.preventDefault();
        if (typeof window.renderStores === "function") window.renderStores();
        window.openStickyView("stores");
      };

      window.applyHubPromo = function (code) {
        window.openStickyView("cart");
        setTimeout(() => {
          const area = document.getElementById("promoArea");
          if (area && !area.classList.contains("is-open"))
            area.classList.add("is-open");
          const status = document.getElementById("promo-status-text");
          if (status) status.textContent = "Close";
          const input = document.getElementById("promo-input");
          if (input) input.value = code;
          if (typeof window.applyPromoCode === "function")
            window.applyPromoCode();
        }, 300);
      };

      window.__stickyCtrl = {
        setExpanded,
        getCurrent: () => current,
        goTo,
        show: showDock,
        hide: hideDock,
        syncView,
      };
    })();

    /* ══════════════════════════════════════════════════════════════════
       5.8 PROMO BANNER  (centered + marquee when overflowing)
       ══════════════════════════════════════════════════════════════════ */
    let adTimer = null;

    function initPromoBanner() {
      const banner = document.getElementById("stickyPromoBanner");
      if (!banner) return;

      const msgs = PROMO_BANNER.length
        ? PROMO_BANNER
        : [STORE.name ? "Welcome to " + STORE.name : "Welcome to the store"];

      banner.innerHTML =
        '<span class="hub-ad-icon"><i class="bi bi-megaphone-fill"></i></span>' +
        '<div class="hub-ad-viewport" id="hubAdViewport">' +
        msgs
          .map(
            (m, i) =>
              '<span class="hub-ad-msg" data-ad="' +
              i +
              '">' +
              '<span class="hub-ad-msg-text">' +
              esc(m) +
              "</span>" +
              "</span>",
          )
          .join("") +
        "</div>";

      const viewport = banner.querySelector("#hubAdViewport");
      const nodes = Array.prototype.slice.call(
        banner.querySelectorAll(".hub-ad-msg"),
      );
      if (!nodes.length) return;

      let idx = 0;

      function measure(node) {
        if (!node || !viewport) return;
        const text = node.querySelector(".hub-ad-msg-text");
        if (!text) return;
        node.classList.remove("is-scrolling");
        node.style.removeProperty("--ad-shift");
        void text.offsetWidth;
        const overflow = text.scrollWidth - viewport.clientWidth;
        if (overflow > 4) {
          node.style.setProperty("--ad-shift", overflow + "px");
          node.classList.add("is-scrolling");
        }
      }

      function show(i) {
        nodes.forEach((n) => n.classList.remove("is-active"));
        idx = ((i % nodes.length) + nodes.length) % nodes.length;
        const node = nodes[idx];
        node.classList.add("is-active");
        requestAnimationFrame(() => measure(node));
      }

      show(0);
      if (adTimer) clearInterval(adTimer);
      if (nodes.length > 1) adTimer = setInterval(() => show(idx + 1), 5200);

      if (banner.__onResize)
        window.removeEventListener("resize", banner.__onResize);
      banner.__onResize = () => {
        clearTimeout(banner.__rt);
        banner.__rt = setTimeout(() => measure(nodes[idx]), 160);
      };
      window.addEventListener("resize", banner.__onResize, { passive: true });
    }

    /* ══════════════════════════════════════════════════════════════════
       5.9 QUICK LOOK
       ══════════════════════════════════════════════════════════════════ */
    let CURRENT_PRODUCT = null;
    let CURRENT_REVIEW_RATING = 0;
    let qlIndex = 0;
    let lightboxReturnView = "quick-look";

    function firstProduct() {
      return PRODUCTS[Object.keys(PRODUCTS)[0]] || null;
    }

    function bindQuickLook(product) {
      const container = document.getElementById("ql-image-container");
      const counter = document.getElementById("image-counter");
      const dotsWrap = document.getElementById("ql-dots");
      if (!container) return;

      const total = container.children.length || 1;
      qlIndex = 0;
      if (counter) counter.textContent = "1/" + total;

      function paintDots(active) {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = Array.from(
          { length: total },
          (_, i) =>
            '<button type="button" class="pd-dot' +
            (i === active ? " is-active" : "") +
            '" data-index="' +
            i +
            '" aria-label="Image ' +
            (i + 1) +
            '"></button>',
        ).join("");
      }
      paintDots(0);

      if (dotsWrap && !dotsWrap.__wired) {
        dotsWrap.__wired = true;
        dotsWrap.addEventListener("click", (e) => {
          const b = e.target.closest(".pd-dot");
          if (!b) return;
          const slide = container.children[parseInt(b.dataset.index, 10) || 0];
          if (slide)
            container.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
        });
      }

      if (!container.__wired) {
        container.__wired = true;
        container.addEventListener(
          "scroll",
          function () {
            const w = this.clientWidth || 1;
            const idx = Math.max(
              0,
              Math.min(total - 1, Math.round(this.scrollLeft / w)),
            );
            if (idx === qlIndex) return;
            qlIndex = idx;
            const c = document.getElementById("image-counter");
            if (c) c.textContent = idx + 1 + "/" + total;
            const d = document.getElementById("ql-dots");
            if (d)
              d.querySelectorAll(".pd-dot").forEach((x, i) =>
                x.classList.toggle("is-active", i === idx),
              );
          },
          { passive: true },
        );
      }

      const starWrap = document.getElementById("star-rating-input");
      if (starWrap) {
        const stars = Array.prototype.slice.call(
          starWrap.querySelectorAll(".bi-star-fill"),
        );
        const label = document.getElementById("rating-text");
        const paint = (n) =>
          stars.forEach((s, i) => s.classList.toggle("is-on", i < n));
        const labelFor = (n) =>
          ["Select rating", "Terrible", "Bad", "Average", "Good", "Excellent"][
            n
          ] || "Select rating";

        stars.forEach((s, i) => {
          const val = i + 1;
          s.addEventListener("mouseenter", () => paint(val));
          s.addEventListener("mouseleave", () => paint(CURRENT_REVIEW_RATING));
          s.addEventListener("click", () => {
            CURRENT_REVIEW_RATING = val;
            paint(val);
            if (label) label.textContent = labelFor(val);
          });
        });
        paint(0);
        if (label) label.textContent = labelFor(0);
      }

      const ta = document.getElementById("form-review-text");
      const cc = document.getElementById("char-count");
      if (ta && cc) {
        ta.value = "";
        cc.textContent = "0";
        if (!ta.__wired) {
          ta.__wired = true;
          ta.addEventListener("input", () => {
            const c = document.getElementById("char-count");
            if (c) c.textContent = ta.value.length;
          });
        }
      }

      const form = document.getElementById("review-form-panel");
      if (form) form.classList.remove("is-open");
    }

    function ensureLightbox() {
      if (document.getElementById("pdLightbox")) return;
      const el = document.createElement("div");
      el.id = "pdLightbox";
      el.className = "pd-lightbox";
      el.innerHTML =
        '<button type="button" class="pd-lightbox-close" id="pdLightboxClose" aria-label="Close">' +
        '<i class="bi bi-x-lg"></i></button>' +
        '<div class="pd-lightbox-frame">' +
        '<div class="pd-lightbox-track" id="pdLightboxTrack"></div>' +
        '<span class="pd-lightbox-counter" id="pdLightboxCounter">1/1</span>' +
        "</div>" +
        '<div class="pd-dots" id="pdLightboxDots"></div>';
      document.body.appendChild(el);

      el.addEventListener("click", (e) => {
        if (e.target === el) closeLightbox();
      });
      el.querySelector("#pdLightboxClose").addEventListener(
        "click",
        closeLightbox,
      );

      const track = el.querySelector("#pdLightboxTrack");
      track.addEventListener(
        "scroll",
        () => {
          const total = track.children.length || 1;
          const w = track.clientWidth || 1;
          const idx = Math.max(
            0,
            Math.min(total - 1, Math.round(track.scrollLeft / w)),
          );
          const c = el.querySelector("#pdLightboxCounter");
          if (c) c.textContent = idx + 1 + "/" + total;
          el.querySelectorAll("#pdLightboxDots .pd-dot").forEach((d, i) =>
            d.classList.toggle("is-active", i === idx),
          );
        },
        { passive: true },
      );

      el.querySelector("#pdLightboxDots").addEventListener("click", (e) => {
        const b = e.target.closest(".pd-dot");
        if (!b) return;
        const slide = track.children[parseInt(b.dataset.index, 10) || 0];
        if (slide)
          track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && el.classList.contains("is-open"))
          closeLightbox();
      });
    }

    function closeLightbox() {
      const el = document.getElementById("pdLightbox");
      if (!el || !el.classList.contains("is-open")) return;
      el.classList.remove("is-open");
      const target = lightboxReturnView || "quick-look";
      const ctrl = window.__stickyCtrl;
      if (ctrl) {
        ctrl.show();
        if (ctrl.getCurrent() !== target) ctrl.goTo(target, "left", false);
      }
    }

    window.openImageLightbox = function () {
      if (!CURRENT_PRODUCT) return;
      ensureLightbox();

      lightboxReturnView =
        (window.__stickyCtrl && window.__stickyCtrl.getCurrent()) ||
        "quick-look";

      const el = document.getElementById("pdLightbox");
      const track = document.getElementById("pdLightboxTrack");
      const dots = document.getElementById("pdLightboxDots");
      const counter = document.getElementById("pdLightboxCounter");
      const imgs = CURRENT_PRODUCT.images || [];
      const total = imgs.length || 1;

      track.innerHTML = imgs
        .map(
          (u, i) =>
            '<img class="pd-lightbox-slide" src="' +
            esc(u) +
            '" alt="' +
            esc(CURRENT_PRODUCT.title) +
            " " +
            (i + 1) +
            '">',
        )
        .join("");

      dots.innerHTML = Array.from(
        { length: total },
        (_, i) =>
          '<button type="button" class="pd-dot' +
          (i === qlIndex ? " is-active" : "") +
          '" data-index="' +
          i +
          '"></button>',
      ).join("");

      if (counter) counter.textContent = qlIndex + 1 + "/" + total;

      el.classList.add("is-open");
      requestAnimationFrame(() => {
        const slide = track.children[qlIndex];
        if (slide) track.scrollLeft = slide.offsetLeft;
      });
    };

    window.closeImageLightbox = closeLightbox;

    window.openQuickLook = function (productId) {
      const product = PRODUCTS[productId] || firstProduct();
      if (!product) return;
      CURRENT_PRODUCT = product;
      CURRENT_REVIEW_RATING = 0;

      const mountQL = document.getElementById("quickLookMount");
      if (!mountQL) return;
      mountQL.innerHTML = T.quickLookBody(product);

      /* instantiate dropdops inside the freshly-injected panes */
      initPaneDropdops(mountQL);

      const stockPill = document.getElementById("qlStockPill");
      if (stockPill) {
        stockPill.innerHTML =
          '<span class="mv-dot"></span>' +
          (product.stock === "low"
            ? "Low stock"
            : product.stock === "out"
              ? "Out of stock"
              : "In stock");
      }

      bindQuickLook(product);
      window.switchPDTab("overview");
      window.openStickyView("quick-look");
      window.showAlert("product", "Quick look · " + product.title);
    };

    window.switchPDTab = function (tabId) {
      document
        .querySelectorAll(".pd-pane")
        .forEach((p) => p.classList.remove("is-active"));
      const target = document.getElementById("pane-" + tabId);
      if (target) target.classList.add("is-active");
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("is-active"));
      const active = document.getElementById("tab-" + tabId);
      if (active) active.classList.add("is-active");
    };

    window.toggleReviewForm = function () {
      const panel = document.getElementById("review-form-panel");
      if (panel) panel.classList.toggle("is-open");
    };

    window.submitUserReview = function () {
      const ta = document.getElementById("form-review-text");
      const text = ta ? ta.value.trim() : "";
      if (!text) {
        window.showAlert("error", "Please write your review before posting.");
        return;
      }
      if (!CURRENT_REVIEW_RATING) {
        window.showAlert("error", "Please select a star rating.");
        return;
      }
      if (!CURRENT_PRODUCT) return;

      CURRENT_PRODUCT.reviews = CURRENT_PRODUCT.reviews || [];
      CURRENT_PRODUCT.reviews.unshift({
        author: "John Doe",
        initials: "JD",
        verified: true,
        date: "Just now",
        rating: CURRENT_REVIEW_RATING,
        size: "M",
        color: "Blue",
        text,
        helpful: 0,
        replies: 0,
      });

      const mountQL = document.getElementById("quickLookMount");
      if (mountQL) {
        mountQL.innerHTML = T.quickLookBody(CURRENT_PRODUCT);
        initPaneDropdops(mountQL);
        bindQuickLook(CURRENT_PRODUCT);
        window.switchPDTab("reviews");
      }
      window.showAlert("success", "Your review has been posted.");
    };

    window.toggleReviewExpand = function (btn) {
      const card = btn.closest(".pd-review-card");
      if (!card) return;
      const wrap = card.querySelector(".pd-review-text-wrap");
      const isClamped = wrap.classList.contains("is-clamped");
      document
        .querySelectorAll(".pd-review-text-wrap.is-clamped")
        .forEach((w) => {
          if (w !== wrap) {
            w.classList.add("is-clamped");
            const b = w.parentElement.querySelector(".pd-review-more");
            if (b) b.textContent = "Read more";
          }
        });
      wrap.classList.toggle("is-clamped", !isClamped);
      btn.textContent = isClamped ? "Show less" : "Read more";
    };

    window.askOwnerOnWhatsApp = function (productId) {
      const p = PRODUCTS[productId];
      window.showAlert(
        "shipping",
        'Opening WhatsApp chat about "' + (p ? p.title : "this item") + '"…',
      );
    };
    window.handleProductQuickBuy = function (productId) {
      const p = PRODUCTS[productId];
      const soundEngine = window.ShopEaseSounds || window.MatagerSounds;
      if (soundEngine && typeof soundEngine.play === "function") {
        soundEngine.play("checkout");
      }
      if (window.MatagerFirebase && typeof window.MatagerFirebase.submitOrder === "function") {
        window.MatagerFirebase.submitOrder({
          productId: productId,
          productName: p ? p.title : "Item",
          total: p ? p.price : 4500,
          itemsCount: 1,
          paymentMethod: "Online FastCart",
        });
      } else {
        window.showAlert("product", "Quick Buy · " + (p ? p.title : "item"));
      }
    };
    window.handleProductAddToBag = function (productId) {
      const p = PRODUCTS[productId];
      const soundEngine = window.ShopEaseSounds || window.MatagerSounds;
      if (soundEngine && typeof soundEngine.play === "function") {
        soundEngine.play("cart-add");
      }
      window.showAlert("cart", (p ? p.title : "Item") + " added to your bag.");
    };

    /* ══════════════════════════════════════════════════════════════════
       5.10 GALLERY / CATEGORIES / FAVORITES
       ══════════════════════════════════════════════════════════════════ */
    window.toggleFavorite = function (productId, silent) {
      const isFav = state.favorites.has(productId);
      if (isFav) state.favorites.delete(productId);
      else state.favorites.add(productId);

      document
        .querySelectorAll('[data-fav-toggle="' + productId + '"]')
        .forEach((el) => {
          el.classList.toggle("is-on", !isFav);
        });
      updateFavBadge();
      renderFavorites();

      if (!silent) {
        const p = PRODUCTS[productId];
        window.showAlert(
          "favorite",
          (isFav ? "Removed from" : "Added to") +
            " favorites · " +
            (p ? p.title : ""),
        );
      }
    };

    function updateFavBadge() {
      const badge = document.querySelector('[data-badge="favorites"]');
      if (badge) {
        const count = state.favorites.size;
        badge.textContent = count;
        badge.classList.toggle("is-hidden", count === 0);
      }
      const pill = document.getElementById("favCountPill");
      if (pill) pill.textContent = state.favorites.size + " items";
    }

    function renderFavorites() {
      const grid = document.getElementById("favoritesGrid");
      if (!grid) return;
      const items = Array.from(state.favorites)
        .map((id) => PRODUCTS[id])
        .filter(Boolean);
      if (!items.length) {
        grid.innerHTML =
          '<div class="search-empty" style="grid-column:1/-1"><div class="search-empty-ico">' +
          '<i class="bi bi-heart"></i></div><p>No favorites yet</p>' +
          "<small>Tap the heart on any product</small></div>";
        return;
      }
      grid.innerHTML = items
        .map(
          (p) => `
        <button type="button" class="gallery-card" data-product="${esc(p.id)}">
          <div class="gallery-thumb">
            <img src="${esc(p.images && p.images[0])}" alt="${esc(p.title)}" loading="lazy">
            <span class="gallery-fav is-on" data-fav-toggle="${esc(p.id)}" aria-label="Remove favorite">
              <i class="bi bi-heart-fill"></i>
            </span>
          </div>
          <div class="gallery-meta">
            <span class="gallery-brand">${esc(p.brand)}</span>
            <p class="gallery-title">${esc(p.title)}</p>
            <span class="gallery-price">${money(p.price)}</span>
          </div>
        </button>`,
        )
        .join("");
    }

    function getStoreCategories() {
      const map = new Map();
      Object.values(PRODUCTS).forEach((p) => {
        if (!map.has(p.category)) {
          map.set(p.category, {
            name: p.category,
            count: 0,
            image: p.images && p.images[0],
            brands: new Set(),
          });
        }
        const c = map.get(p.category);
        c.count++;
        c.brands.add(p.brand);
      });
      return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }

    function renderCategories() {
      const grid = document.getElementById("categoriesGrid");
      if (!grid) return;
      const cats = getStoreCategories();
      const pill = document.getElementById("categoriesCountPill");
      if (pill) pill.textContent = cats.length + " categories";

      grid.innerHTML = cats
        .map(
          (c) => `
        <button type="button" class="gallery-card" data-category="${esc(c.name)}">
          <div class="gallery-thumb">
            <img src="${esc(c.image || "")}" alt="${esc(c.name)}" loading="lazy">
            <span class="category-count">${c.count} item${c.count === 1 ? "" : "s"}</span>
          </div>
          <div class="gallery-meta">
            <span class="gallery-brand">${esc(Array.from(c.brands).join(" · "))}</span>
            <p class="gallery-title">${esc(c.name)}</p>
          </div>
        </button>`,
        )
        .join("");
    }

    function renderGallery() {
      const grid = document.getElementById("galleryGrid");
      if (!grid) return;

      const filter = state.galleryCategory;
      const items = Object.values(PRODUCTS).filter(
        (p) => !filter || p.category === filter,
      );

      const title = document.getElementById("galleryTitle");
      const pill = document.getElementById("galleryCountPill");
      const bar = document.getElementById("galleryFilterBar");

      if (title) title.textContent = filter ? filter : "Store Gallery";
      if (pill) pill.textContent = items.length + " items";
      if (bar) {
        bar.innerHTML = filter
          ? '<button type="button" class="gallery-chip" onclick="clearGalleryFilter()"><span>' +
            esc(filter) +
            '</span><i class="bi bi-x-lg"></i></button>'
          : "";
      }

      if (!items.length) {
        grid.innerHTML =
          '<div class="search-empty" style="grid-column:1/-1"><div class="search-empty-ico">' +
          '<i class="bi bi-bag"></i></div><p>Nothing here yet</p><small>Try another category</small></div>';
        return;
      }

      grid.innerHTML = items
        .map(
          (p) => `
        <button type="button" class="gallery-card" data-product="${esc(p.id)}">
          <div class="gallery-thumb">
            <img src="${esc(p.images && p.images[0])}" alt="${esc(p.title)}" loading="lazy">
            <span class="gallery-fav${state.favorites.has(p.id) ? " is-on" : ""}"
                  data-fav-toggle="${esc(p.id)}" aria-label="Toggle favorite">
              <i class="bi bi-heart"></i>
            </span>
          </div>
          <div class="gallery-meta">
            <span class="gallery-brand">${esc(p.brand)}</span>
            <p class="gallery-title">${esc(p.title)}</p>
            <span class="gallery-price">${money(p.price)}</span>
          </div>
        </button>`,
        )
        .join("");
    }

    window.openCategory = function (name) {
      state.galleryCategory = name;
      renderGallery();
      window.openStickyView("gallery");
    };
    window.clearGalleryFilter = function () {
      state.galleryCategory = null;
      renderGallery();
    };

    /* delegated clicks inside mount (registered once) */
    mount.addEventListener("click", (e) => {
      const favBtn = e.target.closest("[data-fav-toggle]");
      if (favBtn) {
        e.stopPropagation();
        e.preventDefault();
        window.toggleFavorite(favBtn.dataset.favToggle);
        return;
      }
      const unfollowBtn = e.target.closest("[data-unfollow]");
      if (unfollowBtn) {
        e.preventDefault();
        e.stopPropagation();
        window.toggleFollowStore(unfollowBtn.dataset.unfollow);
        return;
      }
      const storeEl = e.target.closest("[data-store]");
      if (storeEl) {
        e.preventDefault();
        window.openStore(storeEl.dataset.store);
        return;
      }
      const catCard = e.target.closest(".gallery-card[data-category]");
      if (catCard) {
        e.preventDefault();
        window.openCategory(catCard.dataset.category);
        return;
      }
      const card = e.target.closest(".gallery-card[data-product]");
      if (card) {
        e.preventDefault();
        window.openQuickLook(card.dataset.product);
      }
    });

    /* ══════════════════════════════════════════════════════════════════
       5.11 OTHER STORES
       ══════════════════════════════════════════════════════════════════ */
    (function storesModule() {
      const followed = state.followedStores;
      let activeMainCat = state.storeMainCategory || "all";
      let activeSubCat = state.storeSubCategory || "all";
      let query = "";
      let suppressDropdopObserver = false;

      function mainCatName(id) {
        const c = MAIN_CATEGORIES.find((x) => x.id === id);
        return c ? c.name : "";
      }

      function matchesQuery(s, q) {
        if (!q) return true;
        const n = q.toLowerCase();
        return (
          String(s.name || "")
            .toLowerCase()
            .includes(n) ||
          String(s.location || "")
            .toLowerCase()
            .includes(n) ||
          mainCatName(s.mainCategory).toLowerCase().includes(n) ||
          (s.subcategories || []).some((c) =>
            String(c).toLowerCase().includes(n),
          )
        );
      }
      const matchesMainCat = (s) =>
        activeMainCat === "all" || s.mainCategory === activeMainCat;
      const matchesSubCat = (s) =>
        activeSubCat === "all" ||
        (s.subcategories || []).includes(activeSubCat);

      function renderFollowedRow() {
        const row = document.getElementById("followedStoresRow");
        const countEl = document.getElementById("followedStoresCount");
        const section = document.getElementById("followedStoresSection");
        if (!row) return;

        const items = OTHER_STORES.filter((s) => followed.has(s.id));
        if (countEl) countEl.textContent = items.length;
        if (section) section.style.display = items.length ? "" : "none";

        row.innerHTML = items
          .map(
            (s) => `
          <div class="store-card" data-store="${esc(s.id)}" role="button" tabindex="0">
            <div class="store-card-logo">${esc(initialsOf(s.name))}</div>
            <p class="store-card-name">${esc(s.name)}</p>
            <div class="store-card-meta">
              <span class="store-card-rating">★ ${s.rating}</span>
              <span>·</span>
              <span>${s.productCount} items</span>
            </div>
            <button type="button" class="store-follow-btn is-following"
                    data-unfollow="${esc(s.id)}" aria-label="Unfollow ${esc(s.name)}">Following</button>
          </div>`,
          )
          .join("");
      }

      function syncCatDesc() {
        const el = document.getElementById("storeCatDesc");
        if (!el) return;
        const cat = MAIN_CATEGORIES.find((c) => c.id === activeMainCat);
        el.textContent = cat && cat.desc ? cat.desc : "";
      }

      function bindSubDropdopObserver() {
        const dd = document.getElementById("storeSubCatDropdop");
        if (!dd || dd.__watched) return;
        dd.__watched = true;
        const handler = () => {
          if (suppressDropdopObserver) return;
          const val = dd.getAttribute("data-selected") || "";
          const next = !val || val === "All subcategories" ? "all" : val;
          if (next === activeSubCat) return;
          activeSubCat = next;
          state.storeSubCategory = next;
          renderAllStores();
        };
        new MutationObserver(handler).observe(dd, {
          attributes: true,
          attributeFilter: ["data-selected"],
        });
        dd.addEventListener("change", handler, true);
      }

      function renderSubDropdop() {
        const wrap = document.getElementById("storeSubCatWrap");
        if (!wrap) return;

        const subs = MAIN_CAT_SUBS[activeMainCat];
        if (!subs || !subs.length) {
          suppressDropdopObserver = true;
          wrap.style.display = "none";
          wrap.innerHTML = "";
          activeSubCat = "all";
          state.storeSubCategory = "all";
          setTimeout(() => {
            suppressDropdopObserver = false;
          }, 0);
          return;
        }

        wrap.style.display = "";
        const options = ["All subcategories"].concat(subs).join(",");
        const selected =
          activeSubCat === "all" ? "All subcategories" : activeSubCat;

        suppressDropdopObserver = true;
        wrap.innerHTML =
          '<div class="dropdop" id="storeSubCatDropdop" data-optnum="3" data-selected="' +
          esc(selected) +
          '" data-type="search" data-style="outline" data-showcount="true" data-size="sm" ' +
          'data-options="' +
          esc(options) +
          '"></div>';
        setTimeout(() => {
          suppressDropdopObserver = false;
        }, 0);

        if (typeof window.initDropdops === "function") {
          try {
            window.initDropdops();
          } catch (_) {}
        }
        bindSubDropdopObserver();
      }

      function bindMainDropdopObserver() {
        const dd = document.getElementById("storeMainCatDropdop");
        if (!dd || dd.__watched) return;
        dd.__watched = true;
        const handler = () => {
          if (suppressDropdopObserver) return;
          const val = dd.getAttribute("data-selected") || "";
          const cat = MAIN_CATEGORIES.find((c) => c.name === val);
          if (!cat || cat.id === activeMainCat) return;
          activeMainCat = cat.id;
          state.storeMainCategory = cat.id;
          activeSubCat = "all";
          state.storeSubCategory = "all";
          syncCatDesc();
          renderSubDropdop();
          renderAllStores();
        };
        new MutationObserver(handler).observe(dd, {
          attributes: true,
          attributeFilter: ["data-selected"],
        });
        dd.addEventListener("change", handler, true);
      }

      function renderAllStores() {
        const list = document.getElementById("allStoresList");
        const countEl = document.getElementById("allStoresCount");
        const pill = document.getElementById("storesCountPill");
        if (!list) return;

        let items = OTHER_STORES.filter(
          (s) =>
            matchesMainCat(s) && matchesSubCat(s) && matchesQuery(s, query),
        );

        if (state.storeSortMode === "rating-desc") {
          items = items.slice().sort((a, b) => b.rating - a.rating);
        }
        if (countEl) countEl.textContent = items.length;
        if (pill)
          pill.textContent =
            items.length + " store" + (items.length === 1 ? "" : "s");

        if (!items.length) {
          list.innerHTML =
            '<div class="search-empty"><div class="search-empty-ico"><i class="bi bi-shop"></i></div>' +
            "<p>No stores found</p><small>Try a different search or category</small></div>";
          return;
        }

        list.innerHTML = items
          .map(
            (s) => `
          <button type="button" class="store-row" data-store="${esc(s.id)}">
            <div class="store-row-logo">${esc(initialsOf(s.name))}</div>
            <div class="store-row-body">
              <span class="store-row-name">
                ${esc(s.name)}
                ${s.verified ? '<i class="bi bi-patch-check-fill store-row-verified"></i>' : ""}
              </span>
              <div class="store-row-meta">
                <span class="store-card-rating">★ ${s.rating}</span>
                <span>·</span>
                <span>${esc(s.location)}</span>
              </div>
              <div class="store-row-cats">
                ${esc((s.subcategories || []).join(" · "))} · ${s.productCount} products
              </div>
            </div>
            <i class="bi bi-chevron-right store-row-chev"></i>
          </button>`,
          )
          .join("");
      }

      window.renderStores = function () {
        renderFollowedRow();
        syncCatDesc();
        renderSubDropdop();
        renderAllStores();
        bindMainDropdopObserver();
      };

      window.filterStoresByMainCategory = function (id) {
        if (!id || id === activeMainCat) return;
        activeMainCat = id;
        state.storeMainCategory = id;
        activeSubCat = "all";
        state.storeSubCategory = "all";
        syncCatDesc();
        renderSubDropdop();
        renderAllStores();
      };
      window.filterStoresByCategory = window.filterStoresByMainCategory;

      window.setStoreSort = function (mode) {
        state.storeSortMode = mode || "default";
        renderAllStores();
      };

      window.toggleFollowStore = function (id) {
        const isFollowing = followed.has(id);
        if (isFollowing) followed.delete(id);
        else followed.add(id);
        renderFollowedRow();
        renderAllStores();
        const s = OTHER_STORES.find((x) => x.id === id);
        window.showAlert(
          "favorite",
          (followed.has(id) ? "Following " : "Unfollowed ") +
            (s ? s.name : "store"),
        );
      };

      window.openStore = function (id) {
        const s = OTHER_STORES.find((x) => x.id === id);
        if (!s) return;
        window.showAlert(
          "info",
          "Opening " + s.name + " — " + s.productCount + " products",
        );
      };

      /* re-bind the search input each render */
      const searchInput = document.getElementById("store-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          query = e.target.value.trim();
          renderAllStores();
        });
      }

      window.renderStores();
    })();

    /* ══════════════════════════════════════════════════════════════════
       5.12 HUB AI CHAT
       ══════════════════════════════════════════════════════════════════ */
    (function hubChatModule() {
      const GEMINI_MODEL = "gemini-1.5-flash";
      const SYSTEM_PROMPT =
        "You are the " +
        (STORE.name || "Peacock Store") +
        " assistant. You help shoppers navigate a " +
        "mobile sticky quick-access panel. Available views: hub, cart, orders, " +
        "search, favorites, notfications, gallery, categories, stores, profile, " +
        "quick-look, signin, signup. When the user wants to go somewhere or do " +
        "something, reply with ONE short sentence and nothing else (max 15 words). " +
        "When you do not know, say so briefly. Never mention JSON or code.";

      function parseIntent(text) {
        const t =
          " " +
          String(text || "")
            .toLowerCase()
            .trim() +
          " ";
        if (!t.trim()) return { type: "empty" };

        const navMatch = t.match(
          /\b(?:go to|open|show|view|take me to|navigate to|switch to)\b([\s\S]+)/,
        );
        if (navMatch) {
          const rest = navMatch[1];
          if (/\bcart|bag|basket\b/.test(rest))
            return { type: "nav", target: "cart" };
          if (/\border|purchase|history\b/.test(rest))
            return { type: "nav", target: "orders" };
          if (/\bprofile|account|me\b/.test(rest))
            return { type: "nav", target: "profile" };
          if (/\bfavorite|wishlist|saved|heart\b/.test(rest))
            return { type: "nav", target: "favorites" };
          if (/\bnotif|alert|inbox\b/.test(rest))
            return { type: "nav", target: "notfications" };
          if (/\bgallery|store products\b/.test(rest))
            return { type: "nav", target: "gallery" };
          if (/\bcategor/.test(rest))
            return { type: "nav", target: "categories" };
          if (/\bstore|shop|brand\b/.test(rest))
            return { type: "nav", target: "stores" };
          if (/\bsearch\b/.test(rest)) return { type: "nav", target: "search" };
          if (/\bhub|home|main\b/.test(rest))
            return { type: "nav", target: "hub" };
          if (/\bsign ?in|login\b/.test(rest))
            return { type: "nav", target: "signin" };
          if (/\bsign ?up|register|create account\b/.test(rest))
            return { type: "nav", target: "signup" };
        }

        if (
          /\b(light|bright|day)\s*(mode|theme)?\b/.test(t) &&
          !/\bsale|summer\b/.test(t)
        )
          return { type: "theme", value: "light" };
        if (/\b(dark|night|black)\s*(mode|theme)?\b/.test(t))
          return { type: "theme", value: "dark" };
        if (
          /\b(toggle|switch|change|flip)\s*(the\s*)?(theme|mode|color scheme)\b/.test(
            t,
          )
        )
          return { type: "theme", value: "toggle" };

        if (
          /(best|top|highest|greatest|finest)\b/.test(t) &&
          /(store|shop|brand|seller)\b/.test(t) &&
          /(cloth|apparel|wear|fashion|shoe|sneaker|dress|shirt|hoodie|outfit)\b/.test(
            t,
          )
        )
          return { type: "stores-top-rated", category: "apparel" };
        if (
          /(best|top|highest)\b/.test(t) &&
          /(store|shop|brand|seller)\b/.test(t)
        )
          return { type: "stores-top-rated-all" };

        if (/\b(home|garden|furniture|décor|decor|kitchen)\b/.test(t))
          return { type: "stores-category", category: "home" };
        if (/\b(beauty|skincare|wellness|cosmetic|makeup)\b/.test(t))
          return { type: "stores-category", category: "beauty" };
        if (/\b(electronic|gadget|tech|phone|laptop|tv|audio)\b/.test(t))
          return { type: "stores-category", category: "electronics" };
        if (
          /\b(apparel|cloth|fashion|wear|shoe|sneaker|dress|shirt|hoodie|outfit)\b/.test(
            t,
          )
        )
          return { type: "stores-category", category: "apparel" };

        const searchMatch = t.match(
          /\b(?:search|find|look for|look up|show me products?|products? about|products? for)\b\s*(?:for|me|about)?\s+(.+)/,
        );
        if (searchMatch && searchMatch[1])
          return {
            type: "search",
            query: searchMatch[1].trim().replace(/[?.!]+$/, ""),
          };

        if (
          /\b(help|what can you do|commands?|capabilities|how do i)\b/.test(t)
        )
          return { type: "help" };
        if (
          /^\s*(hi|hello|hey|yo|salam|hola|good (morning|evening|afternoon))\b/.test(
            t,
          )
        )
          return { type: "greet" };
        if (/\b(thanks|thank you|shukran|merci)\b/.test(t))
          return { type: "thanks" };
        return { type: "unknown" };
      }

      function labelFor(v) {
        return (
          {
            cart: "your cart",
            orders: "your orders",
            profile: "your profile",
            favorites: "favorites",
            notfications: "notifications",
            gallery: "the gallery",
            categories: "categories",
            stores: "other stores",
            search: "search",
            hub: "the hub",
            signin: "sign in",
            signup: "sign up",
          }[v] || v
        );
      }

      function executeIntent(intent) {
        switch (intent.type) {
          case "nav":
            window.openStickyView(intent.target);
            return {
              reply: "Opening " + labelFor(intent.target) + "…",
              done: true,
            };
          case "theme": {
            const next =
              intent.value === "toggle"
                ? state.theme === "light"
                  ? "dark"
                  : "light"
                : intent.value;
            window.applyTheme(next);
            return { reply: "Switched to " + next + " mode.", done: true };
          }
          case "search":
            window.openStickyView("search");
            setTimeout(() => {
              const inp = document.getElementById("search-input");
              if (inp) {
                inp.value = intent.query;
                inp.dispatchEvent(new Event("input", { bubbles: true }));
              }
            }, 260);
            return {
              reply: 'Searching for "' + intent.query + '"…',
              done: true,
            };
          case "stores-category": {
            window.openStores();
            setTimeout(() => {
              const name = (
                MAIN_CATEGORIES.find((c) => c.id === intent.category) || {}
              ).name;
              const dd = document.getElementById("storeMainCatDropdop");
              if (dd && name) {
                dd.setAttribute("data-selected", name);
                dd.dispatchEvent(new Event("change", { bubbles: true }));
              }
              if (typeof window.filterStoresByMainCategory === "function")
                window.filterStoresByMainCategory(intent.category);
            }, 320);
            const pretty =
              intent.category.charAt(0).toUpperCase() +
              intent.category.slice(1);
            return { reply: "Showing " + pretty + " stores…", done: true };
          }
          case "stores-top-rated": {
            window.openStores();
            setTimeout(() => {
              const name = (
                MAIN_CATEGORIES.find((c) => c.id === "apparel") || {}
              ).name;
              const dd = document.getElementById("storeMainCatDropdop");
              if (dd && name) {
                dd.setAttribute("data-selected", name);
                dd.dispatchEvent(new Event("change", { bubbles: true }));
              }
              if (typeof window.filterStoresByMainCategory === "function")
                window.filterStoresByMainCategory("apparel");
              if (typeof window.setStoreSort === "function")
                window.setStoreSort("rating-desc");
            }, 320);
            return {
              reply:
                "Top-rated apparel stores sorted by rating. Check them out in the Stores view!",
              done: true,
            };
          }
          case "stores-top-rated-all":
            window.openStores();
            setTimeout(() => {
              if (typeof window.setStoreSort === "function")
                window.setStoreSort("rating-desc");
            }, 320);
            return { reply: "All stores sorted by rating. Enjoy!", done: true };
          case "help":
            return {
              reply:
                "I can navigate (cart, orders, profile, favorites, notifications, gallery, " +
                "categories, stores), switch theme (light / dark), search products, and find " +
                'top-rated stores. Try: "best store sells best clothing" or "open my cart".',
              done: true,
            };
          case "greet":
            return {
              reply:
                "Hi! Ask me to open a view, search for products, find top-rated stores, or switch theme.",
              done: true,
            };
          case "thanks":
            return { reply: "You're welcome!", done: true };
          case "empty":
            return { reply: null, done: false };
          default:
            return { reply: null, done: false };
        }
      }

      async function callGemini(text) {
        const key = state.geminiKey || window.GEMINI_API_KEY;
        if (!key) return null;
        try {
          const url =
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            GEMINI_MODEL +
            ":generateContent?key=" +
            encodeURIComponent(key);
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + text }],
                },
              ],
              generationConfig: { temperature: 0.5, maxOutputTokens: 120 },
            }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          const out =
            data &&
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0] &&
            data.candidates[0].content.parts[0].text;
          return out ? String(out).trim() : null;
        } catch (e) {
          console.warn("[Peacock AI] Gemini request failed:", e);
          return null;
        }
      }

      function addMessage(role, text, isTyping) {
        const feed = document.getElementById("hubChatFeed");
        if (!feed) return null;
        const id = "chatmsg-" + Math.random().toString(36).slice(2, 9);
        const div = document.createElement("div");
        div.className =
          role === "user"
            ? "chat-user-msg"
            : "chat-ai-msg" + (isTyping ? " is-typing" : "");
        div.id = id;
        div.textContent = text;
        feed.appendChild(div);
        feed.scrollTop = feed.scrollHeight;
        return id;
      }
      function removeMessage(id) {
        if (!id) return;
        const el = document.getElementById(id);
        if (el) el.remove();
      }
      function setBusy(v) {
        state.chatBusy = !!v;
        const btn = document.getElementById("hubChatSend");
        if (btn) btn.disabled = !!v;
      }

      async function sendChat(rawText) {
        const text = String(rawText || "").trim();
        if (!text || state.chatBusy) return;

        setBusy(true);
        state.chatMessages.push({ role: "user", text, ts: Date.now() });
        addMessage("user", text);
        const typingId = addMessage("ai", "Thinking…", true);

        const intent = parseIntent(text);
        const result = executeIntent(intent);
        let reply = result && result.reply;

        if (!reply && (state.geminiKey || window.GEMINI_API_KEY)) {
          const ai = await callGemini(text);
          if (ai) reply = ai;
        }
        if (!reply) {
          reply =
            'I didn\'t catch that. Try: "open cart", "search for nike", ' +
            '"best store sells best clothing", or "light mode".';
        }

        removeMessage(typingId);
        addMessage("ai", reply);
        state.chatMessages.push({ role: "ai", text: reply, ts: Date.now() });
        setBusy(false);
      }

      function initChat() {
        const ta = document.getElementById("hubChatInput");
        const btn = document.getElementById("hubChatSend");
        if (!ta || !btn) return;

        ta.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const v = ta.value;
            ta.value = "";
            ta.style.height = "auto";
            sendChat(v);
          }
        });
        ta.addEventListener("input", () => {
          ta.style.height = "auto";
          ta.style.height = Math.min(ta.scrollHeight, 110) + "px";
        });
        btn.addEventListener("click", () => {
          const v = ta.value;
          ta.value = "";
          ta.style.height = "auto";
          sendChat(v);
        });

        document
          .querySelectorAll("#hubChatSuggests .chat-ai-suggest")
          .forEach((chip) => {
            chip.addEventListener("click", () =>
              sendChat(chip.dataset.prompt || chip.textContent),
            );
          });

        /* repaint persisted history */
        const feed = document.getElementById("hubChatFeed");
        if (feed) feed.innerHTML = "";
        if (!state.chatMessages.length) {
          state.chatMessages.push({
            role: "ai",
            text:
              "Hi! I'm your " +
              (STORE.name || "store") +
              " assistant. Ask me to open a view, " +
              "search products, find top-rated stores, or switch theme.",
            ts: Date.now(),
          });
        }
        state.chatMessages.forEach((m) => addMessage(m.role, m.text));
        updateChatBadge();
      }

      function updateChatBadge() {
        const b = document.getElementById("hubChatBadge");
        if (!b) return;
        const live = !!(state.geminiKey || window.GEMINI_API_KEY);
        b.textContent = live ? "Gemini" : "Local";
        b.classList.toggle("is-live", live);
      }

      window.hubChatSend = sendChat;
      window.setGeminiKey = function (key) {
        state.geminiKey = key || null;
        updateChatBadge();
      };
      window.__initHubChat = initChat;
    })();

    /* ══════════════════════════════════════════════════════════════════
       5.13 THEME
       ══════════════════════════════════════════════════════════════════ */
    (function themeModule() {
      function applyTheme(theme) {
        const next = theme === "light" ? "light" : "dark";
        state.theme = next;
        const el = document.getElementById("stickyCta");
        if (el) el.setAttribute("data-theme", next);
        const btn = document.getElementById("themeToggleBtn");
        if (btn) {
          const i = btn.querySelector("i");
          if (i)
            i.className =
              next === "light" ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
          btn.setAttribute(
            "title",
            next === "light" ? "Switch to dark mode" : "Switch to light mode",
          );
        }
        try {
          localStorage.setItem("peacock-theme", next);
        } catch (_) {}
      }

      function toggleTheme() {
        applyTheme(state.theme === "light" ? "dark" : "light");
      }

      function initTheme() {
        applyTheme(state.theme || "dark");
        const btn = document.getElementById("themeToggleBtn");
        if (btn && !btn.__wired) {
          btn.__wired = true;
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
            window.showAlert("info", "Switched to " + state.theme + " mode.");
          });
        }
      }

      window.applyTheme = applyTheme;
      window.toggleTheme = toggleTheme;
      window.__initHubTheme = initTheme;
    })();

    /* ══════════════════════════════════════════════════════════════════
       5.14 FILTER DROPDOWNS (delegated, document-level)
       ══════════════════════════════════════════════════════════════════ */
    document.addEventListener("click", function (e) {
      const filter = e.target.closest(".filter");
      if (!filter) {
        document
          .querySelectorAll(".filter-dropdown.open")
          .forEach((d) => d.classList.remove("open"));
        document
          .querySelectorAll(".filter-trigger")
          .forEach((t) => t.setAttribute("aria-expanded", "false"));
        return;
      }
      const dropdown = filter.querySelector(".filter-dropdown");
      const trigger = filter.querySelector(".filter-trigger");
      if (!dropdown || !trigger) return;

      e.stopPropagation();
      const willOpen = !dropdown.classList.contains("open");
      document.querySelectorAll(".filter-dropdown.open").forEach((d) => {
        if (d !== dropdown) d.classList.remove("open");
      });
      document.querySelectorAll(".filter-trigger").forEach((t) => {
        if (t !== trigger) t.setAttribute("aria-expanded", "false");
      });
      dropdown.classList.toggle("open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });

    document.addEventListener("click", function (e) {
      const option = e.target.closest(".filter-option");
      if (!option) return;
      const parentFilter = option.closest(".filter");
      if (!parentFilter) return;
      const trigger = parentFilter.querySelector(".filter-trigger");
      const selectedSpan = trigger && trigger.querySelector(".filter-selected");
      const value = option.dataset.value || option.textContent.trim();
      if (selectedSpan) selectedSpan.textContent = value;
      parentFilter
        .querySelectorAll(".filter-option")
        .forEach((o) => o.classList.remove("is-selected"));
      option.classList.add("is-selected");
      const dropdown = parentFilter.querySelector(".filter-dropdown");
      if (dropdown) dropdown.classList.remove("open");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });

    /* ══════════════════════════════════════════════════════════════════
       5.15 SEARCH
       ══════════════════════════════════════════════════════════════════ */
    function createSearchEngine(opts) {
      const input = document.querySelector(opts.inputSelector);
      const container = document.querySelector(opts.containerSelector);
      if (!input || !container) return null;

      const engine = {
        input,
        container,
        delay: opts.debounceDelay || 180,
        mode: opts.initialMode || "products",
        query: "",
        timer: null,
      };

      engine.search = function (q, mode) {
        mode = mode || engine.mode;
        const data = SEARCH_DATA[mode] || [];
        const needle = String(q || "")
          .toLowerCase()
          .trim();
        if (!needle) return [];
        return data.filter((item) =>
          Object.values(item)
            .filter((v) => typeof v === "string" || typeof v === "number")
            .map(String)
            .map((s) => s.toLowerCase())
            .join(" ")
            .includes(needle),
        );
      };

      engine.renderEmpty = function (q) {
        const label =
          engine.mode.charAt(0).toUpperCase() + engine.mode.slice(1);
        container.innerHTML =
          '<div class="search-empty"><div class="search-empty-ico"><i class="bi bi-search"></i></div>' +
          "<p>No " +
          label.toLowerCase() +
          " found</p>" +
          '<small>Try adjusting your search for "' +
          esc(q) +
          '"</small></div>';
      };

      engine.renderSuggestions = function () {
        const q = engine.query;
        if (!q) return engine.renderPopular();
        const results = engine.search(q);
        if (!results.length) return engine.renderEmpty(q);

        const labels = {
          products: "Products",
          categories: "Categories",
          stores: "Stores",
          orders: "Orders",
        };
        let rowsHTML = "";

        if (engine.mode === "products") {
          rowsHTML = results
            .map(
              (p) =>
                '<div class="search-row" onclick="openQuickLook(\'' +
                esc(p.id) +
                "')\">" +
                '<div class="search-row-thumb"><img src="' +
                esc(p.image) +
                '" alt=""></div>' +
                '<div class="search-row-body">' +
                '<p class="search-row-title">' +
                esc(p.name) +
                "</p>" +
                '<div class="search-row-meta"><span>' +
                esc(p.brand) +
                '</span><span class="search-dot"></span><span>' +
                esc(p.category) +
                "</span></div>" +
                '<p class="search-row-price">' +
                esc(p.price) +
                "</p>" +
                "</div></div>",
            )
            .join("");
        } else if (engine.mode === "categories") {
          rowsHTML = results
            .map(
              (c) =>
                '<div class="search-row" onclick="openCategory(\'' +
                esc(c.name) +
                "')\">" +
                '<div class="search-row-icon"><i class="bi ' +
                esc(c.icon || "bi-bag") +
                '"></i></div>' +
                '<div class="search-row-body">' +
                '<p class="search-row-title">' +
                esc(c.name) +
                "</p>" +
                '<div class="search-row-meta"><span>' +
                c.count +
                " items</span></div>" +
                '</div><i class="bi bi-chevron-right search-row-chev"></i></div>',
            )
            .join("");
        } else if (engine.mode === "stores") {
          rowsHTML = results
            .map(
              (s) =>
                "<div class=\"search-row\" onclick=\"showAlert('search','Store: " +
                esc(s.name) +
                "')\">" +
                '<div class="search-row-icon"><i class="bi bi-shop"></i></div>' +
                '<div class="search-row-body">' +
                '<p class="search-row-title">' +
                esc(s.name) +
                "</p>" +
                '<div class="search-row-meta"><span>' +
                esc(s.location) +
                '</span><span class="search-dot"></span><span>★ ' +
                s.rating +
                "</span></div>" +
                '</div><i class="bi bi-chevron-right search-row-chev"></i></div>',
            )
            .join("");
        } else {
          rowsHTML = results
            .map(
              (o) =>
                '<div class="search-row" onclick="window.openStickyView(\'orders\')">' +
                '<div class="search-row-body">' +
                '<div class="search-row-meta"><span>' +
                esc(o.status) +
                '</span><span class="search-dot"></span><span>#' +
                esc(o.id) +
                "</span></div>" +
                '<p class="search-row-title">' +
                esc(o.total) +
                "</p>" +
                '<div class="search-row-meta"><span>' +
                esc(o.date) +
                "</span></div>" +
                '</div><i class="bi bi-chevron-right search-row-chev"></i></div>',
            )
            .join("");
        }

        container.innerHTML =
          '<div class="search-block">' +
          '<div class="search-block-head"><span>' +
          (labels[engine.mode] || "Results") +
          '</span><span class="search-count">' +
          results.length +
          " found</span></div>" +
          '<div class="search-rows">' +
          rowsHTML +
          "</div>" +
          "</div>";
      };

      engine.renderPopular = function () {
        const mode = engine.mode;
        let html = "";
        if (mode === "products") {
          html =
            '<div class="search-block"><div class="search-block-head"><span>Popular brands</span></div>' +
            '<div class="search-grid">' +
            (POPULAR.brands || [])
              .map(
                (b) =>
                  '<button class="search-tile" onclick="searchEngine.setQuery(\'' +
                  esc(b) +
                  "')\">" +
                  "<span>" +
                  esc(b) +
                  '</span><i class="bi bi-arrow-right"></i></button>',
              )
              .join("") +
            "</div></div>" +
            '<div class="search-block"><div class="search-block-head"><span>Popular categories</span></div>' +
            '<div class="search-grid">' +
            (POPULAR.categories || [])
              .map(
                (c) =>
                  '<button class="search-tile" onclick="searchEngine.setQuery(\'' +
                  esc(c) +
                  "')\">" +
                  "<span>" +
                  esc(c) +
                  '</span><i class="bi bi-arrow-right"></i></button>',
              )
              .join("") +
            "</div></div>";
        } else if (mode === "categories") {
          html =
            '<div class="search-block"><div class="search-block-head"><span>All categories</span></div>' +
            '<div class="search-grid">' +
            (SEARCH_DATA.categories || [])
              .map(
                (c) =>
                  '<button class="search-tile" onclick="searchEngine.setQuery(\'' +
                  esc(c.name) +
                  "')\">" +
                  "<span>" +
                  esc(c.name) +
                  '</span><span class="search-tile-count">' +
                  c.count +
                  "</span></button>",
              )
              .join("") +
            "</div></div>";
        } else if (mode === "stores") {
          html =
            '<div class="search-block"><div class="search-block-head"><span>Stores</span></div>' +
            '<div class="search-rows">' +
            (SEARCH_DATA.stores || [])
              .map(
                (s) =>
                  "<div class=\"search-row\" onclick=\"showAlert('search','Store: " +
                  esc(s.name) +
                  "')\">" +
                  '<div class="search-row-icon"><i class="bi bi-shop"></i></div>' +
                  '<div class="search-row-body">' +
                  '<p class="search-row-title">' +
                  esc(s.name) +
                  "</p>" +
                  '<div class="search-row-meta"><span>' +
                  esc(s.location) +
                  '</span><span class="search-dot"></span><span>★ ' +
                  s.rating +
                  "</span></div>" +
                  '</div><i class="bi bi-chevron-right search-row-chev"></i></div>',
              )
              .join("") +
            "</div></div>";
        } else {
          html =
            '<div class="search-block"><div class="search-block-head"><span>Recent orders</span></div>' +
            '<div class="search-rows">' +
            (SEARCH_DATA.orders || [])
              .map(
                (o) =>
                  '<div class="search-row" onclick="window.openStickyView(\'orders\')">' +
                  '<div class="search-row-body">' +
                  '<div class="search-row-meta"><span>' +
                  esc(o.status) +
                  '</span><span class="search-dot"></span><span>#' +
                  esc(o.id) +
                  "</span></div>" +
                  '<p class="search-row-title">' +
                  esc(o.total) +
                  "</p>" +
                  '<div class="search-row-meta"><span>' +
                  esc(o.date) +
                  "</span></div>" +
                  '</div><i class="bi bi-chevron-right search-row-chev"></i></div>',
              )
              .join("") +
            "</div></div>";
        }
        container.innerHTML = html;
      };

      engine.setMode = function (mode) {
        engine.mode = mode;
        engine.query = "";
        if (input) {
          input.value = "";
          input.placeholder =
            {
              products: "Search products...",
              categories: "Search categories...",
              stores: "Search stores...",
              orders: "Search orders...",
            }[mode] || "Search...";
        }
        engine.renderPopular();
      };

      engine.setQuery = function (q) {
        input.value = q;
        engine.query = q;
        engine.renderSuggestions();
        input.focus();
      };

      input.addEventListener("focus", () => engine.renderSuggestions());
      input.addEventListener("blur", () =>
        setTimeout(() => {
          if (!engine.query) engine.renderPopular();
        }, 180),
      );
      input.addEventListener("input", (e) => {
        clearTimeout(engine.timer);
        engine.timer = setTimeout(() => {
          engine.query = e.target.value.trim();
          engine.renderSuggestions();
        }, engine.delay);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          input.blur();
          engine.query = "";
          input.value = "";
          engine.renderPopular();
        }
      });

      engine.renderPopular();
      return engine;
    }

    window.switchSearchMode = function (mode) {
      document
        .querySelectorAll(".search-mode-btn")
        .forEach((b) => b.classList.remove("is-active"));
      const active = document.getElementById("mode-" + mode);
      if (active) active.classList.add("is-active");
      if (window.searchEngine) window.searchEngine.setMode(mode);
    };

    /* ══════════════════════════════════════════════════════════════════
       5.16 CART
       ══════════════════════════════════════════════════════════════════ */
    (function cartModule() {
      let cartSubtotal = 0;
      let cartShipping = 0;
      let cartDiscount = 0;
      let currentShippingMethod = "home";
      let nextAddressId = 1000;
      let selectedPaymentMethod = "card";

      window.selectShippingMethod = function (method) {
        if (method === "pickup" && !STORE_HAS_PICKUP) {
          window.showAlert(
            "shipping",
            "Store pickup is not available for this store.",
          );
          return;
        }
        currentShippingMethod = method;
        document
          .getElementById("tab-shipping-home")
          .classList.toggle("is-active", method === "home");
        document
          .getElementById("tab-shipping-pickup")
          .classList.toggle("is-active", method === "pickup");
        document
          .getElementById("shipping-home-panel")
          .classList.toggle("is-hidden", method !== "home");
        document
          .getElementById("shipping-pickup-panel")
          .classList.toggle("is-hidden", method !== "pickup");
        cartShipping =
          method === "home"
            ? (SHIPPING_ADDRESSES[0] && Number(SHIPPING_ADDRESSES[0].cost)) || 0
            : 0;
        window.updateCartTotal();
      };

      window.selectAddress = function (el) {
        document
          .querySelectorAll("#address-list .address-card")
          .forEach((c) => c.classList.remove("is-selected"));
        el.classList.add("is-selected");
        cartShipping = parseFloat(el.dataset.shippingCost) || 0;
        window.updateCartTotal();
      };

      window.toggleNewAddressForm = function () {
        const f = document.getElementById("new-address-form");
        if (f) f.classList.toggle("is-open");
      };

      window.saveNewAddress = function () {
        const label =
          document.getElementById("new-addr-label").value.trim() || "Address";
        const street = document.getElementById("new-addr-street").value.trim();
        const city = document.getElementById("new-addr-city").value.trim();
        const phone = document.getElementById("new-addr-phone").value.trim();
        if (!street || !city) {
          window.showAlert("error", "Please fill in street and city.");
          return;
        }

        const id = nextAddressId++;
        const card = document.createElement("div");
        card.className = "address-card";
        card.dataset.addressId = id;
        card.dataset.shippingCost = "50";
        card.onclick = () => window.selectAddress(card);
        card.innerHTML =
          '<div class="address-icon"><i class="bi bi-geo-alt"></i></div>' +
          '<div class="address-body">' +
          '<div class="address-head"><span class="address-label">' +
          esc(label) +
          "</span>" +
          '<span class="address-tag address-tag--blue">New</span></div>' +
          '<p class="address-line">' +
          esc(street) +
          ", " +
          esc(city) +
          "</p>" +
          (phone ? '<p class="address-phone">' + esc(phone) + "</p>" : "") +
          "</div>" +
          '<i class="bi bi-check-circle-fill address-check"></i>';

        document.getElementById("address-list").appendChild(card);
        [
          "new-addr-label",
          "new-addr-street",
          "new-addr-city",
          "new-addr-phone",
        ].forEach((id2) => {
          const el = document.getElementById(id2);
          if (el) el.value = "";
        });
        window.toggleNewAddressForm();
        window.selectAddress(card);
        window.showAlert("success", "New address saved and selected.");
      };

      window.synchronizeCartItemCount = function () {
        let total = 0;
        document.querySelectorAll(".cart-item-row").forEach((r) => {
          total += parseInt(r.getAttribute("data-quantity"), 10) || 0;
        });
        const badge = document.getElementById("cart-badge-counter");
        if (badge)
          badge.textContent = total + " Item" + (total === 1 ? "" : "s");
        const summary = document.getElementById("summary-item-count");
        if (summary)
          summary.textContent = total + " item" + (total === 1 ? "" : "s");
        const hubBadge = document.querySelector('[data-badge="cart"]');
        if (hubBadge) hubBadge.textContent = total;
        const hubMetric = document.getElementById("hubMetricCart");
        if (hubMetric) hubMetric.textContent = total;
      };

      window.removeCartItemRow = function (btn) {
        const row = btn.closest(".cart-item-row");
        if (row) row.remove();
        window.recalculateSubtotal();
        window.showAlert("cart", "Item removed from your cart.");
      };

      window.recalculateSubtotal = function () {
        let total = 0;
        document.querySelectorAll(".cart-item-row").forEach((r) => {
          const price = parseFloat(r.getAttribute("data-item-price")) || 0;
          const qty = parseInt(r.getAttribute("data-quantity"), 10) || 1;
          total += price * qty;
        });
        cartSubtotal = total;
        window.updateCartTotal();
        window.synchronizeCartItemCount();
      };

      window.togglePromoArea = function () {
        const area = document.getElementById("promoArea");
        if (!area) return;
        area.classList.toggle("is-open");
        const status = document.getElementById("promo-status-text");
        if (status) {
          status.textContent = area.classList.contains("is-open")
            ? "Close"
            : cartDiscount > 0
              ? "Applied"
              : "Add";
        }
      };

      window.setPromoCode = function (code) {
        const input = document.getElementById("promo-input");
        if (input) input.value = code;
        window.applyPromoCode();
      };

      window.applyPromoCode = function () {
        const code = (document.getElementById("promo-input").value || "")
          .trim()
          .toUpperCase();
        const status = document.getElementById("promo-status-text");
        const promoRow = document.getElementById("cart-promo-row");

        const coupon = STORE_COUPONS.find(
          (c) => String(c.code).toUpperCase() === code,
        );
        if (coupon) {
          if (coupon.type === "shipping") cartDiscount = cartShipping;
          else
            cartDiscount = (cartSubtotal * (Number(coupon.value) || 0)) / 100;
          if (coupon.maxDiscount)
            cartDiscount = Math.min(cartDiscount, Number(coupon.maxDiscount));
          if (status) {
            status.textContent = "Applied";
            status.className = "cart-section-status is-success";
          }
          if (promoRow) promoRow.style.display = "flex";
          window.showAlert("success", 'Promo code "' + code + '" applied.');
        } else {
          cartDiscount = 0;
          if (status) {
            status.textContent = "Invalid";
            status.className = "cart-section-status is-error";
          }
          if (promoRow) promoRow.style.display = "none";
          window.showAlert("error", "That promo code is not valid.");
        }
        window.updateCartTotal();
      };

      window.updateCartTotal = function () {
        const total = Math.max(0, cartSubtotal + cartShipping - cartDiscount);
        const fmt = (n) => money(n);
        const set = (id, v) => {
          const el = document.getElementById(id);
          if (el) el.textContent = v;
        };

        set("cart-subtotal", fmt(cartSubtotal));
        set("cart-shipping", fmt(cartShipping));
        set("cart-promo", "-" + fmt(cartDiscount));
        set("checkout-total-price", fmt(total));
        set("final-subtotal", fmt(cartSubtotal));
        set("final-shipping", fmt(cartShipping));
        set("final-promo", "-" + fmt(cartDiscount));
        set("final-total", fmt(total));
        set("summary-total", fmt(total));

        const fPromoRow = document.getElementById("final-promo-row");
        if (fPromoRow)
          fPromoRow.style.display = cartDiscount > 0 ? "flex" : "none";

        const payBtn = document.getElementById("pay-submit-btn");
        if (payBtn)
          payBtn.innerHTML =
            '<i class="bi bi-lock-fill"></i> Pay & Submit • ' + fmt(total);
      };

      window.goToCheckoutStep2 = function () {
        if (
          currentShippingMethod === "home" &&
          !document.querySelector("#address-list .address-card.is-selected")
        ) {
          window.showAlert("shipping", "Please select a delivery address.");
          return;
        }
        document.getElementById("cart-step-1").classList.add("is-hidden");
        document.getElementById("cart-step-2").classList.remove("is-hidden");
        document.getElementById("cart-head-title").textContent = "Payment";
        window.updateCartTotal();
      };

      window.goToCheckoutStep1 = function () {
        document.getElementById("cart-step-2").classList.add("is-hidden");
        document.getElementById("cart-step-1").classList.remove("is-hidden");
        document.getElementById("cart-head-title").textContent = "Your Cart";
      };

      window.selectPayment = function (el) {
        document
          .querySelectorAll(".payment-option")
          .forEach((p) => p.classList.remove("is-selected"));
        el.classList.add("is-selected");
        selectedPaymentMethod = el.dataset.payment;
      };

      window.submitOrder = function (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<span class="cart-spinner"></span> Processing...';
        btn.disabled = true;
        setTimeout(() => {
          const methodLabel = {
            card: "Card",
            cod: "Cash on Delivery",
            wallet: "Digital Wallet",
          }[selectedPaymentMethod];
          const shipLabel =
            currentShippingMethod === "pickup"
              ? "Store Pickup"
              : "Home Delivery";
          window.showAlert(
            "order",
            "Order placed via " + methodLabel + " · " + shipLabel,
          );
          window.goToCheckoutStep1();
          btn.innerHTML = original;
          btn.disabled = false;
          window.updateCartTotal();
        }, 1700);
      };

      window.__initCart = function () {
        cartDiscount = 0;
        currentShippingMethod = "home";
        selectedPaymentMethod = "card";

        const firstCost =
          (SHIPPING_ADDRESSES[0] && Number(SHIPPING_ADDRESSES[0].cost)) || 0;
        cartShipping = firstCost;

        const step1 = document.getElementById("cart-step-1");
        const step2 = document.getElementById("cart-step-2");
        if (step1) step1.classList.remove("is-hidden");
        if (step2) step2.classList.add("is-hidden");
        const head = document.getElementById("cart-head-title");
        if (head) head.textContent = "Your Cart";

        window.recalculateSubtotal();
      };
    })();

    /* ══════════════════════════════════════════════════════════════════
       5.17 ORDERS
       ══════════════════════════════════════════════════════════════════ */
    window.toggleOrderCard = function (btn) {
      const card = btn.closest(".order-card");
      if (!card) return;
      const isOpen = card.classList.contains("is-open");
      document.querySelectorAll(".order-card.is-open").forEach((c) => {
        if (c !== card) {
          c.classList.remove("is-open");
          const h = c.querySelector(".order-card-head");
          if (h) h.setAttribute("aria-expanded", "false");
        }
      });
      card.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    };

    window.cancelOrder = function (id) {
      window.showAlert("order", "Order #" + id + " cancellation requested.");
    };

    /* ══════════════════════════════════════════════════════════════════
       5.18 AUTH
       ══════════════════════════════════════════════════════════════════ */
    window.openSignIn = function () {
      window.openStickyView("signin");
    };
    window.openSignUp = function () {
      window.openStickyView("signup");
    };

    window.togglePassword = function (inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      const isPass = input.type === "password";
      input.type = isPass ? "text" : "password";
      const ic = btn.querySelector("i");
      if (ic) ic.className = isPass ? "bi bi-eye-slash" : "bi bi-eye";
    };

    window.handleSignIn = function (e) {
      e.preventDefault();
      const email = document.getElementById("signinEmail").value.trim();
      const password = document.getElementById("signinPassword").value;
      const err = document.getElementById("signinError");
      const fail = (msg) => {
        err.textContent = msg;
        err.classList.add("is-visible");
        return false;
      };
      err.classList.remove("is-visible");
      if (!email || !password) return fail("Please fill in all fields.");
      if (!/^\S+@\S+\.\S+$/.test(email))
        return fail("Please enter a valid email address.");
      if (password.length < 6)
        return fail("Password must be at least 6 characters.");
      window.showAlert("success", "Welcome back! Signing you in…");
      setTimeout(() => window.openStickyView("profile"), 800);
      return false;
    };

    window.handleSignUp = function (e) {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirm = document.getElementById("signupConfirm").value;
      const terms = document.getElementById("signupTerms").checked;
      const err = document.getElementById("signupError");
      const fail = (msg) => {
        err.textContent = msg;
        err.classList.add("is-visible");
        return false;
      };
      err.classList.remove("is-visible");
      if (!name || !email || !password || !confirm)
        return fail("Please fill in all fields.");
      if (!/^\S+@\S+\.\S+$/.test(email))
        return fail("Please enter a valid email address.");
      if (password.length < 6)
        return fail("Password must be at least 6 characters.");
      if (password !== confirm) return fail("Passwords do not match.");
      if (!terms) return fail("Please accept the Terms & Privacy Policy.");
      window.showAlert(
        "success",
        "Account created. Welcome to " + (STORE.name || "Peacock") + "!",
      );
      setTimeout(() => window.openStickyView("profile"), 800);
      return false;
    };

    window.signIn = () => window.openSignIn();
    window.signOut = () => {
      if (confirm("Sign out from your account?")) {
        window.showAlert("logout", "Signed out successfully.");
        setTimeout(() => window.openStickyView("hub"), 700);
      }
    };
    window.copyStoreLink = () => {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(location.href)
          .then(() => window.showAlert("success", "Store link copied."))
          .catch(() => window.showAlert("info", "Copy: " + location.href));
      } else {
        window.showAlert("info", "Copy: " + location.href);
      }
    };

    /* ══════════════════════════════════════════════════════════════════
       5.19 LANGUAGE
       ══════════════════════════════════════════════════════════════════ */
    function applyLanguage(lang) {
      state.lang = lang;
      const dict = Object.assign({}, I18N[lang] || I18N.en);
      dict.storeName = STORE.name || dict.storeName;
      mount.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        if (dict[key] != null) el.textContent = dict[key];
      });
      mount.querySelectorAll("[data-store-name]").forEach((el) => {
        el.textContent = STORE.name || "Peacock Store";
      });
      const langLabel = document.getElementById("langLabel");
      if (langLabel) langLabel.textContent = lang === "ar" ? "AR" : "EN";
      document.documentElement.setAttribute(
        "lang",
        lang === "ar" ? "ar" : "en",
      );
    }
    window.applyLanguage = applyLanguage;
    window.toggleLanguage = function () {
      const next = state.lang === "ar" ? "en" : "ar";
      applyLanguage(next);
      window.showAlert(
        "info",
        next === "ar"
          ? "Language switched to Arabic"
          : "Language switched to English",
      );
    };

    /* ══════════════════════════════════════════════════════════════════
       5.20 RENDER ALL VIEWS  (re-runnable → the injector stays the maestro)
       ══════════════════════════════════════════════════════════════════ */
    function renderAllViews() {
      mount.innerHTML =
        T.hub() +
        T.quickLookShell() +
        T.categories() +
        T.gallery() +
        T.stores() +
        T.favorites() +
        T.search() +
        T.notfications() +
        T.orders() +
        T.cart() +
        T.profile() +
        T.signin() +
        T.signup();

      /* promo banner (outside mount) */
      initPromoBanner();

      /* per-view renderers */
      renderCategories();
      renderGallery();
      renderFavorites();
      updateFavBadge();

      window.searchEngine = createSearchEngine({
        inputSelector: "#search-input",
        containerSelector: "#search-suggestions-area",
        debounceDelay: 180,
        initialMode: "products",
      });

      window.renderStores();

      if (window.__initHubTheme) window.__initHubTheme();
      if (window.__initHubChat) window.__initHubChat();
      if (window.__initCart) window.__initCart();

      /* pre-warm quick-look with the first product from the injector */
      const qlMount = document.getElementById("quickLookMount");
      const first = firstProduct();
      if (qlMount && first) {
        CURRENT_PRODUCT = first;
        qlMount.innerHTML = T.quickLookBody(first);
        initPaneDropdops(qlMount);
        bindQuickLook(first);
        window.switchPDTab("overview");
      }

      renderNotificationList();
      updateAlertBadge();
      renderNotifStrip();
      applyLanguage(state.lang);

      if (window.__stickyCtrl) window.__stickyCtrl.syncView();
    }

    /* ── first paint ── */
    renderAllViews();

    /* seed notifications coming from the injector */
    (SEED_NOTIFICATIONS || []).forEach((n) => {
      pushNotification(n.type || "info", n.message || "", n.ts);
    });
    renderNotifStrip();
    renderNotificationList();
    updateAlertBadge();

    /* ══════════════════════════════════════════════════════════════════
       5.21 PUBLIC API
       ══════════════════════════════════════════════════════════════════ */
    const api = {
      open: (name) => window.openStickyView(name),
      close: () => window.closeStickyCta(),
      show: () => window.showStickyCta(),
      hide: () => window.hideStickyCta(),
      alert: (type, msg) => window.showAlert(type, msg),
      setLanguage: applyLanguage,
      toggleLanguage: window.toggleLanguage,
      getState: () => state,
      openLightbox: () => window.openImageLightbox(),
      closeLightbox: () => window.closeImageLightbox(),
      openStores: () => window.openStores(),
      toggleFollowStore: (id) => window.toggleFollowStore(id),
      filterStoresByMainCategory: (id) => window.filterStoresByMainCategory(id),
      setStoreSort: (mode) => window.setStoreSort(mode),
      setTheme: (t) => window.applyTheme(t),
      toggleTheme: () => window.toggleTheme(),
      setGeminiKey: (key) => window.setGeminiKey(key),
      askAI: (prompt) => window.hubChatSend(prompt),

      /* ── maestro hook: switch the active store and re-render everything ── */
      setStore(storeId) {
        const injector = window.PEACOCK_DATA;
        if (!injector || typeof injector.setCurrentStore !== "function")
          return false;
        injector.setCurrentStore(storeId);
        if (!hydrateData()) return false;

        /* reset per-store UI state */
        state.favorites = new Set(Object.keys(PRODUCTS).slice(0, 2));
        state.followedStores = new Set(
          OTHER_STORES.slice(0, 2).map((s) => s.id),
        );
        state.galleryCategory = null;
        state.notifications = [];
        state.notificationSeq = 1;
        state.chatMessages = [];
        state.storeMainCategory = "all";
        state.storeSubCategory = "all";
        state.storeSortMode = "default";

        renderAllViews();
        (SEED_NOTIFICATIONS || []).forEach((n) =>
          pushNotification(n.type || "info", n.message || "", n.ts),
        );
        renderNotifStrip();
        renderNotificationList();
        updateAlertBadge();

        window.showAlert("info", "Switched to " + (STORE.name || storeId));
        return true;
      },

      /* ── maestro hook: re-read the injector without changing store ── */
      refresh() {
        if (!hydrateData()) return false;
        renderAllViews();
        (SEED_NOTIFICATIONS || []).forEach((n) =>
          pushNotification(n.type || "info", n.message || "", n.ts),
        );
        renderNotifStrip();
        renderNotificationList();
        updateAlertBadge();
        return true;
      },

      getData() {
        return {
          platform: PLATFORM,
          store: STORE,
          products: PRODUCTS,
          orders: ORDERS,
          addresses: SHIPPING_ADDRESSES,
          stores: OTHER_STORES,
          categories: MAIN_CATEGORIES,
        };
      },

      destroy() {
        const r = document.getElementById(ROOT_ID);
        if (r) r.remove();
        const s = document.getElementById(STYLE_ID);
        if (s) s.remove();
        const lb = document.getElementById("pdLightbox");
        if (lb) lb.remove();
        if (adTimer) clearInterval(adTimer);
        delete window.__stickyCtaApi;
      },
    };
    window.__stickyCtaApi = api;
    window.PeacockApp = api;

    return api;
  }

  /* Expose initializer */
  window.initStickyCTA = initStickyCTA;

  /* Auto-init on DOM ready (safe if called twice) */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initStickyCTA(), {
      once: true,
    });
  } else {
    initStickyCTA();
  }
})();
