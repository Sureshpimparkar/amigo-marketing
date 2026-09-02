/* =========================================================
   AMIGO MARKETING - PRODUCT CATALOG
   ---------------------------------------------------------
   This is the single source of truth for the product grid,
   the cart and the stock limits.

   HOW TO MAINTAIN:
     price  -> set the real selling price (a number, no symbol).
               Leave 0 and the item shows "Contact for Price".
     stock  -> how many units you currently have.
               Set 0 and the item shows "Out of Stock" and
               cannot be added to the cart.
     unit   -> shown next to the quantity (pc, litre, box...)
     image  -> unique product image (SVG or JPG)
   ========================================================= */

const AMIGO_PRODUCTS = [

  /* ──────── CAR CLEANING ──────── */
  {
    id: "car-shampoo",
    name: "Car Shampoo",
    description: "Effective car shampoo for a deep, safe clean.",
    image: "assets/images/car-shampoo.jpg",
    category: "Car Cleaning",
    price: 350,
    stock: 10,
    unit: "bottle"
  },
  {
    id: "car-foam-shampoo",
    name: "Car Foam Shampoo",
    description: "Thick foam formula for touchless pre-wash cleaning.",
    image: "assets/images/prod-car-foam.svg",
    category: "Car Cleaning",
    price: 420,
    stock: 8,
    unit: "bottle"
  },
  {
    id: "car-body-wash",
    name: "Car Body Wash Liquid",
    description: "Concentrated body wash for a spot-free, glossy finish.",
    image: "assets/images/prod-car-bodywash.svg",
    category: "Car Cleaning",
    price: 280,
    stock: 12,
    unit: "litre"
  },

  /* ──────── BIKE CLEANING ──────── */
  {
    id: "bike-shampoo",
    name: "Bike Wash Shampoo",
    description: "Gentle yet powerful cleaning for bikes.",
    image: "assets/images/bike-shampoo.jpg",
    category: "Bike Cleaning",
    price: 300,
    stock: 9,
    unit: "bottle"
  },
  {
    id: "bike-chain-cleaner",
    name: "Bike Chain Cleaner",
    description: "Degreases and cleans bike chains, sprockets and gears.",
    image: "assets/images/prod-bike-chain.svg",
    category: "Bike Cleaning",
    price: 260,
    stock: 7,
    unit: "bottle"
  },
  {
    id: "bike-foam-wash",
    name: "Bike Foam Wash",
    description: "Pre-wash foam that loosens dirt before scrubbing.",
    image: "assets/images/prod-bike-foam.svg",
    category: "Bike Cleaning",
    price: 280,
    stock: 6,
    unit: "bottle"
  },

  /* ──────── CAR DETAILING ──────── */
  {
    id: "tyre-polish",
    name: "Tyre Polish",
    description: "Adds a deep black, long-lasting tyre shine.",
    image: "assets/images/tyre-polish.jpg",
    category: "Car Detailing",
    price: 250,
    stock: 12,
    unit: "bottle"
  },
  {
    id: "car-wax",
    name: "Car Wax",
    description: "Premium wax for a glossy, protective finish.",
    image: "assets/images/car-wax.jpg",
    category: "Car Detailing",
    price: 450,
    stock: 6,
    unit: "tin"
  },
  {
    id: "scratch-remover",
    name: "Scratch Remover",
    description: "Removes light scratches and swirl marks from paint.",
    image: "assets/images/prod-scratch-remover.svg",
    category: "Car Detailing",
    price: 380,
    stock: 5,
    unit: "bottle"
  },
  {
    id: "headlight-restorer",
    name: "Headlight Restorer",
    description: "Restores cloudy, yellowed headlights to clear transparency.",
    image: "assets/images/prod-headlight-restorer.svg",
    category: "Car Detailing",
    price: 320,
    stock: 4,
    unit: "kit"
  },
  {
    id: "leather-conditioner",
    name: "Leather Conditioner",
    description: "Nourishes and protects leather seats and interiors.",
    image: "assets/images/prod-leather-conditioner.svg",
    category: "Car Detailing",
    price: 480,
    stock: 5,
    unit: "bottle"
  },

  /* ──────── INTERIOR CLEANING ──────── */
  {
    id: "dashboard-cleaner",
    name: "Dashboard Cleaner",
    description: "Restores shine and protects interior surfaces.",
    image: "assets/images/dashboard-cleaner.jpg",
    category: "Interior Cleaning",
    price: 280,
    stock: 8,
    unit: "bottle"
  },
  {
    id: "interior-shampoo",
    name: "Interior Shampoo",
    description: "Deep-cleans fabric seats, carpets and door pads.",
    image: "assets/images/prod-interior-shampoo.svg",
    category: "Interior Cleaning",
    price: 320,
    stock: 6,
    unit: "bottle"
  },

  /* ──────── CLEANING CHEMICALS ──────── */
  {
    id: "glass-cleaner",
    name: "Glass Cleaner",
    description: "Streak-free clarity for windows and mirrors.",
    image: "assets/images/glass-cleaner.jpg",
    category: "Cleaning Chemicals",
    price: 220,
    stock: 15,
    unit: "bottle"
  },
  {
    id: "all-purpose-cleaner",
    name: "All Purpose Cleaner",
    description: "Versatile cleaner for body, wheels and engine bay.",
    image: "assets/images/prod-apc.svg",
    category: "Cleaning Chemicals",
    price: 270,
    stock: 10,
    unit: "bottle"
  },
  {
    id: "degreaser",
    name: "Degreaser",
    description: "Heavy-duty degreaser for engine parts and greasy surfaces.",
    image: "assets/images/prod-degreaser.svg",
    category: "Cleaning Chemicals",
    price: 310,
    stock: 7,
    unit: "bottle"
  },
  {
    id: "wheel-cleaner",
    name: "Wheel Cleaner",
    description: "Dissolves brake dust and road grime from alloy wheels.",
    image: "assets/images/prod-wheel-cleaner.svg",
    category: "Cleaning Chemicals",
    price: 290,
    stock: 9,
    unit: "bottle"
  },

  /* ──────── MICROFIBER PRODUCTS ──────── */
  {
    id: "microfiber-cloth",
    name: "Microfiber Cloth",
    description: "Soft, scratch-free cloth for finishing touches.",
    image: "assets/images/microfiber.jpg",
    category: "Microfiber Products",
    price: 120,
    stock: 25,
    unit: "pc"
  },
  {
    id: "microfiber-towel",
    name: "Microfiber Drying Towel",
    description: "Large, ultra-absorbent towel for quick car drying.",
    image: "assets/images/prod-microfiber-towel.svg",
    category: "Microfiber Products",
    price: 280,
    stock: 15,
    unit: "pc"
  },
  {
    id: "microfiber-applicator",
    name: "Microfiber Applicator Pad",
    description: "Perfect pad for applying wax, polish and sealant.",
    image: "assets/images/prod-applicator-pad.svg",
    category: "Microfiber Products",
    price: 80,
    stock: 20,
    unit: "pc"
  },

  /* ──────── WASHING ACCESSORIES ──────── */
  {
    id: "cleaning-brush",
    name: "Cleaning Brush",
    description: "Durable brushes for wheels, tyres and body.",
    image: "assets/images/cleaning-brush.jpg",
    category: "Washing Accessories",
    price: 180,
    stock: 10,
    unit: "pc"
  },
  {
    id: "wash-mitt",
    name: "Wash Mitt",
    description: "Soft chenille mitt for scratch-free hand washing.",
    image: "assets/images/prod-wash-mitt.svg",
    category: "Washing Accessories",
    price: 160,
    stock: 12,
    unit: "pc"
  },
  {
    id: "spray-bottle",
    name: "Spray Bottle (1L)",
    description: "Adjustable trigger spray bottle for diluted chemicals.",
    image: "assets/images/prod-spray-bottle.svg",
    category: "Washing Accessories",
    price: 90,
    stock: 18,
    unit: "pc"
  },
  {
    id: "wash-bucket",
    name: "Wash Bucket (20L)",
    description: "Heavy-duty bucket with grit guard for safe washing.",
    image: "assets/images/prod-wash-bucket.svg",
    category: "Washing Accessories",
    price: 350,
    stock: 8,
    unit: "pc"
  },

  /* ──────── POLISHING PRODUCTS ──────── */
  {
    id: "car-polish",
    name: "Car Polish",
    description: "Premium polish for a mirror-like finish on car paint.",
    image: "assets/images/prod-car-polish.svg",
    category: "Polishing Products",
    price: 400,
    stock: 7,
    unit: "tin"
  },
  {
    id: "headlight-polish",
    name: "Headlight Polish Kit",
    description: "Sandpaper + polish kit to restore faded headlights.",
    image: "assets/images/prod-headlight-polish.svg",
    category: "Polishing Products",
    price: 350,
    stock: 5,
    unit: "kit"
  },
  {
    id: "paint-sealant",
    name: "Paint Sealant",
    description: "Long-lasting paint protection with mirror-like gloss.",
    image: "assets/images/prod-paint-sealant.svg",
    category: "Polishing Products",
    price: 520,
    stock: 4,
    unit: "bottle"
  },

  /* ──────── ACCESSORIES ──────── */
  {
    id: "air-freshener",
    name: "Car Air Freshener",
    description: "Long-lasting fragrance for a fresh car interior.",
    image: "assets/images/prod-air-freshener.svg",
    category: "Accessories",
    price: 150,
    stock: 20,
    unit: "pc"
  },
  {
    id: "car-perfume",
    name: "Car Perfume Gel",
    description: "Premium gel-based car perfume lasting up to 60 days.",
    image: "assets/images/prod-car-perfume.svg",
    category: "Accessories",
    price: 220,
    stock: 14,
    unit: "pc"
  },
  {
    id: "sun-shade",
    name: "Front Windscreen Sun Shade",
    description: "Reflective sun shade to protect dashboard from UV damage.",
    image: "assets/images/prod-sun-shade.svg",
    category: "Accessories",
    price: 350,
    stock: 10,
    unit: "pc"
  },
  {
    id: "tyre-gauge",
    name: "Tyre Pressure Gauge",
    description: "Compact digital gauge for quick tyre pressure checks.",
    image: "assets/images/prod-tyre-gauge.svg",
    category: "Accessories",
    price: 190,
    stock: 8,
    unit: "pc"
  }
];

/** Looks up a product by its id. */
function getProductById(id) {
  return AMIGO_PRODUCTS.find(function (p) {
    return p.id === id;
  });
}
