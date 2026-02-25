import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { createActorWithConfig } from '../config';
import type { ProductForm, CustomerForm, UserProfile, WeaverProfile, CustomerType, ExternalBlob } from '../backend';

// ─── Auth / Profile ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Weaver Profile ───────────────────────────────────────────────────────────

export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WeaverProfile | null>({
    queryKey: ['callerProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOrUpdateWeaverProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      logo,
      address,
    }: {
      name: string;
      logo: ExternalBlob;
      address: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateWeaverProfile(name, logo, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerProfile'] });
    },
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useGetMyProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['myProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: ProductForm) => {
      if (!actor) throw new Error('Actor not available. Please make sure you are logged in.');
      try {
        const productId = await actor.addProduct(form);
        return productId;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('addProduct backend error:', message);
        throw new Error(message || 'Failed to add product. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, form }: { id: bigint; form: ProductForm }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateProduct(id, form);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('updateProduct backend error:', message);
        throw new Error(message || 'Failed to update product. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
    },
  });
}

export function useRemoveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
    },
  });
}

export function useToggleOutOfStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleOutOfStock(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
    },
  });
}

export function useUpdateProductQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, newQuantity }: { productId: bigint; newQuantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProductQuantity(productId, newQuantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
    },
  });
}

// ─── Public Catalog (no auth) ─────────────────────────────────────────────────

export function useGetPublicCatalog(weaverPrincipal: string | null, customerType: CustomerType | null) {
  return useQuery({
    queryKey: ['publicCatalog', weaverPrincipal, customerType],
    queryFn: async () => {
      if (!weaverPrincipal || !customerType) return [];
      const { Principal } = await import('@dfinity/principal');
      const actor = await createActorWithConfig();
      return actor.getCatalogByWeaver(Principal.fromText(weaverPrincipal), customerType);
    },
    enabled: !!weaverPrincipal && !!customerType,
  });
}

export function useGetPublicProduct(productId: bigint | null, ownerPrincipal: string | null) {
  return useQuery({
    queryKey: ['publicProduct', productId?.toString(), ownerPrincipal],
    queryFn: async () => {
      if (productId === null || !ownerPrincipal) return null;
      const { Principal } = await import('@dfinity/principal');
      const actor = await createActorWithConfig();
      return actor.getPublicProduct(productId, Principal.fromText(ownerPrincipal));
    },
    enabled: productId !== null && !!ownerPrincipal,
  });
}

// ─── Customers ────────────────────────────────────────────────────────────────

export function useGetAllCustomers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allCustomers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllCustomers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddOrUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customerForm }: { id: string; customerForm: CustomerForm }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrUpdateCustomer(id, customerForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCustomers'] });
    },
  });
}

export function useRemoveCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCustomers'] });
    },
  });
}
