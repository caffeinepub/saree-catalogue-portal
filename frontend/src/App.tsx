import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import PageLayout from "./components/PageLayout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import CatalogManagementPage from "./pages/CatalogManagementPage";
import CustomerManagementPage from "./pages/CustomerManagementPage";
import HomePage from "./pages/HomePage";
import PublicCatalogPage from "./pages/PublicCatalogPage";
import PublicProductDetailPage from "./pages/PublicProductDetailPage";
import ShareLinksPage from "./pages/ShareLinksPage";
import WeaverProfilePage from "./pages/WeaverProfilePage";

const queryClient = new QueryClient();

// Weaver layout with auth and profile setup
function WeaverLayout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <PageLayout>
      <Outlet />
      <ProfileSetupModal open={showProfileSetup} />
    </PageLayout>
  );
}

// Public layout — no auth, no guards, bare outlet
function PublicLayout() {
  return <Outlet />;
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Pathless layout routes
const weaverLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "weaver-layout",
  component: WeaverLayout,
});

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: PublicLayout,
});

// Weaver (authenticated) routes
const homeRoute = createRoute({
  getParentRoute: () => weaverLayoutRoute,
  path: "/",
  component: HomePage,
});

const profileRoute = createRoute({
  getParentRoute: () => weaverLayoutRoute,
  path: "/profile",
  component: WeaverProfilePage,
});

const catalogRoute = createRoute({
  getParentRoute: () => weaverLayoutRoute,
  path: "/catalog",
  component: CatalogManagementPage,
});

const customersRoute = createRoute({
  getParentRoute: () => weaverLayoutRoute,
  path: "/customers",
  component: CustomerManagementPage,
});

const shareLinksRoute = createRoute({
  getParentRoute: () => weaverLayoutRoute,
  path: "/share-links",
  component: ShareLinksPage,
});

// Public routes — no auth required
const publicCatalogRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/public-catalog/$weaverId/$customerType",
  component: PublicCatalogPage,
});

const publicProductRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/public-product/$weaverId/$productId/$customerType",
  component: PublicProductDetailPage,
});

const routeTree = rootRoute.addChildren([
  weaverLayoutRoute.addChildren([
    homeRoute,
    profileRoute,
    catalogRoute,
    customersRoute,
    shareLinksRoute,
  ]),
  publicLayoutRoute.addChildren([publicCatalogRoute, publicProductRoute]),
]);

// Hash-based history so share links (#/public-catalog/...) work without server routing
const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
