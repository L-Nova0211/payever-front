export interface MediaConfig {
  maxImageSize?: number; // in bytes
  maxImageSizeText?: string; // text like '5MB' - used in error message
}

export interface BlobCreateResponse {
  blobName: string;
  brightnessGradation?: string;
}

export interface FileUploadResponse {
  id: string;
  url: string;
}

export interface NodeJsBackendConfigInterface {
  appRegistry: string;
  auth: string;
  builder: string;
  builderMedia: string;
  channels: string;
  checkout: string;
  commerceos: string;
  common: string;
  connect: string;
  contacts: string;
  coupons: string;
  devicePayments: string;
  inventory: string;
  financeExpress: string;
  mailer: string;
  mailerReport: string;
  marketing: string;
  media: string;
  notifications: string;
  notificationsWs: string;
  payments: string;
  plugins: string;
  pos: string;
  products: string;
  shipping: string;
  /** @depricated Use shop instead */
  shops: string;
  shop: string;
  thirdParty: string;
  transactions: string;
  transactionsWs: string;
  users: string;
  widgets: string;
  wallpapers: string;
  synchronizer: string;
  billingSubscription: string;
  paymentNotifications: string;
  paymentDataStorage: string;
}

export interface CustomConfigInterface {
  cdn?: string;
  i18n?: string;
  proxy?: string;
  storage: string;
  integrator?: string;
  translation?: string;
}

export interface MediaEnv {
  custom: CustomConfigInterface;
  backend: NodeJsBackendConfigInterface;
}
