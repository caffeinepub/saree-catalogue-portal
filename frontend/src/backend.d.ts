import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface WeaverProfile {
    logo: ExternalBlob;
    name: string;
    address: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface Customer {
    id: string;
    customerType: CustomerType;
    owner: Principal;
    city?: string;
    postalCode?: string;
    name: string;
    businessName?: string;
    state?: string;
    addressLine1?: string;
    contactNumber: string;
}
export interface CustomerForm {
    customerType: CustomerType;
    city?: string;
    postalCode?: string;
    name: string;
    businessName?: string;
    state?: string;
    addressLine1?: string;
    contactNumber: string;
}
export interface Color {
    hex: string;
    name: string;
}
export interface ProductForm {
    retailPrice: bigint;
    availableQuantity: bigint;
    name: string;
    wholesalePrice: bigint;
    description: string;
    stockCount: bigint;
    madeToOrder: boolean;
    directPrice: bigint;
    colors: Array<Color>;
    visibility: ProductVisibility;
    images: Array<ExternalBlob>;
}
export interface Product {
    id: bigint;
    retailPrice: bigint;
    owner: Principal;
    availableQuantity: bigint;
    name: string;
    wholesalePrice: bigint;
    description: string;
    stockCount: bigint;
    madeToOrder: boolean;
    directPrice: bigint;
    colors: Array<Color>;
    visibility: ProductVisibility;
    images: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
}
export enum CustomerType {
    retail = "retail",
    direct = "direct",
    wholesale = "wholesale"
}
export enum ProductVisibility {
    all = "all",
    wholesaleOnly = "wholesaleOnly",
    retailOnly = "retailOnly"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrUpdateCustomer(id: string, customerForm: CustomerForm): Promise<void>;
    addProduct(form: ProductForm): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateWeaverProfile(name: string, logo: ExternalBlob, address: string): Promise<void>;
    explicitSetStockCount(productId: bigint, newStockCount: bigint): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerProfile(): Promise<WeaverProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCatalogByCustomerType(customerType: CustomerType): Promise<Array<Product>>;
    getCatalogByWeaver(weaverPrincipal: Principal, customerType: CustomerType): Promise<Array<Product>>;
    getCustomer(id: string): Promise<Customer | null>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getMyProducts(): Promise<Array<Product>>;
    getProduct(productId: bigint, owner: Principal): Promise<Product | null>;
    getPublicCatalogNonAuthenticated(weaverPrincipal: Principal, targetType: CustomerType): Promise<Array<Product>>;
    getPublicProduct(productId: bigint, owner: Principal): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeCustomer(id: string): Promise<void>;
    removeProduct(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    toggleOutOfStock(productId: bigint): Promise<void>;
    updateProduct(id: bigint, form: ProductForm): Promise<void>;
    updateProductQuantity(productId: bigint, newQuantity: bigint): Promise<void>;
}
