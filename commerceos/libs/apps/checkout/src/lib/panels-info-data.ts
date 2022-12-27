import {
  ColorAndStylePanelInterface,
  SettingsPanelType,
  SettingsMenuItemInterface,
} from './interfaces';

export const colorAndStyleMenu: ColorAndStylePanelInterface[] = [
  {
    name: 'settings.colorAndStyle.panelBusinessHeader.title',
    icon: '#icon-b-spacer-32',
    key: 'businessHeader',
  },
  {
    name: 'settings.colorAndStyle.panelLogo.title',
    icon: '#icon-b-spacer-32',
    key: 'logo',
  },
  {
    name: 'settings.colorAndStyle.panelPage.title',
    icon: '#icon-b-layout-32',
    key: 'page',
  },
  {
    name: 'settings.colorAndStyle.panelButtons.title',
    icon: '#icon-ep-button-16',
    key: 'button',
  },
  {
    name: 'settings.colorAndStyle.panelButtonsSecondary.title',
    icon: '#icon-ep-button-16',
    key: 'buttonSecondary',
  },
  {
    name: 'settings.colorAndStyle.panelInputs.title',
    icon: '#icon-b-catalog-32',
    key: 'input',
  },
];

export const settingsMenu: SettingsMenuItemInterface[] = [
  {
    name: SettingsPanelType.TestingMode,
    isToggleButton: true,
    isHideButton: true,
    title: 'settings.testingMode.listTitle',
    description: 'settings.testingMode.listDescription',
    nameButton: 'settings.testingMode.listButton',
    url: 'testing-mode',
    hideDescription: true,
    icon: '#icon-star-20',
  },
  {
    name: SettingsPanelType.Callbacks,
    title: 'settings.callbacks.title',
    url: 'callbacks',
    buttonAsLink: true,
    hideDescription: true,
    icon: '#icon-payment-keep-32',
  },
  {
    name: SettingsPanelType.Csp,
    isDescribe: true,
    // nameButton: 'actions.edit',
    title: 'settings.csp.listTitle',
    description: 'settings.csp.listDescription',
    url: 'csp',
    buttonAsLink: true,
    hideDescription: true,
    icon: '#icon-chain-20',
  },
  /*
  {
    name: SettingsPanelType.CustomerAccount,
    nameButton: 'actions.edit',
    title: 'settings.customerAccount.listTitle',
    description: 'settings.customerAccount.listDescription'
  },
  {
    name: SettingsPanelType.Policies,
    nameButton: 'actions.edit',
    title: 'settings.policies.listTitle',
    description: 'settings.policies.listDescription'
  },*/
  {
    name: SettingsPanelType.ColorAndStyle,
    // nameButton: 'actions.edit',
    title: 'settings.colorAndStyle.listTitle',
    description: 'settings.colorAndStyle.listDescription',
    url: 'color-and-style',
    isToggleButton: false,
    buttonAsLink: true,
    hideDescription: true,
    icon: '#icon-palette-20',
  },
  {
    name: SettingsPanelType.Language,
    isDescribe: true,
    // nameButton: 'actions.edit',
    title: 'settings.languages.listTitle',
    description: 'settings.languages.listDescription',
    url: 'languages',
    buttonAsLink: true,
    hideDescription: true,
    icon: '#icon-world-20',
  },
  {
    name: SettingsPanelType.PhoneNumber,
    // nameButton: 'actions.edit',
    title: 'settings.phoneNumber.listTitle',
    description: 'settings.phoneNumber.listDescription',
    url: 'phone',
    buttonAsLink: true,
    icon: '#icon-star-20',
  },
  {
    name: SettingsPanelType.Message,
    // nameButton: 'actions.edit',
    title: 'settings.message.listTitle',
    description: 'settings.message.listDescription',
    url: 'message',
    buttonAsLink: true,
    icon: '#icon-star-20',
  },
  {
    name: SettingsPanelType.Policies,
    // nameButton: 'actions.edit',
    title: 'settings.policies.listTitle',
    description: 'settings.policies.listDescription',
    url: 'policies',
    buttonAsLink: true,
    hideDescription: true,
    icon: '#icon-document-20',
  },
  {
    name: SettingsPanelType.ChannelSetId,
    isHideButton: true,
    nameButton: 'actions.open',
    title: 'settings.channelSetId.listTitle',
    description: 'settings.message.listDescription',
    url: 'channelSetId',
    buttonAsLink: false,
    icon: '#icon-person-20',
  },
  {
    name: SettingsPanelType.Notification,
    title: 'settings.notifications.listTitle',
    url: 'notifications',
    buttonAsLink: true,
    hideDescription: true,
    icon: '#icon-n-bell-32',
  },
];

// TODO Component that use this list is disabled but when it's enabled texts should be translated
export const testingPanel = [
  {
    name: 'Santander',
    url: '',
    isButton: true,
  },
  {
    name: 'PayPal',
    url: '',
    isButton: true,
  },
  {
    name: 'Paymill',
    url: '',
    isButton: true,
  },
  {
    name: 'Direct Debit',
    url: '',
    isButton: true,
  },
  {
    name: 'Credit Card',
    url: '',
    isButton: true,
  },

];
