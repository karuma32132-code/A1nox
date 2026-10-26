# A1NOXHUB — Ultimate Bangladesh E-Commerce Platform

> **Brand:** A1NOXHUB  
> **Tagline:** Premium Products, Better Living.  
> **Official Domain:** `a1noxhub.com` (Registered with Namecheap)  
> **Target Market:** Bangladesh (64 Districts)  
> **Currency:** BDT (৳)  
> **Languages:** English & Bengali (বাংলা)  

---

## 🌟 Key Architecture & Highlights

- **Visual Reference Replication:** Crafted in exact accordance with the reference design mockup—featuring a bold white-and-red brand theme, charcoal typography, smooth category slider with snap scrolling, promotional hero banners, and four trust badges.
- **Bangladesh Delivery System:**
  - Automated selection for **Inside Dhaka** (default ৳60) and **Outside Dhaka** (default ৳120).
  - Dynamic **Free Home Delivery Threshold** at **৳1,000** (admin configurable).
  - Live remaining spend notification: `"আর ৳... টাকার পণ্য কিনলেই ফ্রি হোম ডেলিভারি!"` with real-time visual progress bar.
- **Bangladesh Payment Integrations:**
  - **Cash on Delivery (COD)** across all 64 districts.
  - **bKash & Nagad** mobile banking integration with interactive merchant copy, SMS Transaction ID (TrxID) input, and admin reconciliation.
- **Meta Pixel & Conversions API (CAPI):**
  - Integrated standard events: `PageView`, `ViewContent`, `Search`, `AddToCart`, `InitiateCheckout`, and verified `Purchase`.
  - Automatic `event_id` generation for browser Pixel and server-side Conversions API deduplication.
  - Admin diagnostics console in **Marketing > Meta Pixel** with live event payloads and test logs.
- **Smart Profit & Loss Calculator (Admin):**
  - Live calculations for selling price, sourcing cost, advertising CPA, packaging, courier delivery expenses, return/cancellation rate losses, ROAS, and net realized profit.
  - One-click CSV report export for business analytics.
- **Database & Authentication:**
  - Real Google Sign-in with **Firebase Authentication**.
  - **Cloud Firestore** persistent database with ABAC Zero-Trust security rules (`firestore.rules`) and intermediate representation (`firebase-blueprint.json`).
  - Bootstrapped admin privileges for `armanhossen150@gmail.com`.

---

## 🚀 Getting Started (Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to view the storefront.

### 3. Build for Production
```bash
npm run build
```

---

## 🛡️ Admin Account Provisioning & Access

1. Open the storefront and click on **Account > Sign in with Google** using `armanhossen150@gmail.com`.
2. Click **Admin Panel** in the top navigation or account dropdown.
3. If reviewing before live sign-in, click **"Toggle Admin Preview Mode"** in the account menu for instant full access to the Dashboard, Products CRUD, Orders, Meta Pixel, and Delivery Settings.

---

## 🌐 Connecting your Namecheap Domain (`a1noxhub.com`)

The domain `a1noxhub.com` is registered on Namecheap without hosting. Follow these instructions to point it to your live hosting provider (e.g. Google Cloud Run, Vercel, or custom server):

1. **Log in to Namecheap:** Go to `namecheap.com` > **Dashboard** > find `a1noxhub.com` > click **Manage**.
2. **Nameservers:** Ensure **Namecheap BasicDNS** is selected.
3. **Advanced DNS Tab:**
   - Click on the **Advanced DNS** tab.
   - For Cloud Run / Custom Hosting:
     - Add an **A Record**:
       - **Host:** `@`
       - **Value:** `<YOUR_HOSTING_IP_ADDRESS>` (provided by your hosting provider)
       - **TTL:** Automatic or 30 min
     - Add a **CNAME Record**:
       - **Host:** `www`
       - **Value:** `a1noxhub.com` or `<HOSTING_SUBDOMAIN>`
       - **TTL:** Automatic
4. **SSL / HTTPS:**
   - Once DNS propagates (typically 15-60 minutes), the hosting platform automatically issues a free Let's Encrypt SSL certificate for both `a1noxhub.com` and `www.a1noxhub.com`.
5. **DNS Propagation Check:**
   - Use `https://dnschecker.org/#A/a1noxhub.com` to verify global record propagation.

---

## 📈 Meta Pixel & Conversions API Setup

1. In the Admin Dashboard, go to **Meta Pixel & CAPI**.
2. Enter your **Meta Pixel ID** (from Meta Events Manager > Data Sources).
3. (Optional) Provide your server-side **Conversions API Access Token**.
4. Toggle **Enable Tracking**.
5. Test standard customer actions on the storefront (e.g. view a watch, add to bag, checkout) and observe the events streaming into the **Live Event Diagnostics** table with matching `event_id` tokens.

---

## 🇧🇩 Configuring Delivery Fees & Free Shipping

To update delivery fees or threshold without code changes:
1. Open Admin Panel > **Store & Delivery**.
2. Change **Free Home Delivery Threshold** (default: `1000`).
3. Change **Inside Dhaka Delivery Fee** (default: `60`) or **Outside Dhaka** (default: `120`).
4. Click **Save All Store Settings**. The storefront immediately recalculates cart requirements and threshold notifications.
