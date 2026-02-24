import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider, useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import ProfileSetupModal from './components/ProfileSetupModal';
import PageLayout from './components/PageLayout';
import HomePage from './pages/HomePage';
import WeaverProfilePage from './pages/WeaverProfilePage';
import CatalogManagementPage from './pages/CatalogManagementPage';
import ShareLinksPage from './pages/ShareLinksPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import PublicCatalogPage from './pages/PublicCatalogPage';
import PublicProductDetailPage from './pages/PublicProductDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageLayout>
        <Outlet />
      </PageLayout>
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: WeaverProfilePage,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogManagementPage,
});

const shareLinksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/share-links',
  component: ShareLinksPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomerManagementPage,
});

const publicCatalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/public/$weaverId/$customerType',
  component: PublicCatalogPage,
});

const publicProductDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/public/$weaverId/$productId',
  component: PublicProductDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  catalogRoute,
  shareLinksRoute,
  customersRoute,
  publicCatalogRoute,
  publicProductDetailRoute,
]);

const router = createRouter({ 
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <RouterProvider router={router} />
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}
