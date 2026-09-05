/* =========================================================
   AMIGO MARKETING - ORDER / CART ENGINE
   ---------------------------------------------------------
   - Renders the product grid from js/products.js
   - Category filtering
   - Product details modal
   - Cart with delivery charge calculation
   - Checkout emails the order via EmailJS or falls back to
     WhatsApp / mailto
   ========================================================= */

// Cart shape: { productId: quantity }
let amigoCart = {};
let activeCategory = "All";

const CART_STORAGE_KEY = "amigoCart";

/**
 * Real product photos (.jpg/.jpeg/.png) are full-bleed rectangular shots and
 * need a "cover" crop. Icon-style .svg placeholders are floated/contained on
 * a studio-gray tile instead. This flag lets the CSS treat each correctly.
 */
function isRealPhoto(imagePath) {
  return /\.(jpe?g|png|webp)$/i.test(imagePath || "");
}

/* ============ CART PERSISTENCE ============ */

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    amigoCart = saved ? JSON.parse(saved) : {};
  } catch (err) {
    amigoCart = {};
  }
  // Drop anything that no longer exists or is now out of stock
  Object.keys(amigoCart).forEach(function (id) {
    var product = getProductById(id);
    if (!product || product.stock <= 0) {
      delete amigoCart[id];
    } else if (amigoCart[id] > product.stock) {
      amigoCart[id] = product.stock;
    }
  });
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(amigoCart));
  } catch (err) {
    /* localStorage unavailable (private mode) - cart stays in memory only */
  }
}

/* ============ CART OPERATIONS ============ */

function getCartCount() {
  return Object.values(amigoCart).reduce(function (sum, q) {
    return sum + q;
  }, 0);
}

function getCartSubtotal() {
  return Object.keys(amigoCart).reduce(function (sum, id) {
    var p = getProductById(id);
    return p ? sum + p.price * amigoCart[id] : sum;
  }, 0);
}

function getDeliveryCharge() {
  return AMIGO_CONFIG.deliveryCharge || 0;
}

function getCartTotal() {
  return getCartSubtotal() + getDeliveryCharge();
}

function getCartLines() {
  return Object.keys(amigoCart).map(function (id) {
    var p = getProductById(id);
    return {
      product: p,
      qty: amigoCart[id],
      lineTotal: p.price * amigoCart[id]
    };
  });
}

/**
 * Adds a quantity to the cart, capped at available stock.
 * @returns {boolean} true if the full requested amount was added
 */
function addToCart(productId, qty) {
  var product = getProductById(productId);
  if (!product || product.stock <= 0) {
    return false;
  }
  var current = amigoCart[productId] || 0;
  var requested = current + (qty || 1);
  var capped = Math.min(requested, product.stock);

  amigoCart[productId] = capped;
  saveCart();
  renderCart();
  updateCartBadge();

  return capped === requested;
}

function setCartQty(productId, qty) {
  var product = getProductById(productId);
  if (!product) return;

  var clean = Math.max(0, Math.min(parseInt(qty, 10) || 0, product.stock));
  if (clean === 0) {
    delete amigoCart[productId];
  } else {
    amigoCart[productId] = clean;
  }
  saveCart();
  renderCart();
  updateCartBadge();
}

function removeFromCart(productId) {
  delete amigoCart[productId];
  saveCart();
  renderCart();
  updateCartBadge();
}

function clearCart() {
  amigoCart = {};
  saveCart();
  renderCart();
  updateCartBadge();
}

/* ============ TOAST FEEDBACK ============ */

function showToast(message, variant) {
  var holder = document.getElementById("amigoToastHolder");
  if (!holder) return;

  var toast = document.createElement("div");
  toast.className = "amigo-toast " + (variant === "warn" ? "amigo-toast-warn" : "amigo-toast-ok");
  toast.setAttribute("role", "status");
  toast.textContent = message;
  holder.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add("show");
  });
  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 2800);
}

/* ============ CATEGORY FILTERING ============ */

function getCategories() {
  var cats = {};
  AMIGO_PRODUCTS.forEach(function (p) {
    cats[p.category] = true;
  });
  return ["All"].concat(Object.keys(cats));
}

