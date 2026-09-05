/* =========================================================
   AMIGO MARKETING - PRODUCT CATALOG
   ---------------------------------------------------------
   This is the single source of truth for the product grid,
   the cart and the stock limits.

   This catalog matches Amigo Marketing's actual price list
   (17 products). Prices are exact, numeric values - do not
   invent or round them.

   HOW TO MAINTAIN:
     price  -> set the real selling price (a number, no symbol).
               Leave 0 and the item shows "Contact for Price".
     stock  -> how many units you currently have.
               Set 0 and the item shows "Out of Stock" and
               cannot be added to the cart.
     unit   -> shown next to the quantity (kg, pc, litre...)
     image  -> unique product photo (JPG, in assets/images/products/)
   ========================================================= */

const AMIGO_PRODUCTS = [

  /* ──────── CLEANING CHEMICALS ──────── */
  {
    id: "shampoo-regular",
    name: "Shampoo Regular",
    description: "Everyday car and bike wash shampoo, sold by weight.",
    image: "assets/images/products/shampoo-regular.jpg",
    category: "Cleaning Chemicals",
    price: 50,
    stock: 40,
    unit: "kg"
  },
  {
    id: "apc",
    name: "APC",
    description: "All Purpose Cleaner for body, wheels and engine bay.",
    image: "assets/images/products/apc.jpg",
    category: "Cleaning Chemicals",
    price: 250,
    stock: 15,
    unit: "bottle"
  },
  {
    id: "hard-water-stain-remover",
    name: "Hard Water Stain Remover",
    description: "Removes stubborn hard-water spots and mineral stains.",
    image: "assets/images/products/hard-water-stain-remover.jpg",
    category: "Cleaning Chemicals",
    price: 220,
    stock: 12,
    unit: "bottle"
  },
  {
    id: "engine-degreaser",
    name: "Engine Degreaser",
    description: "Heavy-duty degreaser for engine parts and greasy surfaces.",
    image: "assets/images/products/engine-degreaser.jpg",
    category: "Cleaning Chemicals",
    price: 220,
    stock: 12,
    unit: "bottle"
  },
  {
    id: "freshner",
    name: "Freshner",
    description: "Long-lasting fragrance concentrate for a fresh interior.",
    image: "assets/images/products/freshner.jpg",
    category: "Cleaning Chemicals",
    price: 400,
    stock: 10,
    unit: "L"
  },

  /* ──────── CAR CARE (dashboard) ──────── */
  {
    id: "dashboard-shiner",
    name: "Dashboard Shiner",
    description: "Restores shine and protects dashboard and interior plastics.",
    image: "assets/images/products/dashboard-shiner.jpg",
    category: "Car Care",
    price: 200,
    stock: 14,
    unit: "bottle"
  },
  {
    id: "dashboard-shiner-3in1",
    name: "Dashboard Shiner 3 in 1",
    description: "3-in-1 formula: cleans, shines and protects in one step.",
    image: "assets/images/products/dashboard-shiner-3in1.jpg",
    category: "Car Care",
    price: 220,
    stock: 12,
    unit: "bottle"
  },
  {
    id: "dashboard-premium",
    name: "Dashboard Premium",
    description: "Premium-grade dashboard polish for a deep, lasting shine.",
    image: "assets/images/products/dashboard-premium.jpg",
    category: "Car Care",
    price: 250,
    stock: 10,
    unit: "bottle"
  },

  /* ──────── TYRE CARE ──────── */
  {
    id: "tyre-shiner-eco",
    name: "Tyre Shiner Eco",
    description: "Everyday tyre shine for a clean, glossy black finish.",
    image: "assets/images/products/tyre-shiner-eco.jpg",
    category: "Tyre Care",
    price: 180,
    stock: 16,
    unit: "bottle"
  },
  {
    id: "tyre-shiner-premium",
    name: "Tyre Shiner Premium",
    description: "Premium long-lasting tyre shine with deeper gloss.",
    image: "assets/images/products/tyre-shiner-premium.jpg",
    category: "Tyre Care",
    price: 220,
    stock: 12,
    unit: "bottle"
  },

  /* ──────── INTERIOR CARE ──────── */
  {
    id: "foot-mat-paper",
    name: "Foot Matt Paper",
    description: "Disposable floor mat paper to keep car interiors clean during service.",
    image: "assets/images/products/foot-mat-paper.jpg",
    category: "Interior Care",
    price: 280,
    stock: 20,
    unit: "100 pcs"
  },

  /* ──────── MICROFIBER & ACCESSORIES ──────── */
  {
    id: "microfiber-cloth-40x40",
    name: "Micro Fiber Cloth 40 X 40",
    description: "Soft, scratch-free microfiber cloth for finishing touches.",
    image: "assets/images/products/microfiber-cloth-40x40.jpg",
    category: "Microfiber & Accessories",
    price: 60,
    stock: 30,
    unit: "pc"
  },
  {
    id: "microfiber-cloth-40x60",
    name: "Micro Fiber Cloth 40 X 60",
    description: "Larger microfiber cloth for faster drying and buffing.",
    image: "assets/images/products/microfiber-cloth-40x60.jpg",
    category: "Microfiber & Accessories",
    price: 80,
    stock: 25,
    unit: "pc"
  },
  {
    id: "microfiber-cloth-40x40-velvet",
    name: "Micro Fiber Cloth 40 X 40 Velvet",
    description: "Velvet-finish microfiber cloth for a smooth, swirl-free wipe.",
    image: "assets/images/products/microfiber-cloth-40x40-velvet.jpg",
    category: "Microfiber & Accessories",
    price: 60,
    stock: 25,
    unit: "pc"
  },
  {
    id: "glass-cloth",
    name: "Glass Cloth",
    description: "Lint-free cloth for streak-free glass and mirror cleaning.",
    image: "assets/images/products/glass-cloth.jpg",
    category: "Microfiber & Accessories",
    price: 60,
    stock: 25,
    unit: "pc"
  },
  {
    id: "microfiber-800gsm-50x80",
    name: "800 GSM Micro Fiber Cloth 50 X 80",
    description: "Extra-thick, high-GSM microfiber cloth for heavy-duty drying.",
    image: "assets/images/products/microfiber-800gsm-50x80.jpg",
    category: "Microfiber & Accessories",
    price: 270,
    stock: 15,
    unit: "pc"
  },
  {
    id: "washing-hand-gloves",
    name: "Washing Hand Gloves",
    description: "Reusable hand gloves for safe, comfortable car washing.",
    image: "assets/images/products/washing-hand-gloves.jpg",
    category: "Microfiber & Accessories",
    price: 120,
    stock: 20,
    unit: "pair"
  }
];

/** Looks up a product by its id. */
function getProductById(id) {
  return AMIGO_PRODUCTS.find(function (p) {
    return p.id === id;
  });
}
