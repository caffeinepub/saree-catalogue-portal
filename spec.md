# Specification

## Summary
**Goal:** Make public catalog and product detail pages fully accessible without authentication, and hide owner-only controls (like the "Add Product" button) from customer-facing views.

**Planned changes:**
- Remove authentication guards from the router for public catalog and product detail pages so anonymous users are not redirected to login
- Ensure backend queries for public catalog and product data allow anonymous callers without requiring authentication
- Hide the "Add Product" button (and any other owner-only controls such as edit, delete, stock toggle) on the public/customer-facing catalog page
- Retain all existing controls including the "Add Product" button on the weaver-facing catalog management page

**User-visible outcome:** Customers can visit shared catalog or product links directly without being prompted to log in, and will not see owner-only controls like the "Add Product" button on the catalog page.
