import { Outlet } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function AppLayout() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return boundary.error();
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
