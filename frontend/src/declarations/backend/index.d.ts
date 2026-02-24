import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Color {
  hex: string;
  name: string;
}

export interface Customer {
  id: string;
  customerType: CustomerType;
  owner: Principal;
  name: string;
  contactDetails: string;
}

export type CustomerType = { retail: null } | { direct: null } | { wholesale: null };

export type ExternalBlob = Uint8Array<ArrayBufferLike>;

export interface Product {
  id: bigint;
  retailPrice: bigint;
  owner: Principal;
  availableQuantity: bigint;
  name: string;
  wholesalePrice: bigint;
  description: string;
  madeToOrder: boolean;
  directPrice: bigint;
  colors: Array<Color>;
  visibility: ProductVisibility;
  images: Array<ExternalBlob>;
}

export interface ProductForm {
  retailPrice: bigint;
  availableQuantity: bigint;
  name: string;
  wholesalePrice: bigint;
  description: string;
  madeToOrder: boolean;
  directPrice: bigint;
  colors: Array<Color>;
  visibility: ProductVisibility;
  images: Array<ExternalBlob>;
}

export type ProductVisibility =
  | { all: null }
  | { wholesaleOnly: null }
  | { retailOnly: null };

export interface UserProfile {
  name: string;
}

export type UserRole = { admin: null } | { guest: null } | { user: null };

export interface WeaverProfile {
  logo: ExternalBlob;
  name: string;
  address: string;
}

export interface _SERVICE {
  addOrUpdateCustomer: ActorMethod<[string, string, CustomerType, string], undefined>;
  addProduct: ActorMethod<[ProductForm], bigint>;
  assignCallerUserRole: ActorMethod<[Principal, UserRole], undefined>;
  createOrUpdateWeaverProfile: ActorMethod<[string, ExternalBlob, string], undefined>;
  getAllCustomers: ActorMethod<[], Array<Customer>>;
  getCallerProfile: ActorMethod<[], [] | [WeaverProfile]>;
  getCallerUserProfile: ActorMethod<[], [] | [UserProfile]>;
  getCallerUserRole: ActorMethod<[], UserRole>;
  getCatalogByCustomerType: ActorMethod<[CustomerType], Array<Product>>;
  getCatalogByWeaver: ActorMethod<[Principal, CustomerType], Array<Product>>;
  getCustomer: ActorMethod<[string], [] | [Customer]>;
  getMyProducts: ActorMethod<[], Array<Product>>;
  getProduct: ActorMethod<[bigint, Principal], [] | [Product]>;
  getPublicCatalog: ActorMethod<[Principal, CustomerType], Array<Product>>;
  getPublicProduct: ActorMethod<[bigint, Principal], [] | [Product]>;
  getUserProfile: ActorMethod<[Principal], [] | [UserProfile]>;
  isCallerAdmin: ActorMethod<[], boolean>;
  markOutOfStock: ActorMethod<[bigint], undefined>;
  removeCustomer: ActorMethod<[string], undefined>;
  removeProduct: ActorMethod<[bigint], undefined>;
  saveCallerUserProfile: ActorMethod<[UserProfile], undefined>;
  updateProduct: ActorMethod<[bigint, ProductForm], undefined>;
  _initializeAccessControlWithSecret: ActorMethod<[string], undefined>;
}
