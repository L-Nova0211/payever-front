export enum PanelType {
  Checkout = 'checkout',
  Payments = 'payments',
  Channels = 'channels',
  Connect = 'connect',
  Sections = 'sections',
  Settings = 'settings'
}

export enum SettingsModalType {
  ColorAndStyle = 'color-and-style',
  Languages = 'languages',
  Policies = 'policies',
  Csp = 'csp',
  TestingMode = 'testing-mode',
  Phone = 'phone',
  Message = 'message',
  Notifications = 'notifications',
  Callbacks = 'callbacks',
}

export enum CheckoutPanelModalType {
  ClipboardCopy = 'clipboard-copy',
  QR = 'qr'
}

export enum ChannelsAppsType {
  SHOP = 'shop-app',
  POS = 'pos-app',
  QR = 'qr-app',
}

export interface PanelInterface {
  active?: boolean;
  name: string;
  icon?: string;
  isHovered?: boolean;
  disabled?: boolean;
  forceHidden?: boolean;
  url?: string;
  isForModal?: boolean;
  key?: PanelType;
  buttonText?: string;
}

export const checkoutPanels: PanelInterface[] = [
  {
    active: false,
    name: '',
    disabled: false,
    icon: '',
    isHovered: true,
    isForModal: false,
    key: PanelType.Checkout,
  },
  {
    active: false,
    name: 'info_boxes.panels.paymentOptions',
    disabled: false,
    icon: '#icon-credit-cards-24',
    isHovered: true,
    isForModal: true,
    key: PanelType.Payments,
  },
  {
    active: false,
    name: 'info_boxes.panels.channels',
    disabled: false,
    icon: '#icon-geocoder-24',
    isHovered: true,
    isForModal: false,
    key: PanelType.Channels,
  },
  {
    active: false,
    name: 'info_boxes.panels.connect',
    disabled: false,
    icon: '#icon-apps-app-market',
    isHovered: true,
    isForModal: false,
    key: PanelType.Connect,
  },
  {
    active: false,
    name: 'info_boxes.panels.sections',
    disabled: true,
    icon: '#icon-filters-16',
    buttonText: 'Edit',
    isHovered: false,
    isForModal: false,
    key: PanelType.Sections,
  },
  {
    active: false,
    name: 'info_boxes.panels.settings',
    disabled: false,
    icon: '#icon-settings-2-16',
    isHovered: true,
    isForModal: true,
    key: PanelType.Settings,
  },
];

