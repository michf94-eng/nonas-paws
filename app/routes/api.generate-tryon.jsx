/**
 * POST /api/generate-tryon
 *
 * Accepts dog + product data, returns a try-on image URL.
 *
 * Phase 1 (MVP): Returns a placeholder composite image.
 * Phase 2: Swap buildPlaceholderResult() for your AI generation call
 *          (Replicate, fal.ai, OpenAI DALL·E, Stability AI, etc.)
 *
 * This route is public — no Shopify session needed.
 * Add CORS headers so it can be called from any storefront domain.
 */

import { json } from "@remix-run/node";

// ─── Config ─────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  // Add your Shopify store URLs here
  "https://your-store.myshopify.com",
  "https://www.your-custom-domain.com",
  // During dev, also allow:
  "http://localhost:3000",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ─── Validation ──────────────────────────────────────────────────────────────

const VALID_BREEDS = new Set([
  "golden_retriever", "labrador", "poodle", "french_bulldog",
  "beagle", "corgi", "dachshund", "shih_tzu",
  "border_collie", "german_shepherd", "pomeranian", "yorkshire_terrier",
]);

const VALID_FUR_COLORS = new Set([
  "golden", "brown", "black", "cream", "tan", "grey", "multi",
]);

function validatePayload(body) {
  const errors = [];

  if (!body?.dog?.breed) {
    errors.push("dog.breed is required");
  } else if (!VALID_BREEDS.has(body.dog.breed)) {
    errors.push(`Invalid breed: ${body.dog.breed}`);
  }

  if (!body?.dog?.furColor) {
    errors.push("dog.furColor is required");
  } else if (!VALID_FUR_COLORS.has(body.dog.furColor)) {
    errors.push(`Invalid furColor: ${body.dog.furColor}`);
  }

  if (!body?.product?.productId) {
    errors.push("product.productId is required");
  }

  return errors;
}

// ─── Placeholder generation (Phase 1) ────────────────────────────────────────
// Generates a deterministic placeholder image from Picsum using the
// product + dog combo. Replace this function with real AI in Phase 2.

const BREED_SEED_MAP = {
  golden_retriever: 10,
  labrador:         20,
  poodle:           30,
  french_bulldog:   40,
  beagle:           50,
  corgi:            60,
  dachshund:        70,
  shih_tzu:         80,
  border_collie:    90,
  german_shepherd:  100,
  pomeranian:       110,
  yorkshire_terrier: 120,
};

const FUR_SEED_OFFSET = {
  golden: 0,
  brown:  1,
  black:  2,
  cream:  3,
  tan:    4,
  grey:   5,
  multi:  6,
};

function buildPlaceholderResult({ dog, product }) {
  const breedSeed  = BREED_SEED_MAP[dog.breed]    ?? 10;
  const furOffset  = FUR_SEED_OFFSET[dog.furColor] ?? 0;
  const seed       = breedSeed + furOffset;

  // Placeholder: a 600×600 image from Picsum
  const imageUrl = `https://picsum.photos/seed/np-${seed}/600/600`;

  return {
    imageUrl,
    metadata: {
      generationType: "placeholder",
      breed:          dog.breed,
      furColor:       dog.furColor,
      productId:      product.productId,
      productTitle:   product.productTitle,
      generatedAt:    new Date().toISOString(),
    },
  };
}

// ─── Phase 2 stub (AI generation) ────────────────────────────────────────────
// Uncomment and implement this when connecting to an AI image API.
//
// async function buildAIResult({ dog, product }) {
//   const prompt = buildPrompt(dog, product);
//
//   // Example: Replicate (SDXL, etc.)
//   const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
//     method: "POST",
//     headers: {
//       Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       version: "YOUR_MODEL_VERSION_HERE",
//       input: {
//         prompt,
//         product_image: product.transparentImg,
//         dog_breed:     dog.breed,
//         fur_color:     dog.furColor,
//       },
//     }),
//   });
//   const prediction = await replicateRes.json();
//   // ... poll for result or use webhook ...
//   return { imageUrl: prediction.output[0] };
// }
//
// function buildPrompt(dog, product) {
//   return [
//     `A cute ${dog.furColor} ${dog.breed} dog wearing a ${product.productType}`,
//     `from Nona's Paws pet accessories brand.`,
//     `Product name: "${product.productTitle}".`,
//     `Studio photo, soft lighting, white background, photorealistic.`,
//   ].join(" ");
// }

// ─── Route handlers ──────────────────────────────────────────────────────────

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const isAllowed =
    process.env.NODE_ENV === "development" ||
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o));

  return {
    ...CORS_HEADERS,
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
  };
}

// Handle CORS preflight
export async function loader({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

export async function action({ request }) {
  const corsHeaders = getCorsHeaders(request);

  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return json(
      { error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Validate
  const errors = validatePayload(body);
  if (errors.length > 0) {
    return json(
      { error: "Validation failed", details: errors },
      { status: 422, headers: corsHeaders }
    );
  }

  // Generate
  try {
    // Phase 1: placeholder
    const result = buildPlaceholderResult(body);

    // Phase 2: swap to AI
    // const result = await buildAIResult(body);

    return json(result, { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error("[generate-tryon] Generation error:", err);
    return json(
      { error: "Generation failed", message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
