export type WidgetType = 'text-link' | 'bubble' | 'button' | 'banner-and-rate';
export type ButtonBorderRadiusType = 'round' | 'circle' | 'square';
export type LinkToType = 'finance_express'| 'finance_calculator' | '';
export const widgetCreatedEventMessage = 'financeExpressWidgetCreated';
export const paymentOptionsNotSetEventMessage = 'financeExpressPaymentOptionsNotSet';
export const cannotFetchPaymentOptionsEventMessage = 'financeExpressCannotFetchPaymentOptions';
export const cannotGetCalculationsEventMessage = 'cannotGetCalculationsEventMessage';
export const cannotGetConnectionIdEventMessage = 'cannotGetConnectionIdEventMessage';
export const swedenTokenErrorEventMessage = 'swedenTokenErrorEventMessage';

export interface SettingsResponseInterface {
  type: WidgetType;
  data: BaseWidgetSettingsInterface;
}

export interface BaseWidgetSettingsInterface {
  type?: string;
  linkTo?: LinkToType;
  adaptiveDesign?: boolean;
  showWidgetFromPrice?: number;
  showWidgetToPrice?: number;
  showWidgetForCurrency?: string;
  visibility?: boolean;
  linkColor?: string;
  textSize?: string;
  alignment?: string;
  width?: number;
  height?: number;
  // checkoutOverlay: boolean;
  // calculatorOverlay: boolean;
}

// tslint:disable-next-line no-empty-interface
export interface TextLinkWidgetSettingsInterface extends BaseWidgetSettingsInterface {
  // type: string;
  // link_to: null;
  // adaptive_design: boolean;
  // show_widget_from_price: number;
  // show_widget_to_price: number;
  // show_widget_for_currency: string;
  // visibility: boolean;
  // link_color: string;
  // text_size: string;
  // alignment: string;
  // width: number;
  // height: number;
}

export interface ButtonWidgetSettingsInterface extends BaseWidgetSettingsInterface {
  textColor: string;
  textSize: string;
  corners: ButtonBorderRadiusType;
  buttonColor: string;
}

export interface BannerAndRatesWidgetSettingsInterface extends BaseWidgetSettingsInterface {
  textColor?: string;
  buttonColor?: string;
  borderColor?: string;
  size?: number;
  displayType?: 'rate' | 'banner_rate';
  labelPlacement?: string;
  order?: 'asc' | 'desc';
  bgColor?: string;
}

// tslint:disable-next-line no-empty-interface
export interface BubbleWidgetSettingsInterface extends BaseWidgetSettingsInterface {
}

export interface WidgetSettingsInterface {
  id: number;
  settings: BaseWidgetSettingsInterface[];
}

export interface OverlayAppPayloadInterface {
  button?: ButtonWidgetSettingsInterface;
  bubble?: BubbleWidgetSettingsInterface;
  calculator?: BannerAndRatesWidgetSettingsInterface;
  textLink?: TextLinkWidgetSettingsInterface;
}

export const DEFAULT_BANNER_PRICE = 2399.95;
