import {
  PeCouponTypeAppliedToEnum,
  PeCouponTypeBuyXGetYBuyRequirementsTypeEnum,
  PeCouponTypeBuyXGetYGetDiscountTypesEnum,
  PeCouponTypeBuyXGetYItemTypeEnum,
  PeCouponTypeCustomerEligibilityEnum,
  PeCouponTypeEnum,
  PeCouponTypeFreeShippingTypeEnum,
  PeCouponTypeMinimumRequirementsEnum,
} from '../../enums';

export const APPLIES_TO = [
  {
    label: 'all_products',
    value: PeCouponTypeAppliedToEnum.AllPpoducts,
  },
  {
    label: 'specific_categories',
    value: PeCouponTypeAppliedToEnum.SpecificCategories,
  },
  {
    label: 'specific_products',
    value: PeCouponTypeAppliedToEnum.SpecificProducts,
  },
];

export const AT_A_DISCOUNTED_VALUE = [
  {
    label: 'free',
    value: PeCouponTypeBuyXGetYGetDiscountTypesEnum.Free,
  },
  {
    label: 'percentage',
    value: PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage,
  },
];

export const BUY_OR_GET_TYPE = [
  {
    label: 'specific_categories',
    value: PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories,
  },
  {
    label: 'specific_products',
    value: PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts,
  },
];

export const BUY_REQUIREMENT_TYPE = [
  {
    label: 'min_purchase_amount',
    value: PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumPurchaseAmount,
  },
  {
    label: 'min_quantity_of_items',
    value: PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems,
  },
];

export const COUPON_TYPES = [
  {
    label: 'percentage',
    value: PeCouponTypeEnum.Percentage,
  },
  {
    label: 'amount',
    value: PeCouponTypeEnum.FixedAmount,
  },
  {
    label: 'shipping',
    value: PeCouponTypeEnum.FreeShipping,
  },
  {
    label: 'buy_x_get_y',
    value: PeCouponTypeEnum.BuyXGetY,
  },
];

export const CUSTOMERS_ELIGIBILITY = [
  {
    label: 'everyone',
    value: PeCouponTypeCustomerEligibilityEnum.Everyone,
  },
  {
    label: 'specific_customers',
    value: PeCouponTypeCustomerEligibilityEnum.SpecificCustomers,
  },
  {
    label: 'specific_groups_of_customers',
    value: PeCouponTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers,
  },
];

export const FREE_SHIPPING_TYPE = [
  {
    label: 'all_countries',
    value: PeCouponTypeFreeShippingTypeEnum.AllCountries,
  },
  {
    label: 'selected_countries',
    value: PeCouponTypeFreeShippingTypeEnum.SelectedCountries,
  },
];

export const MINIMUM_REQUIREMENTS = [
  {
    label: 'none',
    value: PeCouponTypeMinimumRequirementsEnum.None,
  },
  {
    label: 'min_purchase_amount',
    value: PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount,
  },
  {
    label: 'min_quantity_of_items',
    value: PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems,
  },
];
