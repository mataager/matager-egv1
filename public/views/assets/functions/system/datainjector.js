/* =========================================================================
   PEACOCK PLATFORM — DATA INJECTOR (v1.0)
   External data source for doc.js (Sticky CTA).

   Publishes: window.PEACOCK_DATA

   Shape:
     PEACOCK_DATA
     ├── platform            meta, currency, defaults
     ├── categoryTree        main + subcategories (cascade)
     ├── stores              { [storeId]: Store }
     │     └── Store
     │          ├── id, slug, name, verified, rating, reviewCount, followers
     │          ├── logo, banner, mainCategory, subcategories[]
     │          ├── location, contact, details, policies
     │          ├── shipping { methods[] }
     │          ├── pickup   { available, branches[] }
     │          ├── coupons  [ { code, type, value, minOrder, ... } ]
     │          ├── addresses[ ... ]
     │          ├── orders   [ ... ]
     │          └── products { [productId]: Product }
     │                └── Product
     │                     ├── id, sku, title, brand, category, subcategory
     │                     ├── price, oldPrice, discount, currency
     │                     ├── rating, reviewCount, stock, stockCount
     │                     ├── uploadedDate, tags[]
     │                     ├── images[]              master gallery
     │                     ├── colors[]  { value, hex, images[], available }
     │                     ├── sizes[]
     │                     ├── variants[]            colors × sizes matrix
     │                     │   { id, sku, color, colorHex, size, price,
     │                     │     oldPrice, stock, status, images[], barcode }
     │                     ├── specs, model, description
     │                     └── delivery[], reviews[]

     API:
       getStore(id)                 → Store
       getProduct(storeId, prodId)  → Product
       getCurrentStore()            → Store
       getCurrentProduct()          → Product
       setCurrentStore(id)          → Store
       setCurrentProduct(id)        → Product
       buildVariants(base, colors, sizes, opts)
       toLegacy()                   → shape consumed by doc.js
   ========================================================================= */
