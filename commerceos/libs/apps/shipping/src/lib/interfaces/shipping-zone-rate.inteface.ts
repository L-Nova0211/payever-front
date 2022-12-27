import { RateTypesEnums } from '../enums/RateTypeEnums';
import { ShippingSpeedEnum } from '../enums/ShippingSpeedEnum';
import { WeightMeasurementUnitsEnum } from '../enums/WeightMeasurementUnitsEnum';

export interface ShippingZoneRateInterface {
  name?: string;
  rateType?: RateTypesEnums;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  weightUnit?: WeightMeasurementUnitsEnum;
  minWeight?: number;
  maxWeight?: number;
  shippingSpeed?: ShippingSpeedEnum;
}
