/**
 * Matager Multi-Tenant Store & Viewer Registry
 *
 * Provides store-scoped resolution for:
 * - Dynamic Storefront (Branding, Catalog, FastCart, Bento 3D Gallery)
 * - Merchant Dashboard (Store KPIs, Orders, POS nodes, Settings)
 * - Cashier POS (Store terminals, inventory, walk-in sales)
 * - Viewer / Customer Identification (persistent viewerId, personalization)
 */

export interface StoreProduct {
  id: string;
  title: string;
  category: string;
  storeId: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  image: string;
  badge?: string;
  isBestSeller?: boolean;
  currency?: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  subdomain: string;
  tagline: string;
  taglineAr: string;
  city: string;
  country: string;
  currency: string;
  logo: string;
  banner: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  productsCount: number;
  followersCount: number;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  categories: string[];
  products: StoreProduct[];
}

export interface ViewerProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  isGuest: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM STORES REPOSITORY
// ═══════════════════════════════════════════════════════════════════════════

export const REGISTERED_STORES: Record<string, StoreProfile> = {
  peacock_store: {
    id: "peacock_store",
    name: "Peacock Store",
    subdomain: "peacock.matager.com",
    tagline: "Curated Luxury Fashion, Timepieces & Lifestyle",
    taglineAr: "منتجات عصرية فاخرة مختارة بعناية · فرع القاهرة الرئيسي",
    city: "Cairo",
    country: "Egypt",
    currency: "EGP",
    logo: "https://static.vecteezy.com/system/resources/previews/012/464/679/original/minimal-peacock-logo-vector.jpg",
    banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80&auto=format&fit=crop",
    verified: true,
    rating: 4.9,
    reviewsCount: 2340,
    productsCount: 1284,
    followersCount: 284,
    ownerName: "Mohamed Ahmed",
    ownerEmail: "mohamed@peacockstore.com",
    plan: "Matager-100",
    categories: ["All", "Footwear", "Apparel", "Accessories", "Limited"],
    products: [
      {
        id: "PEA_001",
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
        currency: "EGP",
      },
      {
        id: "PEA_002",
        title: "Adidas Ultraboost 22 Running",
        category: "Footwear",
        storeId: "peacock_store",
        storeName: "Peacock Store",
        price: 2200,
        originalPrice: 2800,
        stock: 42,
        image: "https://assets.adidas.com/images/w_1880,f_auto,q_auto/6f20fbc592f5410d83e7e3dd3e0926f0_9366/JS3268_01_00_standard.jpg",
        badge: "BEST SELLER",
        isBestSeller: true,
        currency: "EGP",
      },
      {
        id: "PEA_003",
        title: "Performance Crew Socks (3-Pack)",
        category: "Accessories",
        storeId: "peacock_store",
        storeName: "Peacock Store",
        price: 120,
        stock: 120,
        image: "https://resources.mandmdirect.com/Images/_default/a/d/3/ad30709_1_cloudzoom.jpg",
        badge: "ESSENTIAL",
        currency: "EGP",
      },
      {
        id: "PEA_004",
        title: "Peacock Limited Edition Chrono Watch",
        category: "Limited",
        storeId: "peacock_store",
        storeName: "Peacock Store",
        price: 6800,
        stock: 8,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        badge: "LIMITED",
        currency: "EGP",
      },
      {
        id: "PEA_005",
        title: "Handcrafted Italian Leather Tote",
        category: "Accessories",
        storeId: "peacock_store",
        storeName: "Peacock Store",
        price: 3400,
        stock: 14,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
        currency: "EGP",
      },
    ],
  },

  urban_kicks: {
    id: "urban_kicks",
    name: "Urban Kicks",
    subdomain: "urbankicks.matager.com",
    tagline: "Exclusive Sneaker Drops & Contemporary Streetwear",
    taglineAr: "أحدث صيحات الأحذية الرياضية والملابس الحضرية · الإسكندرية",
    city: "Alexandria",
    country: "Egypt",
    currency: "EGP",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    banner: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&q=80&auto=format&fit=crop",
    verified: true,
    rating: 4.85,
    reviewsCount: 890,
    productsCount: 640,
    followersCount: 512,
    ownerName: "Sara Khaled",
    ownerEmail: "sara@urbankicks.co",
    plan: "Matager-250",
    categories: ["All", "Sneakers", "Hoodies", "Streetwear", "Caps"],
    products: [
      {
        id: "URB_001",
        title: "Nike Air Max 270 (Triple Black)",
        category: "Sneakers",
        storeId: "urban_kicks",
        storeName: "Urban Kicks",
        price: 3850,
        originalPrice: 4500,
        discountPercent: 15,
        stock: 24,
        image: "https://assets.adidas.com/images/w_940,f_auto,q_auto/6044dd9dea9948f49524adaa00b9338b_9366/GZ1561_01_00_standard.jpg",
        badge: "HOT DROP",
        isBestSeller: true,
        currency: "EGP",
      },
      {
        id: "URB_002",
        title: "Retro Heavyweight Washed Hoodie",
        category: "Hoodies",
        storeId: "urban_kicks",
        storeName: "Urban Kicks",
        price: 1450,
        stock: 35,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
        badge: "NEW",
        currency: "EGP",
      },
      {
        id: "URB_003",
        title: "Tactical Multi-Pocket Cargo Pants",
        category: "Streetwear",
        storeId: "urban_kicks",
        storeName: "Urban Kicks",
        price: 1890,
        stock: 19,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
        currency: "EGP",
      },
      {
        id: "URB_004",
        title: "Urban Minimalist Snapback Cap",
        category: "Caps",
        storeId: "urban_kicks",
        storeName: "Urban Kicks",
        price: 450,
        stock: 60,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600",
        currency: "EGP",
      },
    ],
  },

  technest: {
    id: "technest",
    name: "TechNest Saudi",
    subdomain: "technest.matager.com",
    tagline: "Smart Home Gadgets, Audio & Pro Creator Tech",
    taglineAr: "أحدث الأجهزة الذكية وملحقات الصوت الاحترافية · الرياض",
    city: "Riyadh",
    country: "Saudi Arabia",
    currency: "SAR",
    logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
    banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
    verified: true,
    rating: 4.95,
    reviewsCount: 1450,
    productsCount: 380,
    followersCount: 890,
    ownerName: "Fahad Al-Otaibi",
    ownerEmail: "fahad@technest.sa",
    plan: "Matager-100",
    categories: ["All", "Audio", "Smart Home", "Accessories", "Gaming"],
    products: [
      {
        id: "TEC_001",
        title: "Acoustic Pro ANC Wireless Headphones",
        category: "Audio",
        storeId: "technest",
        storeName: "TechNest Saudi",
        price: 799,
        originalPrice: 999,
        discountPercent: 20,
        stock: 15,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        badge: "TOP RATED",
        isBestSeller: true,
        currency: "SAR",
      },
      {
        id: "TEC_002",
        title: "MagSafe 3-in-1 Fast Wireless Stand",
        category: "Accessories",
        storeId: "technest",
        storeName: "TechNest Saudi",
        price: 249,
        stock: 45,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
        badge: "FAST CHARGE",
        currency: "SAR",
      },
      {
        id: "TEC_003",
        title: "Smart Ambient RGB Lightbar Pair",
        category: "Smart Home",
        storeId: "technest",
        storeName: "TechNest Saudi",
        price: 320,
        stock: 22,
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600",
        currency: "SAR",
      },
    ],
  },

  bloom_boutique: {
    id: "bloom_boutique",
    name: "Bloom Boutique",
    subdomain: "bloom.matager.com",
    tagline: "Fine Jewelry, Handcrafted Gems & Haute Fragrances",
    taglineAr: "مجوهرات فاخرة وأحجار كريمة وعطور راقية · دبي",
    city: "Dubai",
    country: "UAE",
    currency: "AED",
    logo: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
    banner: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80&auto=format&fit=crop",
    verified: true,
    rating: 4.92,
    reviewsCount: 640,
    productsCount: 220,
    followersCount: 430,
    ownerName: "Layla Mansour",
    ownerEmail: "layla@bloomboutique.ae",
    plan: "Matager-50",
    categories: ["All", "Rings", "Earrings", "Necklaces", "Perfumes"],
    products: [
      {
        id: "BLM_001",
        title: "18K Gold Signature Solitaire Ring",
        category: "Rings",
        storeId: "bloom_boutique",
        storeName: "Bloom Boutique",
        price: 1850,
        stock: 6,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
        badge: "HANDMADE",
        isBestSeller: true,
        currency: "AED",
      },
      {
        id: "BLM_002",
        title: "Emerald Cut Crystal Chandelier Earrings",
        category: "Earrings",
        storeId: "bloom_boutique",
        storeName: "Bloom Boutique",
        price: 1200,
        stock: 12,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
        currency: "AED",
      },
      {
        id: "BLM_003",
        title: "L'Amour Oud & Amber Eau De Parfum",
        category: "Perfumes",
        storeId: "bloom_boutique",
        storeName: "Bloom Boutique",
        price: 650,
        stock: 28,
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
        badge: "EXCLUSIVE",
        currency: "AED",
      },
    ],
  },
};

