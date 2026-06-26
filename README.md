# 🐾 Nona's Paws – Virtual Fitting Room

A Shopify embedded app that adds a **Virtual Try-On** button to product pages, letting customers see how accessories look on a model dog.

---

## Project structure

```
nonas-paws/
├── app/                              # Remix app (Shopify embedded app)
│   ├── db.server.js                  # Prisma client singleton
│   ├── shopify.server.js             # Shopify app config & auth
│   ├── root.jsx                      # App shell (Polaris + App Bridge)
│   └── routes/
│       ├── app.jsx                   # Authenticated app layout
│       ├── app._index.jsx            # Dashboard / setup page
│       ├── auth.$.jsx                # OAuth callback handler
│       └── api.generate-tryon.jsx   # ★ Core API endpoint
│
├── extensions/
│   └── virtual-tryon-block/          # Theme App Extension
│       ├── shopify.extension.toml
│       ├── blocks/
│       │   └── virtual-tryon.liquid  # ★ App block (button + modal)
│       ├── assets/
│       │   ├── virtual-tryon.css     # ★ Premium pink UI styles
│       │   └── virtual-tryon.js      # ★ Modal logic & API call
│       └── locales/
│           └── en.default.json
│
├── prisma/
│   └── schema.prisma                 # SQLite session storage
├── shopify.app.toml                  # App config
├── package.json
├── .env.example
└── README.md
```

---

## Getting started

### 1. Clone & install

```bash
git clone <this-repo>
cd nonas-paws
npm install
```

### 2. Create a Shopify Partner app

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Create a new app → **Remix** template
3. Copy your **API key** and **API secret**

### 3. Configure environment

```bash
cp .env.example .env
# Fill in SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL
```

Update `shopify.app.toml`:
- Set `client_id` to your API key
- Set `dev_store_url` to your dev store

### 4. Set up the database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start dev server

```bash
npm run dev
# Shopify CLI will tunnel and open your dev store
```

---

## Theme App Extension setup

After starting dev, install the extension on your store:

```bash
shopify app generate extension
# Choose: Theme app extension (already created)
```

Then in the Shopify Theme Editor:
1. Go to **Customize** → product page template
2. **Add block** → search "Virtual Try-On"
3. Set **API Base URL** in block settings → your Remix app URL

---

## Product metafields

Add these to your products for rich try-on data:

| Metafield key | Type | Purpose |
|---|---|---|
| `nonas_paws.product_type` | `single_line_text_field` | e.g. "Bandana", "Collar" |
| `nonas_paws.pattern_image` | `url` | Seamless pattern swatch URL |
| `nonas_paws.border_color` | `color` | Accent color (hex) |
| `nonas_paws.logo_color` | `color` | Logo overlay color (hex) |
| `nonas_paws.transparent_product_image` | `url` | Product PNG (transparent BG) |

---

## API: `POST /api/generate-tryon`

### Request

```json
{
  "dog": {
    "breed": "golden_retriever",
    "furColor": "golden"
  },
  "product": {
    "productId": "gid://shopify/Product/123",
    "productTitle": "Floral Bandana",
    "productType": "Bandana",
    "patternImage": "https://cdn.shopify.com/...",
    "borderColor": "#F9A8C9",
    "logoColor": "#FFFFFF",
    "transparentImg": "https://cdn.shopify.com/..."
  }
}
```

### Response (Phase 1 – placeholder)

```json
{
  "imageUrl": "https://picsum.photos/seed/np-10/600/600",
  "metadata": {
    "generationType": "placeholder",
    "breed": "golden_retriever",
    "furColor": "golden",
    "productId": "gid://shopify/Product/123",
    "generatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Supported breeds

`golden_retriever`, `labrador`, `poodle`, `french_bulldog`, `beagle`, `corgi`, `dachshund`, `shih_tzu`, `border_collie`, `german_shepherd`, `pomeranian`, `yorkshire_terrier`

### Supported fur colors

`golden`, `brown`, `black`, `cream`, `tan`, `grey`, `multi`

---

## Phase 2: Connect AI generation

In `app/routes/api.generate-tryon.jsx`:

1. Uncomment `buildAIResult()` and `buildPrompt()`
2. Add your provider's API key to `.env`
3. Replace the placeholder call:

```js
// Change this line:
const result = buildPlaceholderResult(body);

// To this:
const result = await buildAIResult(body);
```

### Recommended providers

| Provider | Best for | Notes |
|---|---|---|
| [Replicate](https://replicate.com) | SDXL, custom models | Good ControlNet support |
| [fal.ai](https://fal.ai) | Fast inference | Excellent for real-time |
| [Stability AI](https://stability.ai) | Fine-tuned dog models | API v2 |
| OpenAI DALL·E 3 | Simple prompts | Less controllable |

---

## Roadmap

- [x] Phase 1: Model dogs (breed + fur color selection)
- [ ] Phase 2: AI image generation
- [ ] Phase 3: Upload own dog photo
- [ ] Analytics dashboard (try-on → conversion tracking)
- [ ] More breeds & accessories

---

## License

MIT © Nona's Paws
