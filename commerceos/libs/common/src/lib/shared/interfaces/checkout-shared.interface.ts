export interface CheckoutInterface {
  default?: boolean;
  settings: CheckoutSettingsInterface;
}

export interface CheckoutSettingsInterface {
  languages: LanguageInterface[];
}

export interface LanguageInterface {
  code: string;
  name: string;
  defaultValue: boolean;
  active: boolean;
  isDefault?: boolean;
  isToggleButton?: boolean;
  isHovered?: boolean;
}