(function () {
  "use strict";

  /* ─── 1. Platform ──────────────────────────────────────────────────── */
  const PLATFORM = {
    name: "Matager Peacock",
    legalName: "Matager Commerce LLC",
    platform: "Matager",
    storeNode: "Matager Peacock",
    version: "4.2.0",
    currency: { code: "EGP", symbol: "EGP", locale: "en-EG" },
    locale: "en",
    direction: "ltr",
    supportEmail: "support@peacock.store",
    supportPhone: "+20 100 000 0000",
    defaultStoreId: "store-adidas",
    defaultProductId: "PROD_001",
    social: { facebook: "#", instagram: "#", tiktok: "#", x: "#" },
  };

  const CURRENCY = PLATFORM.currency.code;

  /* ─── 2. Category tree ────────────────────────────────────────────── */
  const CATEGORY_TREE = {
    all: { id: "all", name: "All categories", desc: "", icon: "bi-grid" },
    apparel: {
      id: "apparel",
      name: "Apparel & Accessories",
      desc: "Clothing, shoes, watches, and jewelry.",
      icon: "bi-bag",
      subs: [
        { id: "footwear", name: "Footwear", icon: "bi-bag" },
        { id: "tops", name: "Tops", icon: "bi-bag" },
        { id: "bottoms", name: "Bottoms", icon: "bi-bag" },
        { id: "outerwear", name: "Outerwear", icon: "bi-bag" },
        { id: "accessories", name: "Accessories", icon: "bi-watch" },
      ],
    },
    home: {
      id: "home",
      name: "Home & Garden",
      desc: "Décor, kitchenware, and furniture.",
      icon: "bi-house",
      subs: [
        { id: "furniture", name: "Furniture", icon: "bi-lamp" },
        { id: "decor", name: "Décor", icon: "bi-flower2" },
        { id: "kitchenware", name: "Kitchenware", icon: "bi-cup-hot" },
      ],
    },
    beauty: {
      id: "beauty",
      name: "Beauty & Wellness",
      desc: "Organic skincare and personal care.",
      icon: "bi-flower1",
      subs: [
        { id: "skincare", name: "Skincare", icon: "bi-droplet" },
        { id: "bath", name: "Bath & Body", icon: "bi-droplet-half" },
        { id: "makeup", name: "Makeup", icon: "bi-brush" },
      ],
    },
    electronics: {
      id: "electronics",
      name: "Electronics & Gadgets",
      desc: "Latest devices and smart gear.",
      icon: "bi-cpu",
      subs: [
        { id: "phones", name: "Phones", icon: "bi-phone" },
        { id: "laptops", name: "Laptops", icon: "bi-laptop" },
        { id: "audio", name: "Audio", icon: "bi-headphones" },
        { id: "tvs", name: "TVs", icon: "bi-tv" },
      ],
    },
  };

  /* ─── 3. Builders ──────────────────────────────────────────────────── */
  function buildVariants(base, colors, sizes, opts) {
    const seed = (opts && opts.seed) || 1;
    const colorList =
      colors && colors.length
        ? colors
        : [{ value: "Default", hex: "#8a8a8a", images: base.images }];
    const sizeList = sizes && sizes.length ? sizes : ["One Size"];

    const out = [];
    colorList.forEach((c, ci) => {
      sizeList.forEach((s, si) => {
        const n = ((ci + 1) * 7 + (si + 3) * 5 + seed * 3) % 18;
        const stock = n;
        const status = stock === 0 ? "out" : stock <= 3 ? "low" : "in";
        const imgs =
          c.images && c.images.length ? c.images.slice() : base.images.slice();

        out.push({
          id:
            base.id +
            "-" +
            String(c.value).replace(/\s+/g, "").toUpperCase() +
            "-" +
            s,
          sku:
            base.sku +
            "-" +
            String(c.value).slice(0, 3).toUpperCase() +
            "-" +
            s,
          color: c.value,
          colorHex: c.hex || null,
          size: s,
          price: base.price,
          oldPrice: base.oldPrice,
          currency: CURRENCY,
          stock,
          status,
          images: imgs,
          barcode: "PK-" + base.sku + "-" + (ci + 1) + (si + 1),
        });
      });
    });
    return out;
  }

  function defineProduct(cfg) {
    const base = Object.assign(
      {
        currency: CURRENCY,
        oldPrice: null,
        discount: 0,
        rating: 4.5,
        reviewCount: 0,
        stock: "in",
        stockCount: 0,
        tags: [],
        images: [],
        colors: [],
        sizes: ["One Size"],
        delivery: [
          {
            title: "Free Express",
            detail: 'Arrives <span class="pd-strong">in 2-4 days</span>',
            icon: "bi-box",
          },
          { title: "Standard", detail: "Tracking provided", icon: "bi-clock" },
        ],
        reviews: [],
      },
      cfg,
    );

    if (!base.variants || !base.variants.length) {
      base.variants = buildVariants(base, base.colors, base.sizes);
    }
    base.stockCount = base.variants.reduce((a, v) => a + (v.stock || 0), 0);
    base.stock =
      base.stockCount === 0 ? "out" : base.stockCount <= 5 ? "low" : "in";
    return base;
  }

  /* ─── 4. Stores ────────────────────────────────────────────────────── */
  const STORES = {};

  /* ══════════ STORE · Adidas Official ══════════ */
  STORES["store-adidas"] = {
    id: "store-adidas",
    slug: "adidas-official",
    name: "Adidas Official",
    verified: true,
    rating: 4.9,
    reviewCount: 12840,
    followers: 23400,
    logo: { text: "AD", gradient: "linear-gradient(135deg,#3b82f6,#8b5cf6)" },
    banner: null,
    mainCategory: "apparel",
    subcategories: ["Footwear", "Tops", "Outerwear", "Accessories"],
    location: {
      city: "Cairo",
      country: "Egypt",
      address: "Cairo Festival City, New Cairo",
    },
    contact: {
      phone: "+20 100 111 2222",
      whatsapp: "+20 100 111 2222",
      email: "care@adidas.eg",
    },
    details: {
      description:
        "The official Adidas store on Peacock — sportswear, sneakers, and lifestyle essentials.",
      since: 2014,
      languages: ["en", "ar"],
    },
    policies: {
      returns: "Free 30-day returns",
      shipping: "Free express on orders over EGP 1,500",
      warranty: "12 months",
    },
    shipping: {
      methods: [
        { id: "express", name: "Express", cost: 50, eta: "2-3 days" },
        { id: "standard", name: "Standard", cost: 25, eta: "4-6 days" },
      ],
    },
    pickup: {
      available: true,
      branches: [
        {
          id: "br-adidas-1",
          name: "Cairo Downtown",
          line: "123 Nile Street, Downtown, Cairo",
          hours: "Open daily · 10:00 AM — 10:00 PM",
          phone: "+20 100 987 6543",
        },
      ],
    },
    coupons: [
      {
        code: "SAVE10",
        type: "percent",
        value: 10,
        minOrder: 0,
        maxDiscount: 500,
        desc: "10% off sitewide",
        validUntil: "2026-12-31",
      },
      {
        code: "FREESHIP",
        type: "shipping",
        value: 0,
        minOrder: 0,
        desc: "Free shipping",
        validUntil: "2026-12-31",
      },
      {
        code: "WELCOME15",
        type: "percent",
        value: 15,
        minOrder: 1000,
        maxDiscount: 800,
        desc: "15% off first order",
        validUntil: "2026-12-31",
      },
    ],
    addresses: [
      {
        id: "addr-1",
        label: "Home",
        tag: "Default",
        icon: "bi-house-door",
        line: "12 Nile Street, Apt 4B, Zamalek, Cairo",
        phone: "+20 100 123 4567",
        cost: 50,
      },
      {
        id: "addr-2",
        label: "Work",
        tag: null,
        icon: "bi-briefcase",
        line: "45 Smart Village, Building B7, 6th of October, Giza",
        phone: "+20 100 123 4567",
        cost: 50,
      },
    ],
    orders: [
      {
        id: "ORD-8822",
        status: "Pending",
        statusClass: "is-pending",
        title: "Adidas Classic T-Shirt + 1 item",
        date: "July 04, 2026",
        total: "EGP 5,200",
        stage: 0,
        stageLabel: "Awaiting confirmation",
        courier: "Aramex (Express)",
        destination: "Giza, Al Haram St.",
        payment: "Cash on Delivery",
        items: [
          {
            name: "Adidas Classic T-Shirt",
            meta: "Size: M · Blue",
            qty: 1,
            price: "EGP 1,290",
            image:
              "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg",
          },
        ],
      },
      {
        id: "ORD-8823",
        status: "Shipped",
        statusClass: "is-shipped",
        title: "Adidas Essentials Hoodie",
        date: "July 02, 2026",
        total: "EGP 2,100",
        stage: 2,
        stageLabel: "In transit",
        courier: "Bosta",
        destination: "Cairo, Zamalek",
        payment: "Credit Card",
        items: [
          {
            name: "Adidas Essentials Hoodie",
            meta: "Size: L · Black",
            qty: 1,
            price: "EGP 2,100",
            image:
              "https://assets.adidas.com/images/w_1880,f_auto,q_auto/1f0135cfef624e779735b6390f38c98b_9366/KC6611_HM5.jpg",
          },
        ],
      },
    ],
    products: {},
  };

  STORES["store-adidas"].products["PROD_001"] = defineProduct({
    id: "PROD_001",
    sku: "KC6611",
    title: "Adidas Classic T-Shirt",
    brand: "Adidas",
    category: "Tops",
    subcategory: "T-Shirts",
    price: 1290,
    oldPrice: 1690,
    discount: 24,
    rating: 4.8,
    reviewCount: 2300,
    uploadedDate: "2026-05-02T09:00:00Z",
    tags: ["classic", "cotton", "unisex"],
    images: [
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg",
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/1f0135cfef624e779735b6390f38c98b_9366/KC6611_HM5.jpg",
    ],
    colors: [
      { value: "Black", hex: "#111111" },
      { value: "White", hex: "#ffffff" },
      { value: "Red", hex: "#ef4444" },
      { value: "Blue", hex: "#3b82f6" },
      { value: "Navy", hex: "#172554" },
      { value: "Gray", hex: "#9ca3af" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    specs:
      'Premium athletic slim-fit. <span class="pd-strong">100% sustainably sourced</span> organic cotton.',
    model: '<span class="pd-strong">• Model:</span> 180cm, size M',
    description:
      "A versatile everyday tee built for movement. Soft breathable cotton with reinforced stitching and a clean silhouette.",
    reviews: [
      {
        author: "Ahmed M.",
        initials: "AM",
        verified: true,
        date: "12 May 2026",
        rating: 5,
        size: "L",
        color: "Black",
        text: "Excellent fabric quality. Fits true to size.",
        helpful: 12,
        replies: 0,
      },
      {
        author: "Sara K.",
        initials: "SK",
        verified: true,
        date: "10 May 2026",
        rating: 4,
        size: "M",
        color: "White",
        text: "Great design, but color slightly different from the picture.",
        helpful: 8,
        replies: 0,
      },
      {
        author: "Khaled M.",
        initials: "KM",
        verified: true,
        date: "5 May 2026",
        rating: 5,
        size: "XL",
        color: "Navy",
        text: "Absolutely love this t-shirt! Washes well without shrinking.",
        helpful: 24,
        replies: 3,
      },
    ],
  });

  STORES["store-adidas"].products["PROD_004"] = defineProduct({
    id: "PROD_004",
    sku: "ADI-HOOD",
    title: "Adidas Essentials Hoodie",
    brand: "Adidas",
    category: "Outerwear",
    subcategory: "Hoodies",
    price: 2100,
    oldPrice: 2600,
    discount: 19,
    rating: 4.9,
    reviewCount: 3120,
    uploadedDate: "2026-04-22T09:00:00Z",
    tags: ["hoodie", "fleece", "winter"],
    images: [
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg",
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/1f0135cfef624e779735b6390f38c98b_9366/KC6611_HM5.jpg",
    ],
    colors: [
      { value: "Black", hex: "#111111" },
      { value: "Medium Grey", hex: "#9ca3af" },
      { value: "Navy", hex: "#172554" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    specs:
      'Brushed-back fleece. <span class="pd-strong">70% cotton / 30% recycled polyester</span>.',
    model: '<span class="pd-strong">• Model:</span> 182cm, size L',
    description:
      "The hoodie you reach for every day. Soft, warm, and built with a relaxed fit that layers cleanly.",
    reviews: [
      {
        author: "Mariam S.",
        initials: "MS",
        verified: true,
        date: "1 May 2026",
        rating: 5,
        size: "M",
        color: "Medium Grey",
        text: "So cozy. The fleece is thick without being heavy.",
        helpful: 14,
        replies: 0,
      },
    ],
  });

  /* ══════════ STORE · Nike Egypt ══════════ */
  STORES["store-nike"] = {
    id: "store-nike",
    slug: "nike-egypt",
    name: "Nike Egypt",
    verified: true,
    rating: 4.7,
    reviewCount: 9820,
    followers: 18900,
    logo: { text: "NK", gradient: "linear-gradient(135deg,#f97316,#ef4444)" },
    banner: null,
    mainCategory: "apparel",
    subcategories: ["Footwear", "Bottoms", "Tops"],
    location: {
      city: "Alexandria",
      country: "Egypt",
      address: "San Stefano, Alexandria",
    },
    contact: {
      phone: "+20 100 222 3333",
      whatsapp: "+20 100 222 3333",
      email: "care@nike.eg",
    },
    details: {
      description: "Nike Egypt — running, training, and lifestyle footwear.",
      since: 2016,
      languages: ["en", "ar"],
    },
    policies: {
      returns: "Free 14-day returns",
      shipping: "Free shipping over EGP 2,000",
      warranty: "6 months",
    },
    shipping: {
      methods: [{ id: "express", name: "Express", cost: 60, eta: "2-3 days" }],
    },
    pickup: {
      available: true,
      branches: [
        {
          id: "br-nike-1",
          name: "Alexandria San Stefano",
          line: "San Stefano Grand Plaza, Alexandria",
          hours: "Open daily · 10:00 AM — 11:00 PM",
          phone: "+20 100 987 0000",
        },
      ],
    },
    coupons: [
      {
        code: "NIKE10",
        type: "percent",
        value: 10,
        minOrder: 0,
        maxDiscount: 600,
        desc: "10% off Nike gear",
        validUntil: "2026-12-31",
      },
    ],
    addresses: [
      {
        id: "addr-nike-1",
        label: "Home",
        tag: "Default",
        icon: "bi-house-door",
        line: "22 Corniche Road, Apt 7, Alexandria",
        phone: "+20 100 555 0000",
        cost: 60,
      },
    ],
    orders: [],
    products: {},
  };

  STORES["store-nike"].products["PROD_002"] = defineProduct({
    id: "PROD_002",
    sku: "NIK-AM90",
    title: "Nike Air Max Sneaker",
    brand: "Nike",
    category: "Footwear",
    subcategory: "Sneakers",
    price: 4200,
    oldPrice: 5200,
    discount: 19,
    rating: 4.7,
    reviewCount: 1840,
    uploadedDate: "2026-05-06T09:00:00Z",
    tags: ["sneakers", "running", "air-max"],
    images: [
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg",
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/1f0135cfef624e779735b6390f38c98b_9366/KC6611_HM5.jpg",
    ],
    colors: [
      { value: "Stealth Black", hex: "#1f1f1f" },
      { value: "White", hex: "#ffffff" },
      { value: "Wolf Grey", hex: "#9ca3af" },
      { value: "University Red", hex: "#dc2626" },
    ],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    specs:
      'Air-cushioned midsole. <span class="pd-strong">Full-grain leather</span> upper with breathable mesh panels.',
    model: '<span class="pd-strong">• Fit:</span> True to size',
    description:
      "Iconic Air Max silhouette with visible cushioning and street-ready attitude.",
    reviews: [
      {
        author: "Omar F.",
        initials: "OF",
        verified: true,
        date: "8 May 2026",
        rating: 5,
        size: "43",
        color: "Stealth Black",
        text: "Super comfortable. The cushioning is excellent.",
        helpful: 17,
        replies: 1,
      },
    ],
  });

  STORES["store-nike"].products["PROD_005"] = defineProduct({
    id: "PROD_005",
    sku: "NIK-SHRT",
    title: "Nike Running Shorts",
    brand: "Nike",
    category: "Bottoms",
    subcategory: "Shorts",
    price: 650,
    oldPrice: 850,
    discount: 24,
    rating: 4.5,
    reviewCount: 780,
    uploadedDate: "2026-04-18T09:00:00Z",
    tags: ["running", "shorts", "dri-fit"],
    images: [
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg",
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/1f0135cfef624e779735b6390f38c98b_9366/KC6611_HM5.jpg",
    ],
    colors: [
      { value: "Black", hex: "#111111" },
      { value: "Volt", hex: "#d9f99d" },
    ],
    sizes: ["S", "M", "L", "XL"],
    specs:
      'Dri-FIT fabric with <span class="pd-strong">built-in liner</span> and zip pocket.',
    model: '<span class="pd-strong">• Model:</span> 180cm, size M',
    description:
      "Lightweight running shorts with a breathable liner and secure zip pocket.",
  });

  /* ══════════ STORE · Puma Sports ══════════ */
  STORES["store-puma"] = {
    id: "store-puma",
    slug: "puma-sports",
    name: "Puma Sports",
    verified: false,
    rating: 4.5,
    reviewCount: 4210,
    followers: 8200,
    logo: { text: "PM", gradient: "linear-gradient(135deg,#0ea5e9,#22c55e)" },
    banner: null,
    mainCategory: "apparel",
    subcategories: ["Tops", "Bottoms"],
    location: {
      city: "Giza",
      country: "Egypt",
      address: "Mall of Egypt, 6th of October",
    },
    contact: {
      phone: "+20 100 333 4444",
      whatsapp: "+20 100 333 4444",
      email: "care@puma.eg",
    },
    details: {
      description: "Puma Sports — training & lifestyle.",
      since: 2018,
      languages: ["en"],
    },
    policies: {
      returns: "14-day returns",
      shipping: "Flat EGP 40",
      warranty: "6 months",
    },
    shipping: {
      methods: [
        { id: "standard", name: "Standard", cost: 40, eta: "3-5 days" },
      ],
    },
    pickup: { available: false, branches: [] },
    coupons: [],
    addresses: [],
    orders: [],
    products: {},
  };

  STORES["store-puma"].products["PROD_003"] = defineProduct({
    id: "PROD_003",
    sku: "PUM-TEE",
    title: "Puma Essential T-Shirt",
    brand: "Puma",
    category: "Tops",
    subcategory: "T-Shirts",
    price: 890,
    oldPrice: 1100,
    discount: 19,
    rating: 4.6,
    reviewCount: 940,
    uploadedDate: "2026-04-20T09:00:00Z",
    tags: ["training", "drycell"],
    images: [
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/a4ff4a779ee34deca8cc9a6f1f411440_9366/KC6611_HM1.jpg",
      "https://assets.adidas.com/images/w_1880,f_auto,q_auto/1f0135cfef624e779735b6390f38c98b_9366/KC6611_HM5.jpg",
    ],
    colors: [
      { value: "Black", hex: "#111111" },
      { value: "White", hex: "#ffffff" },
      { value: "Peacoat", hex: "#1e293b" },
    ],
    sizes: ["S", "M", "L", "XL"],
    specs:
      'Lightweight jersey cotton with <span class="pd-strong">dryCELL</span> moisture management.',
    model: '<span class="pd-strong">• Model:</span> 178cm, size M',
    description:
      "A lightweight training tee that wicks sweat and keeps you cool through every session.",
  });

  /* ══════════ STORE · IKEA Egypt ══════════ */
  STORES["store-ikea"] = {
    id: "store-ikea",
    slug: "ikea-egypt",
    name: "IKEA Egypt",
    verified: true,
    rating: 4.8,
    reviewCount: 21450,
    followers: 45100,
    logo: { text: "IK", gradient: "linear-gradient(135deg,#1d4ed8,#facc15)" },
    banner: null,
    mainCategory: "home",
    subcategories: ["Furniture", "Décor", "Kitchenware"],
    location: {
      city: "Cairo",
      country: "Egypt",
      address: "Cairo Festival City, New Cairo",
    },
    contact: {
      phone: "+20 100 444 5555",
      whatsapp: "+20 100 444 5555",
      email: "care@ikea.eg",
    },
    details: {
      description: "IKEA Egypt — affordable home furnishing.",
      since: 2013,
      languages: ["en", "ar"],
    },
    policies: {
      returns: "365-day returns",
      shipping: "Calculated at checkout",
      warranty: "10 years",
    },
    shipping: {
      methods: [
        { id: "express", name: "Express", cost: 150, eta: "2-3 days" },
        { id: "standard", name: "Standard", cost: 80, eta: "5-7 days" },
      ],
    },
    pickup: {
      available: true,
      branches: [
        {
          id: "br-ikea-1",
          name: "Cairo Festival City",
          line: "CFC, Ring Road, New Cairo",
          hours: "Open daily · 10:00 AM — 11:00 PM",
          phone: "+20 100 987 1111",
        },
      ],
    },
    coupons: [
      {
        code: "IKEA5",
        type: "percent",
        value: 5,
        minOrder: 2000,
        maxDiscount: 500,
        desc: "5% off orders above EGP 2,000",
        validUntil: "2026-12-31",
      },
    ],
    addresses: [],
    orders: [],
    products: {},
  };

  STORES["store-ikea"].products["HOME_001"] = defineProduct({
    id: "HOME_001",
    sku: "IKEA-STRANDMON",
    title: "STRANDMON Armchair",
    brand: "IKEA",
    category: "Furniture",
    subcategory: "Armchairs",
    price: 8490,
    oldPrice: 9990,
    discount: 15,
    rating: 4.7,
    reviewCount: 1280,
    uploadedDate: "2026-03-12T09:00:00Z",
    tags: ["armchair", "fabric", "wingback"],
    images: [
      "https://picsum.photos/seed/ikea-strandmon-1/800/800",
      "https://picsum.photos/seed/ikea-strandmon-2/800/800",
    ],
    colors: [
      { value: "Nordvalla Dark Grey", hex: "#4b5563" },
      { value: "Djuparp Dark Green", hex: "#166534" },
    ],
    sizes: ["One Size"],
    specs:
      'Wingback armchair with <span class="pd-strong">high resilience foam</span> and fabric upholstery.',
    model: '<span class="pd-strong">• Dimensions:</span> 82 × 96 × 101 cm',
    description:
      "A classic wingback armchair that adds warmth and character to any room.",
  });

  STORES["store-ikea"].products["HOME_002"] = defineProduct({
    id: "HOME_002",
    sku: "IKEA-FORSA",
    title: "FORSÅ Work Lamp",
    brand: "IKEA",
    category: "Décor",
    subcategory: "Lighting",
    price: 1190,
    oldPrice: 1490,
    discount: 20,
    rating: 4.6,
    reviewCount: 640,
    uploadedDate: "2026-02-05T09:00:00Z",
    tags: ["lamp", "desk", "adjustable"],
    images: [
      "https://picsum.photos/seed/ikea-forsa-1/800/800",
      "https://picsum.photos/seed/ikea-forsa-2/800/800",
    ],
    colors: [
      { value: "Black", hex: "#111111" },
      { value: "Nickel Plated", hex: "#c0c4cc" },
    ],
    sizes: ["One Size"],
    specs:
      'Adjustable work lamp with <span class="pd-strong">heavy steel base</span>. E27 bulb socket.',
    model: '<span class="pd-strong">• Height:</span> 48 cm',
    description:
      "A sturdy, adjustable work lamp that brings focused light where you need it.",
  });

  /* ══════════ STORE · The Body Shop ══════════ */
  STORES["store-bodyshop"] = {
    id: "store-bodyshop",
    slug: "the-body-shop",
    name: "The Body Shop",
    verified: true,
    rating: 4.8,
    reviewCount: 15230,
    followers: 31200,
    logo: { text: "BS", gradient: "linear-gradient(135deg,#22c55e,#a7f3d0)" },
    banner: null,
    mainCategory: "beauty",
    subcategories: ["Skincare", "Bath & Body", "Makeup"],
    location: {
      city: "Cairo",
      country: "Egypt",
      address: "Mall of Arabia, 6th of October",
    },
    contact: {
      phone: "+20 100 555 6666",
      whatsapp: "+20 100 555 6666",
      email: "care@bodyshop.eg",
    },
    details: {
      description: "Naturally-inspired skincare & body care.",
      since: 2015,
      languages: ["en", "ar"],
    },
    policies: {
      returns: "30-day returns",
      shipping: "Free above EGP 800",
      warranty: "N/A",
    },
    shipping: {
      methods: [
        { id: "standard", name: "Standard", cost: 45, eta: "3-5 days" },
      ],
    },
    pickup: {
      available: true,
      branches: [
        {
          id: "br-bs-1",
          name: "Mall of Arabia",
          line: "Mall of Arabia, 6th of October, Giza",
          hours: "Open daily · 11:00 AM — 11:00 PM",
          phone: "+20 100 987 2222",
        },
      ],
    },
    coupons: [
      {
        code: "GLOW15",
        type: "percent",
        value: 15,
        minOrder: 0,
        maxDiscount: 400,
        desc: "15% off skincare",
        validUntil: "2026-12-31",
      },
    ],
    addresses: [],
    orders: [],
    products: {},
  };

  STORES["store-bodyshop"].products["BTY_001"] = defineProduct({
    id: "BTY_001",
    sku: "BS-VITC-SET",
    title: "Vitamin C Glow Skincare Set",
    brand: "The Body Shop",
    category: "Skincare",
    subcategory: "Sets",
    price: 1850,
    oldPrice: 2400,
    discount: 23,
    rating: 4.9,
    reviewCount: 890,
    uploadedDate: "2026-05-10T09:00:00Z",
    tags: ["vitamin-c", "glow", "set"],
    images: [
      "https://picsum.photos/seed/bs-vitc-1/800/800",
      "https://picsum.photos/seed/bs-vitc-2/800/800",
    ],
    colors: [{ value: "Default", hex: "#f59e0b" }],
    sizes: ["One Size"],
    specs:
      'Includes cleanser, serum, and moisturiser. <span class="pd-strong">Vegan & cruelty-free</span>.',
    model: '<span class="pd-strong">• Skin type:</span> All',
    description:
      "A three-step Vitamin C routine for visibly brighter, healthier-looking skin.",
  });

  STORES["store-bodyshop"].products["BTY_002"] = defineProduct({
    id: "BTY_002",
    sku: "BS-SHEA-BB",
    title: "Shea Body Butter",
    brand: "The Body Shop",
    category: "Bath & Body",
    subcategory: "Moisturisers",
    price: 720,
    oldPrice: 890,
    discount: 19,
    rating: 4.8,
    reviewCount: 2140,
    uploadedDate: "2026-04-02T09:00:00Z",
    tags: ["shea", "body-butter", "48h"],
    images: [
      "https://picsum.photos/seed/bs-shea-1/800/800",
      "https://picsum.photos/seed/bs-shea-2/800/800",
    ],
    colors: [{ value: "Default", hex: "#fde68a" }],
    sizes: ["200ml", "400ml"],
    specs:
      '48-hour moisture. <span class="pd-strong">Community Fair Trade shea butter</span> from Ghana.',
    model: '<span class="pd-strong">• Texture:</span> Rich, buttery',
    description:
      "Our iconic 48h Shea Body Butter for intensely nourished, soft skin.",
  });

  /* ══════════ STORE · Samsung Store ══════════ */
  STORES["store-samsung"] = {
    id: "store-samsung",
    slug: "samsung-store",
    name: "Samsung Store",
    verified: true,
    rating: 4.7,
    reviewCount: 18960,
    followers: 28900,
    logo: { text: "SS", gradient: "linear-gradient(135deg,#1e3a8a,#3b82f6)" },
    banner: null,
    mainCategory: "electronics",
    subcategories: ["Phones", "TVs", "Audio"],
    location: {
      city: "Cairo",
      country: "Egypt",
      address: "City Stars, Nasr City",
    },
    contact: {
      phone: "+20 100 666 7777",
      whatsapp: "+20 100 666 7777",
      email: "care@samsung.eg",
    },
    details: {
      description: "Official Samsung store — phones, TVs, audio.",
      since: 2012,
      languages: ["en", "ar"],
    },
    policies: {
      returns: "14-day returns",
      shipping: "Free express above EGP 5,000",
      warranty: "24 months",
    },
    shipping: {
      methods: [{ id: "express", name: "Express", cost: 0, eta: "1-2 days" }],
    },
    pickup: {
      available: true,
      branches: [
        {
          id: "br-ss-1",
          name: "City Stars",
          line: "City Stars Mall, Nasr City, Cairo",
          hours: "Open daily · 10:00 AM — 12:00 AM",
          phone: "+20 100 987 3333",
        },
      ],
    },
    coupons: [
      {
        code: "GALAXY5",
        type: "percent",
        value: 5,
        minOrder: 10000,
        maxDiscount: 2000,
        desc: "5% off orders above EGP 10,000",
        validUntil: "2026-12-31",
      },
    ],
    addresses: [],
    orders: [],
    products: {},
  };

  STORES["store-samsung"].products["ELX_001"] = defineProduct({
    id: "ELX_001",
    sku: "SS-S24U",
    title: "Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Phones",
    subcategory: "Smartphones",
    price: 64999,
    oldPrice: 72999,
    discount: 11,
    rating: 4.9,
    reviewCount: 3420,
    uploadedDate: "2026-05-15T09:00:00Z",
    tags: ["5g", "s-pen", "titanium"],
    images: [
      "https://picsum.photos/seed/samsung-s24u-1/800/800",
      "https://picsum.photos/seed/samsung-s24u-2/800/800",
    ],
    colors: [
      { value: "Titanium Black", hex: "#1f1f1f" },
      { value: "Titanium Gray", hex: "#6b7280" },
      { value: "Titanium Violet", hex: "#7c3aed" },
    ],
    sizes: ["256GB", "512GB", "1TB"],
    specs:
      'Snapdragon 8 Gen 3 · <span class="pd-strong">200MP</span> main camera · Built-in S Pen.',
    model:
      '<span class="pd-strong">• Display:</span> 6.8" QHD+ Dynamic AMOLED 2X',
    description:
      "The ultimate Galaxy — titanium frame, built-in S Pen, and pro-grade camera system.",
  });

  STORES["store-samsung"].products["ELX_002"] = defineProduct({
    id: "ELX_002",
    sku: "SS-BUDS3P",
    title: "Galaxy Buds3 Pro",
    brand: "Samsung",
    category: "Audio",
    subcategory: "Earbuds",
    price: 8999,
    oldPrice: 10499,
    discount: 14,
    rating: 4.7,
    reviewCount: 1560,
    uploadedDate: "2026-05-08T09:00:00Z",
    tags: ["anc", "hi-fi", "bluetooth"],
    images: [
      "https://picsum.photos/seed/samsung-buds3-1/800/800",
      "https://picsum.photos/seed/samsung-buds3-2/800/800",
    ],
    colors: [
      { value: "Silver", hex: "#c0c4cc" },
      { value: "White", hex: "#ffffff" },
    ],
    sizes: ["One Size"],
    specs:
      'Active Noise Cancelling · <span class="pd-strong">24-bit Hi-Fi</span> · IP57 water resistant.',
    model: '<span class="pd-strong">• Battery:</span> Up to 30h with case',
    description:
      "Studio-quality sound with intelligent ANC and a comfortable blade design.",
  });

  /* ─── 5. Runtime state ────────────────────────────────────────────── */
  let currentStoreId = PLATFORM.defaultStoreId;
  let currentProductId = PLATFORM.defaultProductId;

  function getStore(id) {
    return STORES[id] || null;
  }
  function getProduct(storeId, productId) {
    const s = STORES[storeId];
    if (!s) return null;
    return s.products[productId] || null;
  }
  function getCurrentStore() {
    return STORES[currentStoreId] || null;
  }
  function getCurrentProduct() {
    const s = getCurrentStore();
    if (!s) return null;
    return s.products[currentProductId] || Object.values(s.products)[0] || null;
  }
  function setCurrentStore(id) {
    if (STORES[id]) {
      currentStoreId = id;
      const first = Object.values(STORES[id].products)[0];
      currentProductId = first ? first.id : null;
    }
    return getCurrentStore();
  }
  function setCurrentProduct(id) {
    currentProductId = id;
    return getCurrentProduct();
  }

  /* ─── 6. Legacy adapters (used by doc.js) ─────────────────────────── */
  function mainCategoryName(id) {
    const c = CATEGORY_TREE[id];
    return c ? c.name : "";
  }

  function buildStoreListing(store) {
    return {
      id: store.id,
      name: store.name,
      mainCategory: store.mainCategory,
      subcategories: store.subcategories.slice(),
      location: store.location.city + ", " + store.location.country,
      rating: store.rating,
      verified: store.verified,
      productCount: Object.keys(store.products).length,
    };
  }

  function buildSearchData(store) {
    const products = Object.values(store.products).map((p) => ({
      id: p.id,
      name: p.title,
      brand: p.brand,
      price: "EGP " + Number(p.price).toLocaleString(),
      category: p.category,
      image: p.images[0],
    }));
    const catMap = {};
    Object.values(store.products).forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const categories = Object.keys(catMap).map((name, i) => ({
      id: i + 1,
      name,
      count: catMap[name],
      icon: "bi-bag",
    }));
    const stores = Object.values(STORES).map((s) => ({
      id: s.id,
      name: s.name,
      location: s.location.city + ", " + s.location.country,
      rating: s.rating,
      verified: s.verified,
    }));
    const orders = (store.orders || []).map((o) => ({
      id: o.id,
      status: o.status,
      date: o.date,
      total: o.total,
    }));
    return { products, categories, stores, orders };
  }

  function buildPopular(store) {
    const brands = new Set();
    const cats = new Set();
    Object.values(store.products).forEach((p) => {
      brands.add(p.brand);
      cats.add(p.category);
    });
    return { brands: Array.from(brands), categories: Array.from(cats) };
  }

  function buildMainCategories() {
    const list = [{ id: "all", name: "All categories", desc: "" }];
    Object.values(CATEGORY_TREE).forEach((c) => {
      if (c.id === "all") return;
      list.push({ id: c.id, name: c.name, desc: c.desc });
    });
    return list;
  }

  function buildMainCatSubs() {
    const out = {};
    Object.values(CATEGORY_TREE).forEach((c) => {
      if (c.id === "all" || !c.subs) return;
      out[c.id] = c.subs.map((s) => s.name);
    });
    return out;
  }

  function toLegacy() {
    const store = getCurrentStore();
    if (!store) return {};

    const PRODUCTS = {};
    Object.values(store.products).forEach((p) => {
      PRODUCTS[p.id] = {
        id: p.id,
        sku: p.sku,
        title: p.title,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        oldPrice: p.oldPrice,
        discount: p.discount,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        stockCount: p.stockCount,
        uploadedDate: p.uploadedDate,
        tags: p.tags,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        variants: p.variants,
        specs: p.specs,
        model: p.model,
        description: p.description,
        delivery: p.delivery,
        reviews: p.reviews,
      };
    });

    const PICKUP_BRANCH =
      store.pickup && store.pickup.available && store.pickup.branches.length
        ? store.pickup.branches[0]
        : { line: "", hours: "", phone: "", cost: 0 };

    return {
      PLATFORM,
      STORE: store,
      PRODUCTS,
      SHIPPING_ADDRESSES: store.addresses || [],
      PICKUP_BRANCH,
      ORDERS: store.orders || [],
      SEARCH_DATA: buildSearchData(store),
      POPULAR: buildPopular(store),
      MAIN_CATEGORIES: buildMainCategories(),
      MAIN_CAT_SUBS: buildMainCatSubs(),
      OTHER_STORES: Object.values(STORES).map(buildStoreListing),
    };
  }

  /* ─── 7. Public API ───────────────────────────────────────────────── */
  window.PEACOCK_DATA = {
    platform: PLATFORM,
    categoryTree: CATEGORY_TREE,
    stores: STORES,

    get currentStoreId() {
      return currentStoreId;
    },
    set currentStoreId(v) {
      setCurrentStore(v);
    },
    get currentProductId() {
      return currentProductId;
    },
    set currentProductId(v) {
      setCurrentProduct(v);
    },

    getStore,
    getProduct,
    getCurrentStore,
    getCurrentProduct,
    setCurrentStore,
    setCurrentProduct,

    listStores: () => Object.values(STORES).map(buildStoreListing),
    listCategories: buildMainCategories,
    listSubcategories: buildMainCatSubs,

    buildVariants,
    defineProduct,
    toLegacy,
  };

  /* Debug log */
  try {
    const storeCount = Object.keys(STORES).length;
    const productCount = Object.values(STORES).reduce(
      (a, s) => a + Object.keys(s.products).length,
      0,
    );
    console.info(
      "[Matager · DataInjector] " +
        storeCount +
        " stores · " +
        productCount +
        " products injected.",
    );
  } catch (_) {}
})();
