export interface ShippingSettingInterface {
  companyAddress: {
    _id: string,
    country: string,
  }
  createdAt: string,
  currency: string
  integrationSubscriptions: [],
  name: string,
  settings: []
  updatedAt: string,
}
