/* =========================================================
   AMIGO MARKETING - CENTRAL CONFIGURATION
   ---------------------------------------------------------
   EVERY placeholder below must be replaced with real values
   before the order system will work. Nothing here is invented.
   ========================================================= */

const AMIGO_CONFIG = {

  /* ---------- CONTACT DETAILS ---------- */
  // Country dialling code WITHOUT the "+" (India = 91).
  // wa.me links only work with the full international number, so if
  // whatsappNumber below is a plain 10-digit number this code is
  // prepended automatically.
  countryCode: "91",

  // WhatsApp number. Either format is fine:
  //   "8378008287"     (10-digit local - country code added automatically)
  //   "918378008287"   (already international)
  whatsappNumber: "8378008287",

  // Phone number for the "Call Now" button (e.g. "+919876543210")
  phoneNumber: "8378008287",

  // Business email address where ORDERS should be delivered
  orderEmail: "sureshpimparkar04@gmail.com",

  businessName: "Amigo Marketing",
  businessAddress: "Amigo Marketing, Pune Nagar Rd, near Satkar Hotel, Shree Ram Society, Chandan Nagar, Kharadi, Pune, Maharashtra 411014",

  /* ---------- PRICING ---------- */
  pricesConfigured: true,

  /* Delivery charge in ₹ (added to subtotal). Set to 0 for free delivery. */
  deliveryCharge: 50,

  currency: "INR",
  currencySymbol: "₹",

  /* ---------- UPI PAYMENT QR ---------- */
  upiId: "YOUR_UPI_ID",
  upiPayeeName: "Amigo Marketing",

  /* ---------- EMAILJS (sends the order + payment emails) ---------- *
   * A static website cannot send email on its own. EmailJS does it from
   * the browser. Free tier is enough for low volume.
   *
   * SETUP (about 10 minutes):
   *  1. Create a free account at https://www.emailjs.com
   *  2. Add an Email Service (Gmail works) -> copy the Service ID
   *  3. Create TWO email templates and copy their Template IDs:
   *
   *     Template A - "order_to_business"  (sent to YOU)
   *       Recipient: your business email
   *       Variables: {{order_id}} {{customer_name}} {{customer_phone}}
   *                  {{customer_email}} {{customer_address}} {{notes}}
   *                  {{order_items}} {{order_total}} {{order_date}}
   *
   *     Template B - "order_to_customer" (sent to the CUSTOMER, has the QR)
   *       Recipient: {{customer_email}}
   *       Variables: {{order_id}} {{customer_name}} {{order_items}}
   *                  {{order_total}} {{upi_id}} {{upi_link}} {{order_date}}
   *       Attach the QR: in the template's Attachments tab add a
   *       "Variable Attachment" with parameter name  qr_attachment
   *       (Most email clients block inline base64 images, which is why the
   *        QR is sent as an attachment and also shown on screen.)
   *
   *  4. Copy your Public Key from Account -> API Keys
   *  5. In EmailJS -> Account -> Security, restrict usage to your domain.
   *
   * NOTE: the public key is visible in this file by design. That is how
   * EmailJS works client-side. Restrict it to your domain so your quota
   * cannot be abused from other sites.
   */
  emailjs: {
    publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
    serviceId: "YOUR_EMAILJS_SERVICE_ID",
    businessTemplateId: "YOUR_EMAILJS_ORDER_TEMPLATE_ID",
    customerTemplateId: "YOUR_EMAILJS_CUSTOMER_TEMPLATE_ID"
  }
};

/**
 * True only when EmailJS has been fully configured.
 * When false the site falls back to a prefilled mailto: draft.
 */
function isEmailJsReady() {
  const e = AMIGO_CONFIG.emailjs;
  return (
    typeof emailjs !== "undefined" &&
    !e.publicKey.startsWith("YOUR_") &&
    !e.serviceId.startsWith("YOUR_") &&
    !e.businessTemplateId.startsWith("YOUR_")
  );
}

/** True only when a real UPI ID has been set and prices are configured. */
function isUpiReady() {
  return AMIGO_CONFIG.pricesConfigured && !AMIGO_CONFIG.upiId.startsWith("YOUR_");
}

