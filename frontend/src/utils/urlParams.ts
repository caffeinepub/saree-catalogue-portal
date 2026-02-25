/**
 * URL parameter utilities for catalog share links.
 * All public share links use hash-based routing (#/public-catalog/... and #/public-product/...).
 */

import { CustomerType } from "../backend";

/**
 * Build a catalog share URL for a given weaver and customer type.
 * Uses hash-based routing so the link works without server-side routing.
 */
export function buildCatalogShareUrl(
  weaverId: string,
  customerType: CustomerType
): string {
  const ctStr =
    customerType === CustomerType.wholesale
      ? "wholesale"
      : customerType === CustomerType.direct
      ? "direct"
      : "retail";
  const base = window.location.origin + window.location.pathname;
  return `${base}#/public-catalog/${weaverId}/${ctStr}`;
}

/**
 * Build a product share URL for a given weaver, product, and customer type.
 */
export function buildProductShareUrl(
  weaverId: string,
  productId: bigint,
  customerType: CustomerType
): string {
  const ctStr =
    customerType === CustomerType.wholesale
      ? "wholesale"
      : customerType === CustomerType.direct
      ? "direct"
      : "retail";
  const base = window.location.origin + window.location.pathname;
  return `${base}#/public-product/${weaverId}/${productId}/${ctStr}`;
}

/**
 * Parse the customer type string from URL params.
 */
export function parseCustomerType(raw: string): CustomerType {
  if (raw === "wholesale") return CustomerType.wholesale;
  if (raw === "direct") return CustomerType.direct;
  return CustomerType.retail;
}

/**
 * Get a secret parameter from the URL (used by useActor for admin initialization).
 * Reads from URL search params or hash query string.
 */
export function getSecretParameter(key: string): string | null {
  // Check search params first
  const searchParams = new URLSearchParams(window.location.search);
  const fromSearch = searchParams.get(key);
  if (fromSearch) return fromSearch;

  // Check hash query string (e.g., #/path?key=value)
  const hash = window.location.hash;
  if (hash && hash.includes("?")) {
    const hashQuery = hash.split("?")[1];
    const hashParams = new URLSearchParams(hashQuery);
    return hashParams.get(key);
  }

  return null;
}
