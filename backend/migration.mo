import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type WeaverProfile = {
    name : Text;
    logo : Storage.ExternalBlob;
    address : Text;
  };

  type CustomerType = {
    #retail;
    #wholesale;
    #direct;
  };

  type ProductVisibility = {
    #retailOnly;
    #wholesaleOnly;
    #all;
  };

  type Color = { name : Text; hex : Text };

  type Product = {
    id : Nat;
    owner : Principal;
    name : Text;
    retailPrice : Nat;
    wholesalePrice : Nat;
    directPrice : Nat;
    images : [Storage.ExternalBlob];
    description : Text;
    visibility : ProductVisibility;
    availableQuantity : Nat;
    madeToOrder : Bool;
    colors : [Color];
  };

  type Customer = {
    id : Text;
    owner : Principal;
    name : Text;
    customerType : CustomerType;
    contactDetails : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    weaverProfiles : Map.Map<Principal, WeaverProfile>;
    products : Map.Map<Principal, Map.Map<Nat, Product>>;
    customerDetails : Map.Map<Text, Customer>;
    userProfiles : Map.Map<Principal, UserProfile>;
    productCounters : Map.Map<Principal, Nat>;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};
