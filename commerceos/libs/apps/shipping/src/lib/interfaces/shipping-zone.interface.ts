import { ShippingZoneRateInterface } from './shipping-zone-rate.inteface';

export interface ShippingZoneInterface  {
  name: string;
  countryCodes?: string[];
  deliveryTimeDays?: number;
  _id?: string;
  rates?: ShippingZoneRateInterface[];
}