// Aliases mapping IDs such as "ST-0001" or "peacock" to registry keys
const STORE_ALIASES: Record<string, string> = {
  "st-0001": "peacock_store",
  "peacock": "peacock_store",
  "peacock-store": "peacock_store",
  "st-0014": "urban_kicks",
  "urban": "urban_kicks",
  "urban-kicks": "urban_kicks",
  "st-0092": "technest",
  "technest-saudi": "technest",
  "st-0231": "bloom_boutique",
  "bloom": "bloom_boutique",
  "bloom-boutique": "bloom_boutique",
};

/**
 * Resolves a store profile by ID or alias with dynamic fallback for provisioned stores.
 */
export function getStoreProfile(requestedId?: string | null): StoreProfile {
  const normalized = (requestedId || "peacock_store").toLowerCase().trim();
  const canonicalId = STORE_ALIASES[normalized] || normalized;

  if (REGISTERED_STORES[canonicalId]) {
    return REGISTERED_STORES[canonicalId];
  }

  // Check localStorage if store was provisioned via Super Admin or Onboarding
  if (typeof window !== "undefined") {
    try {
      const platformStores = JSON.parse(localStorage.getItem("matager_platform_stores") || "[]");
      const found = platformStores.find((s: any) => s.id?.toLowerCase() === normalized || s.subdomain?.includes(normalized));
      if (found) {
        return {
          id: found.id,
          name: found.name,
          subdomain: found.subdomain,
          tagline: `${found.name} — Official Storefront`,
          taglineAr: `${found.name} — المتجر الإلكتروني الرسمي`,
          city: found.city || "Cairo",
          country: found.country || "Egypt",
          currency: found.country === "Saudi Arabia" ? "SAR" : found.country === "UAE" ? "AED" : "EGP",
          logo: "https://static.vecteezy.com/system/resources/previews/012/464/679/original/minimal-peacock-logo-vector.jpg",
          banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
          verified: found.status === "Active",
          rating: 4.8,
          reviewsCount: found.orders_30d || 50,
          productsCount: 10,
          followersCount: 120,
          ownerName: found.ownerName || "Merchant",
          ownerEmail: found.ownerEmail || "",
          plan: found.plan || "Matager-100",
          categories: ["All", "Featured", "Apparel", "Accessories"],
          products: [
            {
              id: `${found.id}_P1`,
              title: `${found.name} Signature Product`,
              category: "Featured",
              storeId: found.id,
              storeName: found.name,
              price: 950,
              stock: 30,
              image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
              badge: "NEW",
              currency: found.country === "Saudi Arabia" ? "SAR" : found.country === "UAE" ? "AED" : "EGP",
            },
          ],
        };
      }
    } catch (_) {}
  }

  // Dynamic fallback for any arbitrary storeId passed in the URL
  const titleCased = normalized.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: normalized,
    name: titleCased || "Peacock Store",
    subdomain: `${normalized}.matager.com`,
    tagline: `Welcome to ${titleCased || "Peacock Store"} on Matager Platform`,
    taglineAr: `أهلاً بكم في ${titleCased || "متجر بيكوك"} على منصة متاجر`,
    city: "Cairo",
    country: "Egypt",
    currency: "EGP",
    logo: "https://static.vecteezy.com/system/resources/previews/012/464/679/original/minimal-peacock-logo-vector.jpg",
    banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    verified: true,
    rating: 4.8,
    reviewsCount: 150,
    productsCount: 24,
    followersCount: 95,
    ownerName: "Merchant Owner",
    ownerEmail: `owner@${normalized}.com`,
    plan: "Matager-100",
    categories: ["All", "General"],
    products: [
      {
        id: `${normalized}_PROD_1`,
        title: `${titleCased} Premium Item`,
        category: "General",
        storeId: normalized,
        storeName: titleCased,
        price: 1250,
        stock: 50,
        image: "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg",
        badge: "VERIFIED",
        currency: "EGP",
      },
    ],
  };
}

/**
 * Returns all registered store profiles for multi-store switcher or comparison.
 */
export function getAllRegisteredStores(): StoreProfile[] {
  return Object.values(REGISTERED_STORES);
}

/**
 * Resolves the viewer ID from URL param or persistent local storage.
 */
export function resolveViewer(viewerIdFromUrl?: string | null): ViewerProfile {
  let viewerId = viewerIdFromUrl?.trim() || "";

  if (typeof window !== "undefined") {
    if (viewerId) {
      localStorage.setItem("matager_viewer_id", viewerId);
    } else {
      const stored = localStorage.getItem("matager_viewer_id");
      if (stored) {
        viewerId = stored;
      } else {
        viewerId = `usr_viewer_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem("matager_viewer_id", viewerId);
      }
    }
  } else if (!viewerId) {
    viewerId = "usr_viewer_guest";
  }

  return {
    id: viewerId,
    name: viewerId.startsWith("usr_viewer_") ? `Customer #${viewerId.slice(-4)}` : viewerId,
    phone: "+20 102 345 6789",
    address: "12 El-Nile Street, Zamalek, Cairo",
    isGuest: viewerId.includes("guest") || viewerId.startsWith("usr_viewer_"),
  };
}
