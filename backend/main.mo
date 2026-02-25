import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import InviteLinksModule "invite-links/invite-links-module";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Random "mo:core/Random";
import Migration "migration";

(with migration = Migration.run)
actor {
  // State for core components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type WeaverProfile = {
    name : Text;
    logo : Storage.ExternalBlob;
    address : Text;
  };

  let weaverProfiles = Map.empty<Principal, WeaverProfile>();

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
    stockCount : Nat;
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
    stockCount : Nat;
    availableQuantity : Nat;
    madeToOrder : Bool;
    colors : [Color];
  };

  type Customer = {
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

  type CustomerForm = {
    name : Text;
    businessName : ?Text;
    contactNumber : Text;
    addressLine1 : ?Text;
    city : ?Text;
    state : ?Text;
    postalCode : ?Text;
    customerType : CustomerType;
  };

  let products = Map.empty<Principal, Map.Map<Nat, Product>>();
  let productCounters = Map.empty<Principal, Nat>();
  let nextProductId = Map.empty<Principal, Nat>();
  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.name, product2.name);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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

    // Use productCounters to get the current product ID or default to 1
    let currentProductId = switch (productCounters.get(caller)) {
      case (null) { 1 };
      case (?counter) { counter + 1 };
    };

    productCounters.add(caller, currentProductId);

    // Update nextProductId if not already set
    if (nextProductId.get(caller) == null) {
      nextProductId.add(caller, 2);
    };

    let product : Product = {
      id = currentProductId;
      owner = caller;
      name = form.name;
      retailPrice = form.retailPrice;
      wholesalePrice = form.wholesalePrice;
      directPrice = form.directPrice;
      images = form.images;
      description = form.description;
      visibility = form.visibility;
      stockCount = form.stockCount;
      availableQuantity = form.availableQuantity;
      madeToOrder = form.madeToOrder;
      colors = form.colors;
    };

    let mutableProducts = switch (products.get(caller)) {
      case (null) { Map.empty<Nat, Product>() };
      case (?productMap) { productMap };
    };

    mutableProducts.add(currentProductId, product);
    products.add(caller, mutableProducts);

    currentProductId;
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
              stockCount = form.stockCount;
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

  public shared ({ caller }) func updateProductQuantity(productId : Nat, newQuantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update product quantity");
    };

    switch (products.get(caller)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?productMap) {
        switch (productMap.get(productId)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?existingProduct) {
            let updatedProduct : Product = {
              existingProduct with availableQuantity = newQuantity;
            };
            productMap.add(productId, updatedProduct);
          };
        };
      };
    };
  };

  public shared ({ caller }) func explicitSetStockCount(productId : Nat, newStockCount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set stock count explicitly");
    };

    switch (products.get(caller)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?productMap) {
        switch (productMap.get(productId)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?existingProduct) {
            let updatedProduct : Product = {
              existingProduct with stockCount = newStockCount;
            };
            productMap.add(productId, updatedProduct);
          };
        };
      };
    };
  };

  public shared ({ caller }) func toggleOutOfStock(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle stock status");
    };

    switch (products.get(caller)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?productMap) {
        switch (productMap.get(productId)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?existingProduct) {
            let updatedProduct : Product = {
              existingProduct with availableQuantity = if (existingProduct.availableQuantity == 0) {
                1;
              } else {
                0;
              };
            };
            productMap.add(productId, updatedProduct);
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

  // No authentication for public product query
  public query func getPublicProduct(productId : Nat, owner : Principal) : async ?Product {
    switch (products.get(owner)) {
      case (null) { null };
      case (?productMap) { productMap.get(productId) };
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

  public query func getPublicCatalogNonAuthenticated(weaverPrincipal : Principal, targetType : CustomerType) : async [Product] {
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

  // No authentication for public catalog query by weaver
  public query func getCatalogByWeaver(
    weaverPrincipal : Principal,
    customerType : CustomerType,
  ) : async [Product] {
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

  let customerDetails = Map.empty<Text, Customer>();

  public shared ({ caller }) func addOrUpdateCustomer(
    id : Text,
    customerForm : CustomerForm
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add or update customer details");
    };

    if (customerForm.contactNumber.size() != 10 or not isNumeric(customerForm.contactNumber)) {
      Runtime.trap("Invalid contact number: Must be exactly 10 digits");
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
      name = customerForm.name;
      businessName = customerForm.businessName;
      contactNumber = customerForm.contactNumber;
      addressLine1 = customerForm.addressLine1;
      city = customerForm.city;
      state = customerForm.state;
      postalCode = customerForm.postalCode;
      customerType = customerForm.customerType;
    };
    customerDetails.add(id, customer);
  };

  func isNumeric(s : Text) : Bool {
    for (char in s.chars()) {
      if (char < '0' or char > '9') {
        return false;
      };
    };
    true;
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

  // ----- New RSVP and Invite Links Functions -----
  let inviteState = InviteLinksModule.initState();

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };
};
