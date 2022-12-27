export interface InstallationPopupInterface {
  uuid?: string;
  title: string;
  icon?: string;
  option?: string;
  installationOptions: OptionsInterface;
}

export interface OptionsInterface {
  optionIcon: string;
  price: string;
  links: LinkInterface[];
  category: string;
  developer: string;
  languages: string;
  description: string;
  appSupport: string;
  website: string;
  pricingLink: string;
}

export interface LinkInterface {
  linkType: string;
  url: string;
}
