import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

// Seamless persistence of state across upgrades
(with migration = Migration.run)
actor {
  // State for core components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Data types
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

  type ProductForm = {
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

  // Persistent data storage
  var weaverProfiles : Map.Map<Principal, WeaverProfile> = Map.empty();
  var products : Map.Map<Principal, Map.Map<Nat, Product>> = Map.empty();
  var customerDetails : Map.Map<Text, Customer> = Map.empty();
  var userProfiles : Map.Map<Principal, UserProfile> = Map.empty();
  var productCounters : Map.Map<Principal, Nat> = Map.empty();

  // Helper for sorting products
  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.name, product2.name);
    };
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Weaver profile management
  public shared ({ caller }) func createOrUpdateWeaverProfile(
    name : Text,
    logo : Storage.ExternalBlob,
    address : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };
    let profile = { name; logo; address };
    weaverProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerProfile() : async ?WeaverProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    weaverProfiles.get(caller);
  };

  public shared ({ caller }) func addProduct(form : ProductForm) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };

    let productId = switch (productCounters.get(caller)) {
      case (null) { 1 };
      case (?counter) { counter + 1 };
    };

    productCounters.add(caller, productId);

    let product : Product = {
      id = productId;
      owner = caller;
      name = form.name;
      retailPrice = form.retailPrice;
      wholesalePrice = form.wholesalePrice;
      directPrice = form.directPrice;
      images = form.images;
      description = form.description;
      visibility = form.visibility;
      availableQuantity = form.availableQuantity;
      madeToOrder = form.madeToOrder;
      colors = form.colors;
    };

    let existingProducts = switch (products.get(caller)) {
      case (null) { Map.empty<Nat, Product>() };
      case (?productMap) {
        if (productMap.containsKey(productId)) {
          Runtime.trap("Product with this ID already exists");
        };
        productMap;
      };
    };

    existingProducts.add(productId, product);
    products.add(caller, existingProducts);

    productId;
  };

  public shared ({ caller }) func updateProduct(id : Nat, form : ProductForm) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update products");
    };

    let weaverProducts = switch (products.get(caller)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?productMap) {
        switch (productMap.get(id)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?existingProduct) {
            if (existingProduct.owner != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
              Runtime.trap("Unauthorized: You can only update your own products");
            };

            let updatedProduct : Product = {
              id;
              owner = existingProduct.owner;
              name = form.name;
              retailPrice = form.retailPrice;
              wholesalePrice = form.wholesalePrice;
              directPrice = form.directPrice;
              images = form.images;
              description = form.description;
              visibility = form.visibility;
              availableQuantity = form.availableQuantity;
              madeToOrder = form.madeToOrder;
              colors = form.colors;
            };

            productMap.add(id, updatedProduct);
            return ();
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove products");
    };

    switch (products.get(caller)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?productMap) {
        switch (productMap.get(id)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?existingProduct) {
            if (existingProduct.owner != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
              Runtime.trap("Unauthorized: You can only remove your own products");
            };
            productMap.remove(id);
          };
        };
      };
    };
  };

  public shared ({ caller }) func markOutOfStock(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update stock status");
    };

    switch (products.get(caller)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?productMap) {
        switch (productMap.get(id)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?existingProduct) {
            if (existingProduct.owner != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
              Runtime.trap("Unauthorized: You can only update your own products");
            };

            let outOfStockProduct : Product = {
              existingProduct with availableQuantity = 0;
            };

            productMap.add(id, outOfStockProduct);
          };
        };
      };
    };
  };

  public query ({ caller }) func getProduct(productId : Nat, owner : Principal) : async ?Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };

    switch (products.get(owner)) {
      case (null) { null };
      case (?productMap) {
        productMap.get(productId);
      };
    };
  };

  // Public function for shareable links
  public query func getPublicProduct(productId : Nat, owner : Principal) : async ?Product {
    switch (products.get(owner)) {
      case (null) { null };
      case (?productMap) {
        productMap.get(productId);
      };
    };
  };

  public query ({ caller }) func getMyProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their products");
    };

    switch (products.get(caller)) {
      case (null) { return [] };
      case (?productMap) {
        return productMap.values().toArray().sort();
      };
    };
  };

  public query ({ caller }) func getCatalogByCustomerType(customerType : CustomerType) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view catalogs");
    };

    let filteredProducts = List.empty<Product>();

    switch (products.get(caller)) {
      case (null) { return [] };
      case (?productMap) {
        productMap.values().forEach(func(product) {
          switch (customerType, product.visibility) {
            case (#retail, #retailOnly) { filteredProducts.add(product) };
            case (#wholesale, #wholesaleOnly) { filteredProducts.add(product) };
            case (_, #all) { filteredProducts.add(product) };
            case (_) {};
          };
        });
      };
    };

    filteredProducts.toArray().sort();
  };

  public query ({ caller }) func getCatalogByWeaver(
    weaverPrincipal : Principal,
    customerType : CustomerType,
  ) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view catalogs");
    };

    let filteredProducts = List.empty<Product>();

    switch (products.get(weaverPrincipal)) {
      case (null) { return [] };
      case (?productMap) {
        productMap.values().forEach(func(product) {
          switch (customerType, product.visibility) {
            case (#retail, #retailOnly) { filteredProducts.add(product) };
            case (#wholesale, #wholesaleOnly) { filteredProducts.add(product) };
            case (_, #all) { filteredProducts.add(product) };
            case (_) {};
          };
        });
      };
    };

    filteredProducts.toArray().sort();
  };

  // Public catalog for shareable links
  public query func getPublicCatalog(weaverPrincipal : Principal, targetType : CustomerType) : async [Product] {
    let filteredProducts = List.empty<Product>();

    switch (products.get(weaverPrincipal)) {
      case (null) { return [] };
      case (?productMap) {
        productMap.values().forEach(func(product) {
          switch (targetType, product.visibility) {
            case (#retail, #retailOnly) { filteredProducts.add(product) };
            case (#wholesale, #wholesaleOnly) { filteredProducts.add(product) };
            case (_, #all) { filteredProducts.add(product) };
            case (_) {};
          };
        });
      };
    };

    filteredProducts.toArray().sort();
  };

  // Customer management with ownership checks
  public shared ({ caller }) func addOrUpdateCustomer(
    id : Text,
    name : Text,
    customerType : CustomerType,
    contactDetails : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add or update customer details");
    };

    switch (customerDetails.get(id)) {
      case (?existingCustomer) {
        if (existingCustomer.owner != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: You can only update your own customers");
        };
      };
      case (null) {};
    };

    let customer : Customer = {
      id;
      owner = caller;
      name;
      customerType;
      contactDetails;
    };
    customerDetails.add(id, customer);
  };

  public query ({ caller }) func getCustomer(id : Text) : async ?Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customer details");
    };

    switch (customerDetails.get(id)) {
      case (?customer) {
        if (customer.owner != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: You can only view your own customers");
        };
        ?customer;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };

    let myCustomers = List.empty<Customer>();
    let customerList = customerDetails.toArray();

    customerList.forEach(func((_, customer)) {
      if (customer.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
        myCustomers.add(customer);
      };
    });

    myCustomers.toArray();
  };

  public shared ({ caller }) func removeCustomer(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove customers");
    };

    switch (customerDetails.get(id)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?existingCustomer) {
        if (existingCustomer.owner != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: You can only remove your own customers");
        };
        customerDetails.remove(id);
      };
    };
  };
};
