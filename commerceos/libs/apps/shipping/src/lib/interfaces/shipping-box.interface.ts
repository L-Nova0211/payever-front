export interface ShippingBoxInterface  {
  name: string;
  dimensionUnit: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  weightUnit: string;
  _id?: string;
  type: string;
  isDefault?: boolean;
}
