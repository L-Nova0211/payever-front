export enum PeCouponTypeEnum {
  Percentage = 'PERCENTAGE',
  FixedAmount = 'FIXED_AMOUNT',
  FreeShipping = 'FREE_SHIPPING',
  BuyXGetY= 'BUY_X_GET_Y',
}

export enum PeCouponsStatusEnum {
  Inactive = 'INACTIVE',
  Active = 'ACTIVE',
}

export enum PeCouponTypeAppliedToEnum {
  AllPpoducts = 'ALL_PRODUCTS',
  SpecificCategories = 'SPECIFIC_CATEGORIES',
  SpecificProducts = 'SPECIFIC_PRODUCTS',
}

export enum PeCouponTypeFreeShippingTypeEnum {
  AllCountries = 'ALL_COUNTRIES',
  SelectedCountries = 'SELECTED_COUNTRIES',
}

export enum PeCouponTypeBuyXGetYBuyRequirementsTypeEnum {
  MinimumQuantityOfItems = 'MINIMUM_QUANTITY_OF_ITEMS',
  MinimumPurchaseAmount = 'MINIMUM_PURCHASE_AMOUNT',
}

export enum PeCouponTypeBuyXGetYGetDiscountTypesEnum {
  Percentage = 'PERCENTAGE',
  Free = 'FREE',
}

export enum PeCouponTypeBuyXGetYItemTypeEnum {
  SpecificCategories = 'SPECIFIC_CATEGORIES',
  SpecificProducts = 'SPECIFIC_PRODUCTS',
}

export enum PeCouponTypeMinimumRequirementsEnum {
  None = 'NONE',
  MinimumQuantityOfItems = 'MINIMUM_QUANTITY_OF_ITEMS',
  MinimumPurchaseAmount = 'MINIMUM_PURCHASE_AMOUNT',
}

export enum PeCouponTypeCustomerEligibilityEnum {
  Everyone = 'EVERYONE',
  SpecificGroupsOfCustomers = 'SPECIFIC_GROUPS_OF_CUSTOMERS',
  SpecificCustomers = 'SPECIFIC_CUSTOMERS',
}

export enum PeCouponsArrayNamesEnum {
  Categories = 'categories',
  Customers = 'customers',
  Countries = 'countries',
  GroupsOfCustomers = 'groups',
  Products = 'products',
}

export enum PeCouponExpandOption {
  Discount = 'discount',
  Date = 'date',
}