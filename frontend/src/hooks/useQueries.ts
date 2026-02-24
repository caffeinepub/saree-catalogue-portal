import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Product, ProductForm, Customer, CustomerType, WeaverProfile, UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

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
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<WeaverProfile | null>({
    queryKey: ['weaverProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWeaverProfile(weaverPrincipal: Principal | undefined) {
  const { actor } = useActor();

  return useQuery<WeaverProfile | null>({
    queryKey: ['weaverProfile', weaverPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !weaverPrincipal) return null;
      return actor.getCallerProfile();
    },
    enabled: !!actor && !!weaverPrincipal,
  });
}

export function useCreateOrUpdateWeaverProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; logo: any; address: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateWeaverProfile(data.name, data.logo, data.address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weaverProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

export function useGetMyProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['myProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: ProductForm) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Product added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, form }: { id: bigint; form: ProductForm }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(id, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
}

export function useUpdateProductQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const products = await actor.getMyProducts();
      const product = products.find((p) => p.id === id);
      if (!product) throw new Error('Product not found');

      const form: ProductForm = {
        name: product.name,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        directPrice: product.directPrice,
        images: product.images,
        description: product.description,
        visibility: product.visibility,
        availableQuantity: quantity,
        madeToOrder: product.madeToOrder,
        colors: product.colors,
      };

      return actor.updateProduct(id, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Quantity updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update quantity: ${error.message}`);
    },
  });
}

export function useToggleStockStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, inStock }: { id: bigint; inStock: boolean }) => {
      if (!actor) throw new Error('Actor not available');

      if (!inStock) {
        return actor.markOutOfStock(id);
      } else {
        const products = await actor.getMyProducts();
        const product = products.find((p) => p.id === id);
        if (!product) throw new Error('Product not found');

        const form: ProductForm = {
          name: product.name,
          retailPrice: product.retailPrice,
          wholesalePrice: product.wholesalePrice,
          directPrice: product.directPrice,
          images: product.images,
          description: product.description,
          visibility: product.visibility,
          availableQuantity: 1n,
          madeToOrder: product.madeToOrder,
          colors: product.colors,
        };

        return actor.updateProduct(id, form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Stock status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update stock status: ${error.message}`);
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
      toast.success('Product removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove product: ${error.message}`);
    },
  });
}

export function useMarkOutOfStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markOutOfStock(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Product marked as out of stock');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark product as out of stock: ${error.message}`);
    },
  });
}

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOrUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; customerType: CustomerType; contactDetails: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrUpdateCustomer(data.id, data.name, data.customerType, data.contactDetails);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save customer: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove customer: ${error.message}`);
    },
  });
}

export function useGetPublicProduct(productId: bigint | undefined, owner: Principal | undefined) {
  const { actor } = useActor();

  return useQuery<Product | null>({
    queryKey: ['publicProduct', productId?.toString(), owner?.toString()],
    queryFn: async () => {
      if (!actor || !productId || !owner) return null;
      return actor.getPublicProduct(productId, owner);
    },
    enabled: !!actor && !!productId && !!owner,
  });
}