/* ---------------------------------------------------------
   PLACEHOLDER GUARDS
   These stop the site from opening broken links (like the
   WhatsApp "404 This page doesn't exist" error) while the
   values above are still placeholders.
   --------------------------------------------------------- */

/**
 * Normalises the configured WhatsApp number into the international
 * digits-only form that wa.me requires.
 *
 * Handles: "8378008287", "+91 83780 08287", "08378008287",
 *          "918378008287", "91-8378008287"
 *
 * @returns {string|null} e.g. "918378008287", or null if unusable.
 */
function normalizeWhatsappNumber() {
  const raw = AMIGO_CONFIG.whatsappNumber;
  if (typeof raw !== "string" || raw.startsWith("YOUR_")) {
    return null;
  }

  let digits = raw.replace(/\D/g, "");      // strip +, spaces, dashes
  digits = digits.replace(/^0+/, "");        // strip any leading zeros
  if (!digits) return null;

  const cc = String(AMIGO_CONFIG.countryCode || "").replace(/\D/g, "");

  // Add the country code when only the local number was supplied.
  if (cc && digits.length === 10) {
    digits = cc + digits;
  }

  // wa.me numbers are between 11 and 15 digits once the code is included.
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

/** True when a usable WhatsApp number has been configured. */
function isWhatsappReady() {
  return normalizeWhatsappNumber() !== null;
}

/**
 * Normalises the phone number into "+<country><number>" form so the
 * tel: link works from any device, including international callers.
 * @returns {string|null}
 */
function normalizePhoneNumber() {
  const raw = AMIGO_CONFIG.phoneNumber;
  if (typeof raw !== "string" || raw.startsWith("YOUR_")) {
    return null;
  }

  let digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return null;

  const cc = String(AMIGO_CONFIG.countryCode || "").replace(/\D/g, "");
  if (cc && digits.length === 10) {
    digits = cc + digits;
  }

  return digits.length >= 10 ? "+" + digits : null;
}

/** True when a usable phone number has been configured. */
function isPhoneReady() {
  return normalizePhoneNumber() !== null;
}

/** True when a real business email has been set. */
function isOrderEmailReady() {
  const e = AMIGO_CONFIG.orderEmail;
  return typeof e === "string" && !e.startsWith("YOUR_") && e.includes("@");
}

const DEFAULT_WHATSAPP_MESSAGE =
  "Hello Amigo Marketing, I would like to know more about your car and bike cleaning products.";

/**
 * Builds a WhatsApp click-to-chat URL.
 * @returns {string|null} the URL, or null when no number is configured.
 */
function buildWhatsappLink(message) {
  const number = normalizeWhatsappNumber();
  if (!number) {
    return null;
  }
  const text = encodeURIComponent(message || DEFAULT_WHATSAPP_MESSAGE);
  return "https://wa.me/" + number + "?text=" + text;
}

/** Builds a Google Maps directions URL for the business address. */
function buildDirectionsLink() {
  return "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(AMIGO_CONFIG.businessAddress);
}

/**
 * Builds a tel: link.
 * @returns {string|null} the URL, or null when no number is configured.
 */
function buildCallLink() {
  const number = normalizePhoneNumber();
  return number ? "tel:" + number : null;
}

/**
 * Points a link at a URL, or disables it with an explanatory message
 * when the underlying config value is still a placeholder.
 */
function wireLinkOrWarn(el, url, warning) {
  if (!el) return;

  if (url) {
    el.setAttribute("href", url);
    el.classList.remove("link-unconfigured");
    return;
  }

  el.setAttribute("href", "#");
  el.removeAttribute("target");
  el.setAttribute("aria-disabled", "true");
  el.classList.add("link-unconfigured");
  el.addEventListener("click", function (e) {
    e.preventDefault();
    if (typeof showToast === "function") {
      showToast(warning, "warn");
    } else {
      alert(warning);
    }
  });
}

/** Formats a number as a currency string. */
function formatMoney(amount) {
  return AMIGO_CONFIG.currencySymbol + Number(amount).toFixed(2);
}
