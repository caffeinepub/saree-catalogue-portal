# Specification

## Summary
**Goal:** Fix the "failed to add product" error on the Catalog Management page so that weavers can successfully add new products.

**Planned changes:**
- Diagnose and fix the bug causing the "failed to add product" error when submitting the Add Product form
- Ensure the form submission correctly calls the backend and persists the new product
- Surface meaningful error messages if a backend error occurs instead of a generic failure
- Close the product form on successful submission and display the new product in the catalog grid

**User-visible outcome:** Weavers can click "Add Product", fill out the form, and successfully save a new product without encountering an error — the product will appear in the catalog immediately after submission.
