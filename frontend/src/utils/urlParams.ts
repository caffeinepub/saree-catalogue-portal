/**
 * Utility functions for parsing and managing URL parameters
 * Works with both hash-based and browser-based routing
 */

import { CustomerType } from '../backend';

/**
 * Extracts a URL parameter from the current URL
 * Works with both query strings (?param=value) and hash-based routing (#/?param=value)
 */
export function getUrlParameter(paramName: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const regularParam = urlParams.get(paramName);
  if (regularParam !== null) return regularParam;

  const hash = window.location.hash;
  const queryStartIndex = hash.indexOf('?');
  if (queryStartIndex !== -1) {
    const hashQuery = hash.substring(queryStartIndex + 1);
    const hashParams = new URLSearchParams(hashQuery);
    return hashParams.get(paramName);
  }

  return null;
}

/**
 * Stores a parameter in sessionStorage for persistence across navigation
 */
export function storeSessionParameter(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to store session parameter ${key}:`, error);
  }
}

/**
 * Retrieves a parameter from sessionStorage
 */
export function getSessionParameter(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to retrieve session parameter ${key}:`, error);
    return null;
  }
}

/**
 * Gets a parameter from URL or sessionStorage (URL takes precedence)
 */
export function getPersistedUrlParameter(paramName: string, storageKey?: string): string | null {
  const key = storageKey || paramName;
  const urlValue = getUrlParameter(paramName);
  if (urlValue !== null) {
    storeSessionParameter(key, urlValue);
    return urlValue;
  }
  return getSessionParameter(key);
}

/**
 * Removes a parameter from sessionStorage
 */
export function clearSessionParameter(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to clear session parameter ${key}:`, error);
  }
}

/**
 * Removes a specific parameter from the URL hash without reloading the page
 */
function clearParamFromHash(paramName: string): void {
  if (!window.history.replaceState) return;

  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;

  const hashContent = hash.substring(1);
  const queryStartIndex = hashContent.indexOf('?');
  if (queryStartIndex === -1) return;

  const routePath = hashContent.substring(0, queryStartIndex);
  const queryString = hashContent.substring(queryStartIndex + 1);

  const params = new URLSearchParams(queryString);
  params.delete(paramName);

  const newQueryString = params.toString();
  let newHash = routePath;
  if (newQueryString) newHash += '?' + newQueryString;

  const newUrl =
    window.location.pathname +
    window.location.search +
    (newHash ? '#' + newHash : '');
  window.history.replaceState(null, '', newUrl);
}

/**
 * Gets a secret from the URL hash fragment only (more secure than query params)
 */
export function getSecretFromHash(paramName: string): string | null {
  const existingSecret = getSessionParameter(paramName);
  if (existingSecret !== null) return existingSecret;

  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return null;

  const hashContent = hash.substring(1);
  const params = new URLSearchParams(hashContent);
  const secret = params.get(paramName);

  if (secret) {
    storeSessionParameter(paramName, secret);
    clearParamFromHash(paramName);
    return secret;
  }

  return null;
}

/**
 * Gets a secret parameter with fallback chain: hash -> sessionStorage
 */
export function getSecretParameter(paramName: string): string | null {
  return getSecretFromHash(paramName);
}

/**
 * Parses a CustomerType string into the CustomerType enum
 */
export function parseCustomerType(raw: string): CustomerType {
  if (raw === 'wholesale') return CustomerType.wholesale;
  if (raw === 'direct') return CustomerType.direct;
  return CustomerType.retail;
}

/**
 * Builds a hash-based share URL for a weaver's public catalog
 */
export function buildCatalogShareUrl(weaverId: string, customerType: CustomerType): string {
  const customerTypeStr =
    customerType === CustomerType.wholesale
      ? 'wholesale'
      : customerType === CustomerType.direct
      ? 'direct'
      : 'retail';
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/public-catalog/${encodeURIComponent(weaverId)}/${customerTypeStr}`;
}

/**
 * Builds a hash-based share URL for a specific public product
 */
export function buildProductShareUrl(
  weaverId: string,
  productId: bigint | string | number,
  customerType: CustomerType
): string {
  const customerTypeStr =
    customerType === CustomerType.wholesale
      ? 'wholesale'
      : customerType === CustomerType.direct
      ? 'direct'
      : 'retail';
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/public-product/${encodeURIComponent(weaverId)}/${productId}/${customerTypeStr}`;
}
