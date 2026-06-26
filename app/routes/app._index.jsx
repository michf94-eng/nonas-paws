import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Banner,
  List,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function Index() {
  const { shop } = useLoaderData();

  return (
    <Page title="Nona's Paws – Virtual Fitting Room">
      <Layout>
        <Layout.Section>
          <Banner
            title="🐾 Virtual Fitting Room is ready!"
            status="success"
          >
            <p>
              Your app is installed on <strong>{shop}</strong>. Add the{" "}
              <em>Virtual Try-On</em> block to any product page template in the
              Theme Editor to get started.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Setup checklist</Text>
              <List type="number">
                <List.Item>
                  Go to <strong>Online Store → Themes → Customize</strong>
                </List.Item>
                <List.Item>
                  Navigate to a <strong>Product page</strong> template
                </List.Item>
                <List.Item>
                  Click <strong>Add block</strong> and select{" "}
                  <em>Virtual Try-On</em>
                </List.Item>
                <List.Item>
                  Enter your <strong>API Base URL</strong> in the block settings
                </List.Item>
                <List.Item>
                  Optionally configure metafields:{" "}
                  <code>nonas_paws.transparent_product_image</code>,{" "}
                  <code>nonas_paws.border_color</code>, etc.
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Product metafields</Text>
              <Text as="p" color="subdued">
                Add these metafields to your products for richer try-on results:
              </Text>
              <BlockStack gap="200">
                {[
                  { key: "nonas_paws.product_type",               type: "single_line_text_field", desc: "e.g. Bandana, Collar, Bow Tie" },
                  { key: "nonas_paws.pattern_image",              type: "url",                     desc: "URL to a seamless pattern swatch" },
                  { key: "nonas_paws.border_color",               type: "color",                   desc: "Accent/border hex color" },
                  { key: "nonas_paws.logo_color",                 type: "color",                   desc: "Logo overlay hex color" },
                  { key: "nonas_paws.transparent_product_image",  type: "url",                     desc: "PNG with transparent background" },
                ].map(({ key, type, desc }) => (
                  <InlineStack key={key} gap="200" align="start" blockAlign="center" wrap={false}>
                    <Badge><code>{key}</code></Badge>
                    <Text as="span" color="subdued">{type} — {desc}</Text>
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Phase 2: Connect AI generation</Text>
              <Text as="p">
                The app currently returns placeholder images. To enable real
                AI try-ons, update{" "}
                <code>app/routes/api.generate-tryon.jsx</code> and replace{" "}
                <code>buildPlaceholderResult()</code> with your image
                generation provider (Replicate, fal.ai, DALL·E, Stability AI,
                etc.). The prompt builder stub is already included.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
