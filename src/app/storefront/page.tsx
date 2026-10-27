"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Store,
  Layers,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sun,
  Moon,
  Globe,
  X,
  ExternalLink,
  Laptop,
  CreditCard,
  Banknote,
  QrCode,
  Zap,
} from "lucide-react";
import { useTheme } from "@/theme/useTheme";
import { useDashboardLanguage } from "@/lib/i18n";
import { APP_ROUTES } from "@/config/routes";

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
  sku?: string;
  size?: string;
  color?: string;
}

interface StoreGroup {
  name: string;
  items: CartItem[];
  subtotal: number;
}

type UniversalCart = Record<string, StoreGroup>;

interface Product {
  id: string;
  title: string;
  category: "Footwear" | "Apparel" | "Accessories" | "Limited";
  storeId: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  image: string;
  badge?: string;
  isBestSeller?: boolean;
}

const PEACOCK_PRODUCTS: Product[] = [
  {
    id: "PROD_001",
    title: "Adidas Classic Graphic Tee",
    category: "Apparel",
    storeId: "peacock_store",
    storeName: "Peacock Store",
    price: 4500,
    originalPrice: 9000,
    discountPercent: 50,
    stock: 18,
    image: "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg",
    badge: "50% OFF",
  },
  {
    id: "PROD_002",
    title: "Adidas Ultraboost 22 Running",
    category: "Footwear",
    storeId: "peacock_store",
    storeName: "Peacock Store",
    price: 2200,
    stock: 42,
    image: "https://assets.adidas.com/images/w_1880,f_auto,q_auto/6f20fbc592f5410d83e7e3dd3e0926f0_9366/JS3268_01_00_standard.jpg",
    badge: "BEST SELLER",
    isBestSeller: true,
  },
  {
    id: "PROD_003",
    title: "Performance Crew Socks (3-Pack)",
    category: "Accessories",
    storeId: "peacock_store",
    storeName: "Peacock Store",
    price: 120,
    stock: 120,
    image: "https://resources.mandmdirect.com/Images/_default/a/d/3/ad30709_1_cloudzoom.jpg",
    badge: "ESSENTIAL",
  },
  {
    id: "PROD_004",
    title: "Peacock Limited Edition Chrono Watch",
    category: "Limited",
    storeId: "peacock_store",
    storeName: "Peacock Store",
    price: 6800,
    stock: 8,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    badge: "LIMITED",
  },
  // Store B Showcase item to demonstrate multi-store grouping in action
  {
    id: "nk-270-blk",
    title: "Nike Air Max 270 (Black Edition)",
    category: "Footwear",
    storeId: "nike_studio_cairo",
    storeName: "Nike Studio Cairo",
    price: 850,
    originalPrice: 1250,
    discountPercent: 32,
    stock: 84,
    image: "https://assets.adidas.com/images/w_940,f_auto,q_auto/6044dd9dea9948f49524adaa00b9338b_9366/GZ1561_01_00_standard.jpg",
    badge: "PARTNER STORE",
  },
];

const GALLERY_TILES = [
  {
    id: "GAL_01",
    title: "EARRINGS COLLECTION",
    subtitle: "Handcrafted Luxury",
    price: 1850,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
    className: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    id: "GAL_02",
    title: "SIGNATURE RINGS",
    subtitle: "18K Solid Gold Finish",
    price: 2400,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    className: "col-span-1 row-span-2",
  },
  {
    id: "GAL_03",
    title: "NECKLACES & PENDANTS",
    subtitle: "Hand-set Crystal",
    price: 3200,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
    className: "col-span-1 md:col-span-2 row-span-1",
  },
  {
    id: "GAL_04",
    title: "CHRONO WATCHES",
    subtitle: "Automatic Movement",
    price: 6800,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
    className: "col-span-1 row-span-1",
  },
  {
    id: "GAL_05",
    title: "BRACELETS",
    subtitle: "Minimalist Modern",
    price: 950,
    image: "https://images.unsplash.com/photo-1611591475836-53d9e03d42e2?w=800",
    className: "col-span-1 row-span-1",
  },
];

