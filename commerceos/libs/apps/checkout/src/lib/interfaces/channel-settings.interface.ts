export interface ChannelSettingsInterface {
  bubble?: BubbleInterface;
  button?: ButtonInterface;
  calculator?: CalculatorInterface;
  // activePosList?: StorePosListInterface[];
  // activeStoreList?: StorePosListInterface[];
  textLink?: TextLinkInterface;
}

export interface BubbleInterface {
  visibility: boolean;
  checkoutOverlay: boolean;
  calculatorOverlay: boolean;
}

export interface ButtonInterface {
  textSize: string;
  textColor: string;
  buttonColor: string;
  alignment: string;
  corner: string;
  visibility?: boolean;
  adaptive?: boolean;
  checkoutOverlay?: boolean;
  calculatorOverlay?: boolean;
}

export interface CalculatorInterface {
  textColor: string;
  buttonColor: string;
  linkColor: string;
  backgroundColor: string;
  visibility: boolean;
  adaptive: boolean;
  checkoutOverlay: boolean;
  calculatorOverlay: boolean;
}

export interface StorePosListInterface {
  active: boolean;
  name: string;
  id: string;
  isToggled?: boolean;
}

export interface TextLinkInterface {
  textSize: string;
  alignment: string;
  linkColor: string;
  visibility?: boolean;
  adaptive?: boolean;
  checkoutOverlay?: boolean;
  calculatorOverlay?: boolean;
}
