import {
  FlatRateShippingTypesEnum,
  ShippingPanelsEnum,
} from '../enums';

export interface PanelInterface {
  id: ShippingPanelsEnum;
  icon?: string;
  isHovered?: boolean;
  disabled?: boolean;
  url?: string;
  key?: string;
  isButton?: boolean;
  active?: boolean;
  loading?: boolean;
}

export interface MenuListInterface {
  id: string;
  name?: string;
  label?: string;
  details?: string;
  active?: boolean;
  icon?: string;
  toggledButton?: boolean;
  installed?: boolean;
  nameButton?: string;
  url?: string;
  rateRanges?: ShippingRangeSettingInterface[];
  weightRanges?: ShippingRangeSettingInterface[];

}

export enum IntegrationCategory {
  Payments = 'payments',
  Accountings = 'accountings',
  Shipping = 'shippings',
  Products = 'products',
  ShopSystems = 'shopsystems',
  Communications = 'communications',
  Channels = 'channels',
  Applications = 'applications',
}

export interface BusinessShippingSettings {
  businessId: string;
  integrationSubscriptions: IntegrationInfoInterface[];
  settings: any;
}

export interface IntegrationInfoInterface {
  _id?: string;
  createdAt?: string;
  installed?: boolean;
  enabled?: boolean;
  isActive?: boolean;
  name?: string;
  integration?: {
    name: string,
    category: IntegrationCategory,
    createdAt?: string;
    displayOptions: {
      icon: string,
      title: string,
      order?: number,
    },
    settingsOptions?: {
      source: string,
      action?: string,
      url?: string,
    };
  };
  rules?: ShippingRuleInterface[];
}

export interface ShippingRuleInterface {
  _id?: string;
  isActive?: boolean;
  createdAt?: string;
  freeOver?: number | null;
  name?: string;
  rate?: number | null;
  rateRanges?: ShippingRangeSettingInterface[];
  toggledButton?: boolean;
  type?: {
    createdAt?: string,
    isCompatible: boolean;
    isExtendable: boolean;
    name: string;
    title: string;
    updatedAt?: string;
    __v?: number;
    _id: string;
  };
  updatedAt?: string;
  weightRanges?: ShippingRangeSettingInterface[];
}

export interface ShippingFormsInterface {
  flat_order: string;
}

export interface NotificationsInterface {
  name: string;
}

export interface CustomShippingInterface {
  title: string;
  description?: string;
  isActive?: boolean;
  buttonTitle: string;
  hasToggle?: boolean;
  hasPrice?: boolean;
  hasRates?: boolean;
  defaultRates?: string;
}

export interface FlatOrdersInterface {
  name: string;
  value: string;
}

export interface ShippingWeightInterface {
  minWeight: string;
  maxWeight: string;
  shippingRate: string;
}

export interface ShippingRangeSettingInterface {
  from: number | string;
  upTo: number | string;
  rate: number | string;
}

export interface FreeShippingSettingsInterface extends ShippingRuleInterface {
  freeOver?: number;
}

export interface FlatRateShippingSettingsInterface extends ShippingRuleInterface {
  rate?: number;
  flatRateType?: FlatRateShippingTypesEnum;
}

export interface ByWeightShippingByWeightSettingsInterface extends ShippingRuleInterface {
  weightRanges?: ShippingRangeSettingInterface[];
}

export interface ByOrderTotalsShippingSettingsInterface extends ShippingRuleInterface {
  rateRanges?: ShippingRangeSettingInterface[];
}

export interface ShippingSettingsInterface {
  freeShipping: FreeShippingSettingsInterface;
  flatRateShipping: FlatRateShippingSettingsInterface;
  byWeightShipping: ByWeightShippingByWeightSettingsInterface;
  byOrderTotalsShipping: ByOrderTotalsShippingSettingsInterface;
}