export default function StorefrontPage() {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useDashboardLanguage();
  const isAr = locale === "ar";

  // Presentation Mode: false = FastCart mode, true = 3D Bento Gallery mode
  const [isGalleryActive, setIsGalleryActive] = useState(false);

  // Floating Antigravity Dock State
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [activeDockTab, setActiveDockTab] = useState<"cart" | "checkout" | "orders">("cart");

  // Multi-Store Cart state
  const [universalCart, setUniversalCart] = useState<UniversalCart>({});
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Checkout form state
  const [customerName, setCustomerName] = useState("Mohamed Al-Sayed");
  const [customerPhone, setCustomerPhone] = useState("+20 102 345 6789");
  const [customerAddress, setCustomerAddress] = useState("12 El-Nile Street, Zamalek, Cairo");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio effect
  const playSound = (type: "pop" | "cash" | "switch") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === "pop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === "cash") {
        osc.type = "triangle";
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);
        });
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(550, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (_) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load cart from localStorage
  const loadCartFromStorage = () => {
    try {
      const data = localStorage.getItem("matager_universal_cart");
      if (data) {
        setUniversalCart(JSON.parse(data));
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadCartFromStorage();

    // Listen to storage and cross-window events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "matager_universal_cart") {
        loadCartFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("matager_pos_sync");
        channel.onmessage = (msg) => {
          if (msg.data?.type === "CART_UPDATED") {
            loadCartFromStorage();
          }
        };
      }
    } catch (_) {}

    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.close();
    };
  }, []);

  const saveCart = (nextCart: UniversalCart) => {
    setUniversalCart(nextCart);
    try {
      localStorage.setItem("matager_universal_cart", JSON.stringify(nextCart));
    } catch (_) {}

    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("matager_pos_sync");
        bc.postMessage({ type: "CART_UPDATED" });
        bc.close();
      }
    } catch (_) {}
  };

  // Cart operations
  const handleAddToCart = (product: Product | { id: string; title: string; price: number; image: string; storeId?: string; storeName?: string }) => {
    playSound("pop");
    const storeId = product.storeId || "peacock_store";
    const storeName = product.storeName || "Peacock Store";

    const nextCart = { ...universalCart };
    if (!nextCart[storeId]) {
      nextCart[storeId] = {
        name: storeName,
        items: [],
        subtotal: 0,
      };
    }

    const existing = nextCart[storeId].items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      nextCart[storeId].items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }

    // Recalculate subtotal
    nextCart[storeId].subtotal = nextCart[storeId].items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    saveCart(nextCart);
    showToast(`${product.title} ${isAr ? "تمت إضافته إلى السلة الموحدة" : "added to Universal FastCart"}`);
    setIsDockOpen(true);
    setActiveDockTab("cart");
  };

  const handleUpdateQty = (storeId: string, productId: string, delta: number) => {
    playSound("pop");
    const nextCart = { ...universalCart };
    if (!nextCart[storeId]) return;

    const target = nextCart[storeId].items.find((i) => i.id === productId);
    if (!target) return;

    target.qty += delta;
    if (target.qty <= 0) {
      nextCart[storeId].items = nextCart[storeId].items.filter((i) => i.id !== productId);
      if (nextCart[storeId].items.length === 0) {
        delete nextCart[storeId];
      }
    }

    if (nextCart[storeId]) {
      nextCart[storeId].subtotal = nextCart[storeId].items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }

    saveCart(nextCart);
  };

  const handleRemoveItem = (storeId: string, productId: string) => {
    playSound("switch");
    const nextCart = { ...universalCart };
    if (!nextCart[storeId]) return;

    nextCart[storeId].items = nextCart[storeId].items.filter((i) => i.id !== productId);
    if (nextCart[storeId].items.length === 0) {
      delete nextCart[storeId];
    } else {
      nextCart[storeId].subtotal = nextCart[storeId].items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }
    saveCart(nextCart);
  };

  // Grand totals
  const totalItemsCount = useMemo(() => {
    return Object.values(universalCart).reduce(
      (acc, s) => acc + s.items.reduce((sum, i) => sum + i.qty, 0),
      0
    );
  }, [universalCart]);

  const grandTotal = useMemo(() => {
    return Object.values(universalCart).reduce((acc, s) => acc + s.subtotal, 0);
  }, [universalCart]);

  // Universal Checkout submission
  const handlePlaceOrder = () => {
    if (totalItemsCount === 0) return;
    setIsSubmitting(true);
    playSound("cash");

    setTimeout(() => {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const allStores = Object.keys(universalCart);

      const unifiedOrder = {
        id: orderId,
        date: new Date().toISOString(),
        status: "Completed",
        channel: "FastCart-Online",
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: customerAddress,
        payment_method: paymentMethod,
        amount: grandTotal,
        items_count: totalItemsCount,
        stores: allStores.map((id) => ({
          storeId: id,
          name: universalCart[id].name,
          items: universalCart[id].items,
          subtotal: universalCart[id].subtotal,
        })),
      };

      // 1. Save to local storage
      try {
        const existing = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
        existing.unshift(unifiedOrder);
        localStorage.setItem("matager_local_orders", JSON.stringify(existing.slice(0, 50)));
      } catch (_) {}

      // 2. Clear cart
      saveCart({});

      // 3. Dispatch Live Events to POS Cashier & Merchant Dashboard
      window.dispatchEvent(new CustomEvent("matager:new_order", { detail: unifiedOrder }));
      window.dispatchEvent(new CustomEvent("matager:storefront_order", { detail: unifiedOrder }));

      // 4. Cross-tab BroadcastChannel to notify active POS terminals
      try {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("matager_pos_sync");
          bc.postMessage({
            type: "ONLINE_FASTCART_ORDER",
            order: unifiedOrder,
            timestamp: Date.now(),
          });
          bc.close();
        }
      } catch (_) {}

      setIsSubmitting(false);
      setPlacedOrderInfo(unifiedOrder);
      setActiveDockTab("orders");
      showToast(isAr ? `تم تأكيد الطلب بنجاح ${orderId} ومزامنته مع نقاط البيع!` : `Order ${orderId} placed & synced with POS Cashier!`);
    }, 1100);
  };

  // Toggle Gallery Presentation Mode
  const handleTogglePresentation = () => {
    playSound("switch");
    setIsGalleryActive((prev) => !prev);
    showToast(!isGalleryActive ? (isAr ? "تم الانتقال إلى معرض المنتجات ثلاثي الأبعاد" : "Switched to 3D Bento Gallery Mode") : (isAr ? "تم الانتقال إلى وضع السلة السريعة" : "Switched to FastCart Mode"));
  };

  const filteredProducts = useMemo(() => {
    if (categoryFilter === "All") return PEACOCK_PRODUCTS;
    return PEACOCK_PRODUCTS.filter((p) => p.category === categoryFilter);
  }, [categoryFilter]);

  return (
    <div
      className={`min-h-screen text-[var(--color-text-primary)] transition-colors duration-300 font-sans ${
        theme === "dark" ? "bg-[#060608]" : "bg-slate-50"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ══════════════════ FLOATING TOAST NOTIFICATION ══════════════════ */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════ TOP STOREFRONT SYSTEM BAR ══════════════════ */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[var(--color-canvas)]/80 border-b border-[var(--color-border-subtle)] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={APP_ROUTES.dashboard}
            className="flex items-center gap-2 group"
            title="Return to Merchant Admin Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0479E8] to-[#0083FE] flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
              M
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold tracking-tight block leading-none">Matager OS</span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">Peacock Storefront</span>
            </div>
          </Link>

          <span className="w-px h-4 bg-white/10 hidden sm:block"></span>

          {/* POS Sync Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isAr ? "متزامن مع نقاط البيع" : "POS Cashier Synced"}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <button
            type="button"
            onClick={handleTogglePresentation}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              isGalleryActive
                ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/25"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-[var(--color-text-primary)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isGalleryActive ? (isAr ? "وضع السلة" : "FastCart Mode") : (isAr ? "معرض الصور" : "3D Gallery")}</span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Toggle Arabic / English"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">{isAr ? "EN" : "عربي"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xs transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-500" />
            )}
          </button>

          {/* Cashier Link */}
          <Link
            href={APP_ROUTES.cashier}
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all hidden md:flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5" />
            <span>POS Register</span>
          </Link>
        </div>
      </header>

      {/* ══════════════════ PARALLAX STOREFRONT STAGE ══════════════════ */}
      <main
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 transition-all duration-700 ease-out"
        style={{
          transform: isGalleryActive ? "scale(0.95) translateZ(-50px)" : "scale(1) translateZ(0)",
          filter: isGalleryActive ? "blur(4px) brightness(0.7)" : "none",
          pointerEvents: isGalleryActive ? "none" : "auto",
        }}
      >
        {/* Store Hero Banner */}
        <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
          <div className="h-48 sm:h-64 w-full overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80&auto=format&fit=crop"
              alt="Peacock Store Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          </div>

          <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 bg-neutral-900 shadow-xl shrink-0">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/012/464/679/original/minimal-peacock-logo-vector.jpg"
                  alt="Peacock Store Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Peacock Store</h1>
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]" title="Verified Merchant">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  {isAr ? "منتجات عصرية فاخرة مختارة بعناية · فرع القاهرة الرئيسي" : "Premium products curated for modern lifestyle · Cairo Flagship"}
                </p>
                <div className="flex items-center gap-4 text-xs pt-1 font-mono">
                  <span><strong className="text-white">1,284</strong> <span className="text-white/50">{isAr ? "منتج" : "products"}</span></span>
                  <span><strong className="text-white">284</strong> <span className="text-white/50">{isAr ? "متابع" : "followers"}</span></span>
                  <span className="text-amber-400 font-bold">4.9 ★ <span className="text-white/50">(2.3k)</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Partner Store Add Demo Button */}
              <button
                type="button"
                onClick={() => handleAddToCart(PEACOCK_PRODUCTS[4])}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                title="Simulate cross-store add from Nike Studio Cairo"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة من متجر آخر (نايكي)" : "Add From Store B (Nike)"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDockOpen(true);
                  setActiveDockTab("cart");
                }}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isAr ? `السلة (${totalItemsCount})` : `FastCart (${totalItemsCount})`}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════ CATEGORY SELECTOR & CATALOG ═══════════ */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {["All", "Footwear", "Apparel", "Accessories", "Limited"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === cat
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "bg-white/5 hover:bg-white/10 text-[var(--color-text-secondary)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-[var(--color-text-muted)] font-mono">
              {filteredProducts.length} {isAr ? "منتجات معروضة" : "Products Live"}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group relative rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black/60 mb-3">
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600/90 text-white text-[9px] font-black uppercase tracking-wider">
                      {prod.badge}
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-mono">
                    {prod.stock} in stock
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">
                    {prod.storeName} · {prod.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] mt-1 line-clamp-1 leading-snug">
                    {prod.title}
                  </h3>

                  <div className="flex items-baseline justify-between mt-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black font-mono text-[var(--color-text-primary)]">
                        {prod.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">EGP</span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-[var(--color-text-muted)] line-through">
                          {prod.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Free Express</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--color-text-primary)] text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? "إضافة" : "Add"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(prod);
                      setActiveDockTab("checkout");
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isAr ? "شراء سريع" : "Fast Buy"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ══════════════════ FULLSCREEN BENTO 3D GALLERY OVERLAY ══════════════════ */}
      {isGalleryActive && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/95 backdrop-blur-3xl p-4 sm:p-8 flex flex-col items-center animate-in fade-in duration-500">
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="text-xs uppercase font-mono text-blue-400 font-bold">3D Bento Presentation Mode</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Peacock Fine Collections</h2>
            </div>
            <button
              type="button"
              onClick={handleTogglePresentation}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/10"
            >
              <X className="w-4 h-4" />
              <span>{isAr ? "العودة للسلة" : "Return to FastCart"}</span>
            </button>
          </div>

          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {GALLERY_TILES.map((tile) => (
              <div
                key={tile.id}
                onClick={() =>
                  handleAddToCart({
                    id: tile.id,
                    title: tile.title,
                    price: tile.price,
                    image: tile.image,
                    storeId: "peacock_store",
                    storeName: "Peacock Store",
                  })
                }
                className={`group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/15 cursor-pointer min-h-[260px] ${tile.className}`}
              >
                <img
                  src={tile.image}
                  alt={tile.title}
                  className="w-full h-full object-cover group-hover:scale-105 group-hover:blur-[2px] transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">{tile.subtitle}</span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">{tile.title}</h3>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-sm font-black text-white font-mono">EGP {tile.price.toLocaleString()}</span>
                    <span className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add to FastCart
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ FLOATING ANTIGRAVITY MULTI-STORE DOCK ══════════════════ */}
      {/* Dimmed backdrop when dock is open */}
      <div
        onClick={() => setIsDockOpen(false)}
        className={`fixed inset-0 z-[9980] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isDockOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed left-1/2 z-[9990] w-[min(430px,calc(100vw-28px))] max-h-[86vh] rounded-[30px] border border-[var(--glass-border,rgba(255,255,255,0.12))] overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85)] ${
          theme === "dark"
            ? "bg-[#141416]/90 backdrop-blur-2xl text-white"
            : "bg-white/95 backdrop-blur-2xl text-slate-900 border-black/10 shadow-2xl"
        }`}
        style={{
          bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
          transform: isDockOpen
            ? isGalleryActive
              ? "translate3d(-50%, 0, 80px) scale(1.03)"
              : "translate3d(-50%, 0, 0) scale(1)"
            : "translate3d(-50%, calc(100% - 64px), 0) scale(0.98)",
        }}
      >
        {/* Dock Header */}
        <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between text-xs font-bold shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider">
              Matager OS
            </span>
            <span className="truncate">
              {isAr ? "السلة الموحدة لجميع المتاجر" : "Universal Multi-Store Dock"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[11px]"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-blue-500" />}
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              className="px-1.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-mono font-bold"
            >
              {isAr ? "EN" : "عربي"}
            </button>
            <button
              type="button"
              onClick={() => setIsDockOpen(!isDockOpen)}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[11px]"
            >
              {isDockOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dock Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {/* Sub-tabs inside dock */}
          <div className="flex items-center gap-1 border-b border-white/10 pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveDockTab("cart")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeDockTab === "cart"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {isAr ? "السلة الموحدة" : "Multi-Store Cart"} ({totalItemsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveDockTab("checkout")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeDockTab === "checkout"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {isAr ? "إتمام الشراء" : "Checkout"}
            </button>
            <button
              type="button"
              onClick={() => setActiveDockTab("orders")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeDockTab === "orders"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {isAr ? "الطلبات" : "Orders"}
            </button>
          </div>

          {/* TAB 1: CART (GROUPED BY STORE) */}
          {activeDockTab === "cart" && (
            <div>
              {Object.keys(universalCart).length === 0 ? (
                <div className="py-10 text-center text-white/40 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm font-bold text-white">Your Universal Cart is empty</p>
                  <p className="text-xs">Browse products above or simulate a cross-store purchase to experience zero-gravity checkout.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(universalCart).map(([storeId, store]) => (
                    <div
                      key={storeId}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                    >
                      {/* Store Header */}
                      <div className="px-3.5 py-2.5 bg-black/30 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-bold text-white">{store.name}</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                            {store.items.length} items
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-400">
                          EGP {store.subtotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Store Items */}
                      <div className="p-3 divide-y divide-white/5">
                        {store.items.map((item) => (
                          <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover bg-black/60 shrink-0 border border-white/10"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{item.title}</p>
                                <p className="text-[10px] text-white/50 font-mono">EGP {item.price.toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(storeId, item.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-mono font-bold px-1.5 text-white">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(storeId, item.id, 1)}
                                  className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(storeId, item.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Summary & Checkout CTA */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 mt-4">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>{isAr ? "المتاجر المشمولة" : "Stores in Order"}</span>
                      <span className="font-bold text-white">{Object.keys(universalCart).length}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                      <span>{isAr ? "الإجمالي الكلي" : "Grand Total"}</span>
                      <span className="font-mono text-blue-400">EGP {grandTotal.toLocaleString()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveDockTab("checkout")}
                      className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      <span>{isAr ? "إتمام الشراء لجميع المتاجر" : "Checkout All Stores"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHECKOUT VIEW */}
          {activeDockTab === "checkout" && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  {isAr ? "الاسم بالكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  {isAr ? "عنوان التوصيل" : "Delivery Address (Cairo / Egypt)"}
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  {isAr ? "طريقة الدفع" : "Payment Method"}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Visa / MasterCard">Visa / MasterCard</option>
                  <option value="Mada / Apple Pay">Mada / Apple Pay</option>
                  <option value="Mobile Wallet">Vodafone Cash / Meeza</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-white/50 block">Amount Due</span>
                  <span className="text-sm font-black font-mono text-blue-400">EGP {grandTotal.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold block flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Encrypted
                  </span>
                  <span className="text-[9px] text-white/40">Syncing with POS Cashier</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting || totalItemsCount === 0}
                onClick={handlePlaceOrder}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Unified Checkout...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>{isAr ? "تأكيد الطلب والدفع" : `Confirm & Pay (EGP ${grandTotal.toLocaleString()})`}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: ORDERS VIEW */}
          {activeDockTab === "orders" && (
            <div className="space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                {isAr ? "سجل الطلبات المتزامنة" : "Synced Orders History"}
              </h4>
              {placedOrderInfo && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-300">{placedOrderInfo.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                      Just Placed
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    {placedOrderInfo.items_count} items across {placedOrderInfo.stores?.length || 1} stores
                  </p>
                  <p className="text-[11px] font-mono font-bold text-emerald-400">
                    EGP {placedOrderInfo.amount.toLocaleString()}
                  </p>
                  <div className="pt-1 text-[9px] text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Real-time POS Cashier Terminal Notified</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-white/40 pt-2 text-center">
                All FastCart orders are automatically routed to the in-store Cashier Terminal nodes.
              </p>
            </div>
          )}
        </div>

        {/* Dock Bottom Bar */}
        <div className="h-16 px-3 border-t border-white/10 flex items-center gap-2 shrink-0 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setIsDockOpen(!isDockOpen)}
            className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0"
            title="Expand / Collapse Dock"
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isDockOpen) setIsDockOpen(true);
              setActiveDockTab(activeDockTab === "cart" ? "checkout" : "cart");
            }}
            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
          >
            <span>
              {isDockOpen
                ? activeDockTab === "checkout"
                  ? isAr
                    ? "العودة للسلة"
                    : "Back to Cart"
                  : isAr
                  ? `إتمام الشراء (${totalItemsCount})`
                  : `Checkout (${totalItemsCount}) · EGP ${grandTotal.toLocaleString()}`
                : isAr
                ? `عرض السلة (${totalItemsCount})`
                : `Universal FastCart (${totalItemsCount})`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </div>
  );
}
