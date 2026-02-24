# Specification

## Summary
**Goal:** Deploy the Weaver Catalog application to Internet Computer mainnet canister for production use.

**Planned changes:**
- Configure dfx.json with backend (Motoko) and frontend (React) canister definitions
- Set up frontend build process to generate Candid declarations and canister ID environment variables
- Ensure backend main.mo uses stable variables for state persistence across upgrades
- Remove GitHub Pages deployment configuration (.github/workflows/deploy.yml and .nojekyll)
- Update frontend routing and asset paths to use relative paths compatible with IC canister environment

**User-visible outcome:** The application will be accessible on the Internet Computer mainnet with a canister URL, allowing users to access the weaving catalog and customer management features in production.
