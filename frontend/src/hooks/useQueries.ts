import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import {
  Product,
  ProductForm,
  CustomerType,
  CustomerForm,
  Customer,
  WeaverProfile,
  UserProfile,
  ExternalBlob,
} from "../backend";
import { Principal } from "@dfinity/principal";
import { createActorWithConfig } from "../config";

// ─── Public queries (no auth required, use anonymous actor directly) ──────────

/**
 * Fetch public catalog — creates its own anonymous actor, no auth dependency.
 */
export function useGetPublicCatalog(
  weaverPrincipal: Principal | null,
  customerType: CustomerType
) {
  return useQuery<Product[]>({
    queryKey: ["publicCatalog", weaverPrincipal?.toString(), customerType],
    queryFn: async () => {
      if (!weaverPrincipal) return [];
      const actor = await createActorWithConfig();
      return actor.getPublicCatalogNonAuthenticated(weaverPrincipal, customerType);
    },
    enabled: !!weaverPrincipal,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a single public product — creates its own anonymous actor, no auth dependency.
 */
export function useGetPublicProduct(
  weaverPrincipal: Principal | null,
  productId: bigint
) {
  return useQuery<Product | null>({
    queryKey: [
      "publicProduct",
      weaverPrincipal?.toString(),
      productId.toString(),
    ],
    queryFn: async () => {
      if (!weaverPrincipal) return null;
      const actor = await createActorWithConfig();
      return actor.getPublicProduct(productId, weaverPrincipal);
    },
    enabled: !!weaverPrincipal && productId > 0n,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Auth-required queries ────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WeaverProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
      if (!actor) throw new Error("Actor not available");
      return actor.createOrUpdateWeaverProfile(name, logo, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useGetMyProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ["myProducts"],
    queryFn: async () => {
      if (!actor) return [];
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
      if (!actor) throw new Error("Actor not available");
      return actor.addProduct(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, form }: { id: bigint; form: ProductForm }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProduct(id, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
}

export function useRemoveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
}

export function useToggleOutOfStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleOutOfStock(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
}

export function useGetAllCustomers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ["allCustomers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddOrUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      customerForm,
    }: {
      id: string;
      customerForm: CustomerForm;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addOrUpdateCustomer(id, customerForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCustomers"] });
    },
  });
}

export function useRemoveCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCustomers"] });
    },
  });
}
