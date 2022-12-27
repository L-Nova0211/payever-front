import { FilterInterface } from '@pe/grid';

export interface ChannelInterface {
  icon: string;
  label: string;
  name: string;
}

export interface PaymentOptionsInterface {
  icon: string;
  label: string;
  name: string;
}

export interface ChannelsInterface {
  [name: string]: ChannelInterface
}
export interface PaymentsOptionsInterface {
  [name: string]: PaymentOptionsInterface
}

export interface ValuesInterface {
  channels: ChannelsInterface;
  filters: FilterInterface[];
  paymentOptions: PaymentsOptionsInterface;
}

export interface ResponseValuesInterface {
  channels: ChannelInterface[];
  filters: FilterInterface[];
  paymentOptions: PaymentOptionsInterface[];
}