function filterProducts(category) {
  activeCategory = category;
  // Update active state on category cards
  document.querySelectorAll(".category-card").forEach(function (card) {
    var cat = card.getAttribute("data-category");
    card.classList.toggle("category-active", cat === category);
  });
  // Update "All" filter pill if present
  document.querySelectorAll(".filter-pill").forEach(function (pill) {
    pill.classList.toggle("filter-active", pill.getAttribute("data-category") === category);
  });
  renderProducts();
}

/* ============ PRODUCT GRID RENDERING ============ */

function renderProducts() {
  var grid = document.getElementById("productGrid");
  if (!grid) return;

  var filtered = AMIGO_PRODUCTS.filter(function (p) {
    return activeCategory === "All" || p.category === activeCategory;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No products found in this category.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(function (p) {
    var outOfStock = p.stock <= 0;
    var lowStock = !outOfStock && p.stock <= 5;
    var hasPrice = AMIGO_CONFIG.pricesConfigured && p.price > 0;

    var stockBadge = outOfStock
      ? '<span class="stock-badge stock-out">Out of Stock</span>'
      : '<span class="stock-badge ' + (lowStock ? "stock-low" : "stock-in") + '">' +
        (lowStock ? "Only " + p.stock + " left" : "In Stock: " + p.stock) +
        "</span>";

    var priceHtml = hasPrice
      ? '<p class="product-price">' + formatMoney(p.price) + " / " + p.unit + "</p>"
      : '<p class="product-price">Contact for Price</p>';

    // Quantity stepper
    var qtyHtml = outOfStock
      ? ""
      : '<div class="qty-stepper" role="group" aria-label="Quantity for ' + p.name + '">' +
          '<button type="button" class="qty-btn" data-qty-action="dec" data-id="' + p.id + '" aria-label="Decrease quantity">&minus;</button>' +
          '<input type="number" class="qty-input" id="qty-' + p.id + '" value="1" min="1" max="' + p.stock +
            '" aria-label="Quantity, maximum ' + p.stock + '">' +
          '<button type="button" class="qty-btn" data-qty-action="inc" data-id="' + p.id + '" aria-label="Increase quantity">+</button>' +
        "</div>";

    var actionsHtml = outOfStock
      ? '<button class="btn btn-outofstock" disabled>Out of Stock</button>' +
        '<button class="btn btn-enquire-alt" data-enquire="' + p.id + '">' +
          '<i class="bi bi-whatsapp"></i> Ask Availability</button>'
      : '<button class="btn btn-buy-now" data-buy="' + p.id + '">' +
          '<i class="bi bi-lightning-charge-fill"></i> Buy Now</button>' +
        '<button class="btn btn-add-cart" data-add="' + p.id + '">' +
          '<i class="bi bi-cart-plus"></i> Add to Cart</button>';

    // WhatsApp enquiry button (always shown)
    var enquiryHtml = '<button class="btn btn-whatsapp-product" data-enquire="' + p.id + '">' +
      '<i class="bi bi-whatsapp"></i> Enquire on WhatsApp</button>';

    return (
      '<div class="col-6 col-md-4 col-lg-3">' +
        '<div class="product-card' + (outOfStock ? " product-card-disabled" : "") + '">' +
          '<div class="product-img-wrap' + (isRealPhoto(p.image) ? " product-img-wrap-photo" : "") +
            '" data-detail="' + p.id + '" role="button" tabindex="0" aria-label="View details for ' + p.name + '">' +
            '<img src="' + p.image + '" alt="' + p.name + ' - ' + p.category + '" class="product-img' +
              (isRealPhoto(p.image) ? " product-img-photo" : "") + '" loading="lazy">' +
            stockBadge +
          "</div>" +
          '<div class="product-body">' +
            '<h3 class="product-title">' + p.name + "</h3>" +
            '<p class="product-desc">' + p.description + "</p>" +
            priceHtml +
            qtyHtml +
            '<div class="product-actions">' + actionsHtml + "</div>" +
            enquiryHtml +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }).join("");
}

/** Reads the stepper value for a product card. */
function readQtyInput(productId) {
  var input = document.getElementById("qty-" + productId);
  return input ? parseInt(input.value, 10) || 1 : 1;
}

/* ============ PRODUCT DETAILS MODAL ============ */

function openProductDetails(productId) {
  var product = getProductById(productId);
  if (!product) return;

  var hasPrice = AMIGO_CONFIG.pricesConfigured && product.price > 0;
  var outOfStock = product.stock <= 0;

  document.getElementById("detailImg").src = product.image;
  document.getElementById("detailImg").alt = product.name + " - " + product.category;
  document.getElementById("detailName").textContent = product.name;
  document.getElementById("detailCategory").textContent = product.category;
  document.getElementById("detailDesc").textContent = product.description;
  document.getElementById("detailPrice").innerHTML = hasPrice
    ? formatMoney(product.price) + " <small>/ " + product.unit + "</small>"
    : "Contact for Price";

  // Quantity stepper
  var qtyContainer = document.getElementById("detailQtyStepper");
  if (outOfStock) {
    qtyContainer.innerHTML = '<span class="stock-badge stock-out" style="position:static;display:inline-block;">Out of Stock</span>';
  } else {
    qtyContainer.innerHTML =
      '<div class="qty-stepper" role="group" aria-label="Quantity">' +
        '<button type="button" class="qty-btn" id="detailQtyDec">&minus;</button>' +
        '<input type="number" class="qty-input" id="detailQtyInput" value="1" min="1" max="' + product.stock + '">' +
        '<button type="button" class="qty-btn" id="detailQtyInc">+</button>' +
      '</div>' +
      '<span class="detail-stock-info">Available: ' + product.stock + " " + product.unit + "s</span>";
  }

  // Action buttons
  var btnContainer = document.getElementById("detailActions");
  if (outOfStock) {
    btnContainer.innerHTML =
      '<button class="btn btn-outofstock" disabled style="width:100%;">Out of Stock</button>' +
      '<button class="btn btn-enquire-alt" data-enquire="' + product.id + '" style="width:100%;margin-top:8px;">' +
        '<i class="bi bi-whatsapp"></i> Ask Availability</button>';
  } else {
    btnContainer.innerHTML =
      '<button class="btn btn-buy-now" data-buy="' + product.id + '" style="width:100%;">' +
        '<i class="bi bi-lightning-charge-fill"></i> Buy Now</button>' +
      '<button class="btn btn-add-cart" data-add="' + product.id + '" style="width:100%;margin-top:8px;">' +
        '<i class="bi bi-cart-plus"></i> Add to Cart</button>' +
      '<button class="btn btn-whatsapp-product" data-enquire="' + product.id + '" style="width:100%;margin-top:8px;">' +
        '<i class="bi bi-whatsapp"></i> Enquire on WhatsApp</button>';
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById("productDetailModal")).show();
}

function readDetailQty() {
  var input = document.getElementById("detailQtyInput");
  return input ? parseInt(input.value, 10) || 1 : 1;
}

/* ============ CART DRAWER RENDERING ============ */

function updateCartBadge() {
  var badge = document.getElementById("cartBadge");
  if (!badge) return;
  var count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle("d-none", count === 0);
}

function renderCart() {
  var body = document.getElementById("cartBody");
  var footer = document.getElementById("cartFooter");
  if (!body || !footer) return;

  var lines = getCartLines();

  if (lines.length === 0) {
    body.innerHTML =
      '<div class="cart-empty">' +
        '<i class="bi bi-cart-x"></i>' +
        "<p>Your cart is empty.</p>" +
        '<a href="#products" class="btn btn-hero-primary btn-sm" data-bs-dismiss="offcanvas">Browse Products</a>' +
      "</div>";
    footer.innerHTML = "";
    return;
  }

  body.innerHTML = lines.map(function (line) {
    var p = line.product;
    var atMax = line.qty >= p.stock;
    var priceLabel = AMIGO_CONFIG.pricesConfigured && p.price > 0
      ? formatMoney(line.lineTotal)
      : "Contact for Price";

    return (
      '<div class="cart-line">' +
        '<img src="' + p.image + '" alt="' + p.name + '" class="cart-line-img">' +
        '<div class="cart-line-info">' +
          '<h4 class="cart-line-name">' + p.name + "</h4>" +
          '<p class="cart-line-meta">' + formatMoney(p.price) + " &times; " + line.qty + " = " + priceLabel + "</p>" +
          '<div class="qty-stepper qty-stepper-sm">' +
            '<button type="button" class="qty-btn" data-cart-action="dec" data-id="' + p.id + '" aria-label="Decrease">&minus;</button>' +
            '<span class="qty-value">' + line.qty + "</span>" +
            '<button type="button" class="qty-btn" data-cart-action="inc" data-id="' + p.id + '"' +
              (atMax ? " disabled" : "") + ' aria-label="Increase">+</button>' +
          "</div>" +
          (atMax ? '<span class="cart-max-note">Max available: ' + p.stock + "</span>" : "") +
        "</div>" +
        '<button type="button" class="cart-remove" data-cart-action="remove" data-id="' + p.id +
          '" aria-label="Remove ' + p.name + ' from cart"><i class="bi bi-trash"></i></button>' +
      "</div>"
    );
  }).join("");

  // Build footer with subtotal, delivery, grand total
  var subtotal = getCartSubtotal();
  var delivery = getDeliveryCharge();
  var grandTotal = getCartTotal();

  footer.innerHTML =
    '<div class="cart-total-line"><span>Subtotal</span><strong>' + formatMoney(subtotal) + "</strong></div>" +
    '<div class="cart-total-line"><span>Delivery</span><strong>' + (delivery > 0 ? formatMoney(delivery) : "Free") + "</strong></div>" +
    '<div class="cart-total"><span>Grand Total</span><strong>' + formatMoney(grandTotal) + "</strong></div>" +
    '<button class="btn btn-checkout" id="openCheckoutBtn">' +
      '<i class="bi bi-bag-check-fill"></i> Proceed to Checkout</button>' +
    '<button class="btn btn-clear-cart" id="clearCartBtn">Clear Cart</button>';
}

/* ============ CHECKOUT ============ */

function openCheckout() {
  if (getCartCount() === 0) {
    showToast("Your cart is empty.", "warn");
    return;
  }

  // Close the cart drawer if it is open
  var cartEl = document.getElementById("cartDrawer");
  if (cartEl) {
    var oc = bootstrap.Offcanvas.getInstance(cartEl);
    if (oc) oc.hide();
  }

  renderCheckoutSummary();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("checkoutModal")).show();
}

function renderCheckoutSummary() {
  var el = document.getElementById("checkoutSummary");
  if (!el) return;

  var lines = getCartLines();
  var subtotal = getCartSubtotal();
  var delivery = getDeliveryCharge();
  var grandTotal = getCartTotal();

  var rows = lines.map(function (line) {
    var amount = AMIGO_CONFIG.pricesConfigured && line.product.price > 0
      ? formatMoney(line.lineTotal)
      : "—";
    return (
      "<tr>" +
        "<td>" + line.product.name + " &times; " + line.qty + "</td>" +
        '<td class="text-end">' + amount + "</td>" +
      "</tr>"
    );
  }).join("");

  el.innerHTML =
    '<table class="table checkout-table mb-0">' +
      "<thead><tr><th>Item</th><th class='text-end'>Amount</th></tr></thead>" +
      "<tbody>" + rows +
      '<tr><td>Subtotal</td><td class="text-end"><strong>' + formatMoney(subtotal) + "</strong></td></tr>" +
      '<tr><td>Delivery</td><td class="text-end">' + (delivery > 0 ? formatMoney(delivery) : "Free") + "</td></tr>" +
      '<tr class="checkout-total-row"><td><strong>Grand Total</strong></td>' +
      '<td class="text-end"><strong>' + formatMoney(grandTotal) + "</strong></td></tr>" +
      "</tbody></table>";
}

/** Builds the plain-text item list used in emails and WhatsApp. */
function buildItemsText() {
  return getCartLines().map(function (line) {
    var amount = AMIGO_CONFIG.pricesConfigured && line.product.price > 0
      ? " = " + formatMoney(line.lineTotal)
      : "";
    return line.product.name + " × " + line.qty + amount;
  }).join("\n");
}

function generateOrderId() {
  var d = new Date();
  var stamp =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "AMG" + (1000 + Math.floor(Math.random() * 9000));
}

/* ============ WHATSAPP MESSAGE GENERATION ============ */

/**
 * Generates the full WhatsApp order message per spec:
 * - Products with quantities and amounts
 * - Subtotal, delivery, grand total
 * - Customer details
 * - Payment info
 */
function generateOrderWhatsappMessage(order) {
  var lines = getCartLines();
  var productLines = lines.map(function (line, i) {
    var amount = AMIGO_CONFIG.pricesConfigured && line.product.price > 0
      ? " = " + formatMoney(line.lineTotal)
      : "";
    return (i + 1) + ". " + line.product.name + " × " + line.qty + amount;
  }).join("\n");

  var subtotal = getCartSubtotal();
  var delivery = getDeliveryCharge();
  var grandTotal = getCartTotal();

  var msg =
    "Hello Amigo Marketing,\n\n" +
    "I would like to place an order.\n\n" +
    "Order ID: " + order.id + "\n\n" +
    "Products:\n" + productLines + "\n\n" +
    "Subtotal: " + formatMoney(subtotal) + "\n" +
    "Delivery: " + formatMoney(delivery) + "\n" +
    "Total Amount: " + formatMoney(grandTotal) + "\n\n" +
    "Customer Details:\n" +
    "Name: " + order.name + "\n" +
    "Mobile: " + order.phone + "\n" +
    "Address: " + order.address + "\n\n" +
    "Payment Method: UPI\n" +
    "Payment Status: Pending\n\n" +
    "Thank you.";

  return msg;
}

/**
 * Generates a product enquiry message per spec.
 */
function generateEnquiryMessage(productId) {
  var product = getProductById(productId);
  if (!product) return "";

  var qty = readQtyInput(productId);
  var hasPrice = AMIGO_CONFIG.pricesConfigured && product.price > 0;

  var msg =
    "Hello Amigo Marketing,\n\n" +
    "I am interested in:\n\n" +
    "Product: " + product.name + "\n" +
    (hasPrice ? "Price: " + formatMoney(product.price) + "\n" : "") +
    "Quantity: " + qty + "\n\n" +
    "Please share product details and availability.\n\n" +
    "Thank you.";

  return msg;
}

/* ============ UPI PAYMENT QR ============ */

function buildUpiLink(orderId, amount) {
  var params =
    "pa=" + encodeURIComponent(AMIGO_CONFIG.upiId) +
    "&pn=" + encodeURIComponent(AMIGO_CONFIG.upiPayeeName) +
    "&am=" + encodeURIComponent(Number(amount).toFixed(2)) +
    "&cu=" + encodeURIComponent(AMIGO_CONFIG.currency) +
    "&tn=" + encodeURIComponent("Order " + orderId) +
    "&tr=" + encodeURIComponent(orderId);
  return "upi://pay?" + params;
}

function renderQrCode(container, text) {
  container.innerHTML = "";
  if (typeof QRCode === "undefined") return null;

  new QRCode(container, {
    text: text,
    width: 220,
    height: 220,
    colorDark: "#0d0d0d",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

  var canvas = container.querySelector("canvas");
  return canvas ? canvas.toDataURL("image/png") : null;
}

/* ============ EMAIL DISPATCH ============ */

function sendOrderEmails(order, qrDataUrl) {
  if (!isEmailJsReady()) {
    return Promise.resolve({ businessSent: false, customerSent: false });
  }

  var cfg = AMIGO_CONFIG.emailjs;
  emailjs.init({ publicKey: cfg.publicKey });

  var sharedParams = {
    order_id: order.id,
    order_date: order.date,
    customer_name: order.name,
    customer_phone: order.phone,
    customer_email: order.email,
    customer_address: order.address,
    order_items: order.itemsText,
    order_total: order.totalText,
    to_email: AMIGO_CONFIG.orderEmail
  };

  var businessSend = emailjs
    .send(cfg.serviceId, cfg.businessTemplateId, sharedParams)
    .then(function () { return true; })
    .catch(function (err) {
      console.error("Business order email failed:", err);
      return false;
    });

  var customerSend = Promise.resolve(false);
  if (!cfg.customerTemplateId.startsWith("YOUR_") && order.email) {
    var customerParams = Object.assign({}, sharedParams, {
      upi_id: isUpiReady() ? AMIGO_CONFIG.upiId : "",
      upi_link: order.upiLink || "",
      qr_attachment: qrDataUrl || ""
    });

    customerSend = emailjs
      .send(cfg.serviceId, cfg.customerTemplateId, customerParams)
      .then(function () { return true; })
      .catch(function (err) {
        console.error("Customer payment email failed:", err);
        return false;
      });
  }

  return Promise.all([businessSend, customerSend]).then(function (r) {
    return { businessSent: r[0], customerSent: r[1] };
  });
}

function buildMailtoLink(order) {
  var subject = "New Order " + order.id + " - Amigo Marketing";
  var body =
    "ORDER " + order.id + "\n" +
    "Date: " + order.date + "\n\n" +
    "CUSTOMER\n" +
    "Name: " + order.name + "\n" +
    "Phone: " + order.phone + "\n" +
    "Email: " + order.email + "\n" +
    "Address: " + order.address + "\n\n" +
    "ITEMS\n" + order.itemsText + "\n\n" +
    "TOTAL: " + order.totalText + "\n";

  var to = AMIGO_CONFIG.orderEmail.startsWith("YOUR_") ? "" : AMIGO_CONFIG.orderEmail;
  return "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

function buildOrderWhatsappLink(order) {
  var msg = generateOrderWhatsappMessage(order);
  return buildWhatsappLink(msg);
}

/* ============ PLACE ORDER ============ */

function placeOrder(event) {
  event.preventDefault();

  var form = document.getElementById("checkoutForm");
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  // Re-validate stock at the last moment
  var overStock = getCartLines().filter(function (l) {
    return l.qty > l.product.stock;
  });
  if (overStock.length > 0) {
    overStock.forEach(function (l) {
      setCartQty(l.product.id, l.product.stock);
    });
    showToast("Quantities were adjusted to available stock.", "warn");
    renderCheckoutSummary();
    return;
  }

  var submitBtn = document.getElementById("placeOrderBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Placing Order...';

  var total = getCartTotal();
  var order = {
    id: generateOrderId(),
    date: new Date().toLocaleString("en-IN"),
    name: document.getElementById("custName").value.trim(),
    phone: document.getElementById("custPhone").value.trim(),
    email: document.getElementById("custEmail").value.trim(),
    address: document.getElementById("custAddress").value.trim(),
    itemsText: buildItemsText(),
    totalText: AMIGO_CONFIG.pricesConfigured ? formatMoney(total) : "To be confirmed",
    total: total
  };

  // Build the payment QR before sending
  var qrDataUrl = null;
  var qrHolder = document.getElementById("orderQrCode");
  var qrSection = document.getElementById("qrSection");

  if (isUpiReady() && total > 0) {
    order.upiLink = buildUpiLink(order.id, total);
    qrDataUrl = renderQrCode(qrHolder, order.upiLink);
    qrSection.classList.remove("d-none");
    document.getElementById("qrAmount").textContent = formatMoney(total);
    document.getElementById("qrUpiId").textContent = AMIGO_CONFIG.upiId;
    document.getElementById("upiPayLink").setAttribute("href", order.upiLink);
  } else {
    qrSection.classList.add("d-none");
  }

  // Store order for WhatsApp
  window._lastOrder = order;

  sendOrderEmails(order, qrDataUrl).then(function (result) {
    // Reduce stock
    getCartLines().forEach(function (line) {
      line.product.stock = Math.max(0, line.product.stock - line.qty);
    });

    showOrderSuccess(order, result);

    clearCart();
    renderProducts();
    form.reset();
    form.classList.remove("was-validated");
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-bag-check-fill"></i> Place Order';
  });
}

function showOrderSuccess(order, result) {
  bootstrap.Modal.getOrCreateInstance(document.getElementById("checkoutModal")).hide();

  document.getElementById("successOrderId").textContent = order.id;
  document.getElementById("successName").textContent = order.name;

  var statusEl = document.getElementById("orderStatusMsg");
  var fallbackEl = document.getElementById("orderFallback");

  if (result.businessSent) {
    var msg = "Your order has been emailed to us.";
    if (result.customerSent) {
      msg += " A confirmation with the payment QR has been sent to " + order.email + ".";
    } else if (order.email) {
      msg += " Please use the QR below to pay.";
    }
    statusEl.innerHTML = '<i class="bi bi-check-circle-fill"></i> ' + msg;
    statusEl.className = "order-status order-status-ok";
    fallbackEl.classList.add("d-none");
  } else {
    statusEl.innerHTML =
      '<i class="bi bi-exclamation-triangle-fill"></i> Please send your order using one of the buttons below.';
    statusEl.className = "order-status order-status-warn";

    document.getElementById("fallbackMailBtn").setAttribute("href", buildMailtoLink(order));

    var waBtn = document.getElementById("fallbackWhatsappBtn");
    var waLink = buildOrderWhatsappLink(order);
    if (waLink) {
      waBtn.setAttribute("href", waLink);
      waBtn.classList.remove("d-none");
    } else {
      waBtn.classList.add("d-none");
    }

    fallbackEl.classList.remove("d-none");
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById("successModal")).show();
}

/* ============ EVENT WIRING ============ */

document.addEventListener("DOMContentLoaded", function () {
  loadCart();
  renderProducts();
  renderCart();
  updateCartBadge();

  // Wire up category filter pills
  document.querySelectorAll("[data-category]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      filterProducts(el.getAttribute("data-category"));
      // Scroll to products section
      var prodSection = document.getElementById("products");
      if (prodSection) {
        prodSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Delegated clicks across product grid, cart drawer, modals
  document.addEventListener("click", function (e) {
    var target = e.target.closest("button, a, [data-detail]");
    if (!target) return;

    // Product card quantity stepper
    var qtyAction = target.getAttribute("data-qty-action");
    if (qtyAction) {
      var id = target.getAttribute("data-id");
      var input = document.getElementById("qty-" + id);
      var product = getProductById(id);
      var val = parseInt(input.value, 10) || 1;
      val = qtyAction === "inc" ? val + 1 : val - 1;
      val = Math.max(1, Math.min(val, product.stock));
      input.value = val;
      return;
    }

    // Product details modal (click on image or title)
    var detailId = target.getAttribute("data-detail");
    if (detailId) {
      openProductDetails(detailId);
      return;
    }

    // Add to cart
    var addId = target.getAttribute("data-add");
    if (addId) {
      // Check if modal is open - use modal qty if so
      var modalOpen = document.getElementById("productDetailModal") &&
        document.getElementById("productDetailModal").classList.contains("show");
      var qty = modalOpen ? readDetailQty() : readQtyInput(addId);
      var fullyAdded = addToCart(addId, qty);
      var prod = getProductById(addId);
      showToast(
        fullyAdded
          ? prod.name + " added to cart."
          : "Only " + prod.stock + " available - cart set to the maximum.",
        fullyAdded ? "ok" : "warn"
      );
      // Close details modal if open
      if (modalOpen) {
        bootstrap.Modal.getInstance(document.getElementById("productDetailModal")).hide();
      }
      return;
    }

    // Buy now -> add then straight to checkout
    var buyId = target.getAttribute("data-buy");
    if (buyId) {
      var modalOpen2 = document.getElementById("productDetailModal") &&
        document.getElementById("productDetailModal").classList.contains("show");
      var qty2 = modalOpen2 ? readDetailQty() : readQtyInput(buyId);
      addToCart(buyId, qty2);
      if (modalOpen2) {
        bootstrap.Modal.getInstance(document.getElementById("productDetailModal")).hide();
      }
      openCheckout();
      return;
    }

    // WhatsApp enquiry
    var enquireId = target.getAttribute("data-enquire");
    if (enquireId) {
      var msg = generateEnquiryMessage(enquireId);
      var link = buildWhatsappLink(msg);
      if (link) {
        window.open(link, "_blank", "noopener");
      } else {
        showToast("WhatsApp is not set up yet. Please call us or visit the store.", "warn");
      }
      return;
    }

    // Cart drawer controls
    var cartAction = target.getAttribute("data-cart-action");
    if (cartAction) {
      var cid = target.getAttribute("data-id");
      if (cartAction === "remove") {
        removeFromCart(cid);
      } else {
        var delta = cartAction === "inc" ? 1 : -1;
        setCartQty(cid, (amigoCart[cid] || 0) + delta);
      }
      return;
    }

    if (target.id === "openCheckoutBtn") {
      openCheckout();
      return;
    }

    if (target.id === "clearCartBtn") {
      clearCart();
      showToast("Cart cleared.", "ok");
      return;
    }

    // Detail modal quantity stepper
    if (target.id === "detailQtyDec" || target.id === "detailQtyInc") {
      var detailInput = document.getElementById("detailQtyInput");
      if (!detailInput) return;
      var dval = parseInt(detailInput.value, 10) || 1;
      var dmax = parseInt(detailInput.max, 10) || 99;
      dval = target.id === "detailQtyInc" ? dval + 1 : dval - 1;
      dval = Math.max(1, Math.min(dval, dmax));
      detailInput.value = dval;
      return;
    }
  });

  // Keyboard support for product details (Enter/Space on image)
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      var target = e.target.closest("[data-detail]");
      if (target) {
        e.preventDefault();
        openProductDetails(target.getAttribute("data-detail"));
      }
    }
  });

  // Checkout form submit
  var checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", placeOrder);
  }
});
