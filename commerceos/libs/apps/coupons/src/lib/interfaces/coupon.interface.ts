import { BusinessInterface } from '@pe/common';

import {
  PeCouponTypeAppliedToEnum,
  PeCouponTypeBuyXGetYBuyRequirementsTypeEnum,
  PeCouponTypeBuyXGetYGetDiscountTypesEnum,
  PeCouponTypeBuyXGetYItemTypeEnum,
  PeCouponTypeCustomerEligibilityEnum,
  PeCouponTypeEnum,
  PeCouponTypeFreeShippingTypeEnum,
  PeCouponTypeMinimumRequirementsEnum,
} from '../enums';

import { PeCouponCategoryInterface } from './coupon-category.interface';
import { PeCouponCountryInterface } from './coupon-country.interface';
import { PeCouponCustomerGroupInterface } from './coupon-customer-group.interface';
import { PeCouponCustomerInterface } from './coupon-customer.interface';
import { PeCouponProductInterface } from './coupon-product.interface';

export interface PeCouponLimitsInterface {
  limitOneUsePerCustomer: boolean;
  limitUsage: boolean;
  limitUsageAmount: number;
}

export interface PeCouponTypeInterface {
  appliesTo?: PeCouponTypeAppliedToEnum;
  appliesToProducts?: string[] | PeCouponProductInterface[];
  appliesToCategories?: string[] | PeCouponCategoryInterface[];
  buyRequirementType?: PeCouponTypeBuyXGetYBuyRequirementsTypeEnum;
  buyAmount?: number;
  buyQuantity?: number;
  buyType?: PeCouponTypeBuyXGetYItemTypeEnum;
  buyProducts?: string[] | PeCouponProductInterface[];
  buyCategories?: string[] | PeCouponCategoryInterface[];
  discountValue?: number;
  excludeShippingRatesOverCertainAmount?: boolean;
  excludeShippingRatesOverCertainAmountValue?: number;
  freeShippingType?: PeCouponTypeFreeShippingTypeEnum;
  freeShippingToCountries?: string[] | PeCouponCountryInterface[];
  getType?: PeCouponTypeBuyXGetYItemTypeEnum;
  getQuantity?: number;
  getProducts?: string[] | PeCouponProductInterface[];
  getCategories?: string[] | PeCouponCategoryInterface[];
  getDiscountType?: PeCouponTypeBuyXGetYGetDiscountTypesEnum;
  getDiscountValue?: number;
  maxUsesPerOrder?: boolean;
  maxUsesPerOrderValue?: number;
  minimumRequirements?: PeCouponTypeMinimumRequirementsEnum;
  minimumRequirementsPurchaseAmount?: number;
  minimumRequirementsQuantityOfItems?: number;
  type: PeCouponTypeEnum;
}

export interface PeCouponInterface {
  _id?: string;
  serviceEntityId?: string;
  code: string;
  channelSets: string[] | PeCouponsChannelInterface[];
  customerEligibility: PeCouponTypeCustomerEligibilityEnum;
  customerEligibilityCustomerGroups: string[] | PeCouponCustomerGroupInterface[];
  customerEligibilitySpecificCustomers: string[] | PeCouponCustomerInterface[];
  description: string;
  endDate?: Date;
  limits: PeCouponLimitsInterface;
  name: string;
  startDate?: Date;
  status: string;
  type: PeCouponTypeInterface;
}

export interface Coupon extends PeCouponInterface {
  [key: string]: any;
}

export interface CouponsResponseInterface {
  data: {
    getBusiness?: BusinessInterface,
    getCoupons: {
      coupons: Coupon[];
    };
  };
}

export interface PeCouponsChannelInterface {
  _id: string;
  channel: string;
}
