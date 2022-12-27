export interface AccessConfigDto {
  isLive: boolean;
  internalDomain: string;
  internalDomainPattern: string;
  isLocked: boolean;
}

export interface Terminal {
  _id?: string;
  channelSet?: string;
  business?: string;
  theme?: string;
  checkout?: string;
  name?: string;
  logo?: string;
  currency?: string;
  active?: boolean;
  phoneNumber?: string;
  message?: string;
  locales?: string[];
  defaultLocale?: string;
  accessConfig?: AccessConfigDto;
}
