export const idlFactory = ({ IDL }) => {
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'guest' : IDL.Null,
    'user' : IDL.Null,
  });
  const ExternalBlob = IDL.Vec(IDL.Nat8);
  const WeaverProfile = IDL.Record({
    'logo' : ExternalBlob,
    'name' : IDL.Text,
    'address' : IDL.Text,
  });
  const Color = IDL.Record({ 'hex' : IDL.Text, 'name' : IDL.Text });
  const ProductVisibility = IDL.Variant({
    'all' : IDL.Null,
    'wholesaleOnly' : IDL.Null,
    'retailOnly' : IDL.Null,
  });
  const ProductForm = IDL.Record({
    'retailPrice' : IDL.Nat,
    'availableQuantity' : IDL.Nat,
    'name' : IDL.Text,
    'wholesalePrice' : IDL.Nat,
    'description' : IDL.Text,
    'madeToOrder' : IDL.Bool,
    'directPrice' : IDL.Nat,
    'colors' : IDL.Vec(Color),
    'visibility' : ProductVisibility,
    'images' : IDL.Vec(ExternalBlob),
  });
  const CustomerType = IDL.Variant({
    'retail' : IDL.Null,
    'direct' : IDL.Null,
    'wholesale' : IDL.Null,
  });
  const Customer = IDL.Record({
    'id' : IDL.Text,
    'customerType' : CustomerType,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'contactDetails' : IDL.Text,
  });
  const Product = IDL.Record({
    'id' : IDL.Nat,
    'retailPrice' : IDL.Nat,
    'owner' : IDL.Principal,
    'availableQuantity' : IDL.Nat,
    'name' : IDL.Text,
    'wholesalePrice' : IDL.Nat,
    'description' : IDL.Text,
    'madeToOrder' : IDL.Bool,
    'directPrice' : IDL.Nat,
    'colors' : IDL.Vec(Color),
    'visibility' : ProductVisibility,
    'images' : IDL.Vec(ExternalBlob),
  });
  return IDL.Service({
    'addOrUpdateCustomer' : IDL.Func(
        [IDL.Text, IDL.Text, CustomerType, IDL.Text],
        [],
        [],
      ),
    'addProduct' : IDL.Func([ProductForm], [IDL.Nat], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createOrUpdateWeaverProfile' : IDL.Func(
        [IDL.Text, ExternalBlob, IDL.Text],
        [],
        [],
      ),
    'getAllCustomers' : IDL.Func([], [IDL.Vec(Customer)], ['query']),
    'getCallerProfile' : IDL.Func([], [IDL.Opt(WeaverProfile)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCatalogByCustomerType' : IDL.Func(
        [CustomerType],
        [IDL.Vec(Product)],
        ['query'],
      ),
    'getCatalogByWeaver' : IDL.Func(
        [IDL.Principal, CustomerType],
        [IDL.Vec(Product)],
        ['query'],
      ),
    'getCustomer' : IDL.Func([IDL.Text], [IDL.Opt(Customer)], ['query']),
    'getMyProducts' : IDL.Func([], [IDL.Vec(Product)], ['query']),
    'getProduct' : IDL.Func(
        [IDL.Nat, IDL.Principal],
        [IDL.Opt(Product)],
        ['query'],
      ),
    'getPublicCatalog' : IDL.Func(
        [IDL.Principal, CustomerType],
        [IDL.Vec(Product)],
        ['query'],
      ),
    'getPublicProduct' : IDL.Func(
        [IDL.Nat, IDL.Principal],
        [IDL.Opt(Product)],
        ['query'],
      ),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'markOutOfStock' : IDL.Func([IDL.Nat], [], []),
    'removeCustomer' : IDL.Func([IDL.Text], [], []),
    'removeProduct' : IDL.Func([IDL.Nat], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'updateProduct' : IDL.Func([IDL.Nat, ProductForm], [], []),
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  });
};
