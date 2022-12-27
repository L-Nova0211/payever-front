
export interface CheckoutDataInterface {
  userUuid: string;
  businessUuid: string;
  checkoutList: CheckoutListInterface[];
  installedPayments: any[];
  installedChannels: any[];
}

export interface CheckoutListInterface {
  uuid: string;
  active: boolean;
  name: string;
  logo: string;
  type: string;
  channel_set_id: string;
  channelSettings: any;
  paymentList: any[];
  settings: any;
  testingMode?: boolean;
}
