import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  public type CustomerType = {
    #retail;
    #wholesale;
    #direct;
  };

  public type ProductVisibility = {
    #retailOnly;
    #wholesaleOnly;
    #all;
  };

  public type Color = { name : Text; hex : Text };

  public type Product = {
    id : Nat;
    owner : Principal;
    name : Text;
    retailPrice : Nat;
    wholesalePrice : Nat;
    directPrice : Nat;
    images : [Storage.ExternalBlob];
    description : Text;
    visibility : ProductVisibility;
    stockCount : Nat;
    availableQuantity : Nat;
    madeToOrder : Bool;
    colors : [Color];
  };

  public type Customer = {
    id : Text;
    owner : Principal;
    name : Text;
    businessName : ?Text;
    contactNumber : Text;
    addressLine1 : ?Text;
    city : ?Text;
    state : ?Text;
    postalCode : ?Text;
    customerType : CustomerType;
  };

  public type WeaverProfile = {
    name : Text;
    logo : Storage.ExternalBlob;
    address : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type OldActor = {
    products : Map.Map<Principal, Map.Map<Nat, Product>>;
    customerDetails : Map.Map<Text, Customer>;
    weaverProfiles : Map.Map<Principal, WeaverProfile>;
    userProfiles : Map.Map<Principal, UserProfile>;
    productCounters : Map.Map<Principal, Nat>;
  };

  public type NewActor = {
    products : Map.Map<Principal, Map.Map<Nat, Product>>;
    customerDetails : Map.Map<Text, Customer>;
    weaverProfiles : Map.Map<Principal, WeaverProfile>;
    userProfiles : Map.Map<Principal, UserProfile>;
    productCounters : Map.Map<Principal, Nat>;
    nextProductId : Map.Map<Principal, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    { old with nextProductId = Map.empty<Principal, Nat>() };
  };
};
