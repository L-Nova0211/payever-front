export enum EventEnum {
  Background = 'backgroundEvent',
  Header = 'headerEvent',
  LocaleChanged = 'localeChanged'
}

export enum DashboardEventEnum {
  AppReady = 'pe-app-ready',
  BlurryBackdrop = 'dashboard-blurry-backdrop',
  MicroContainer = 'dashboard-micro-container',
  MicroLoading = 'dashboard-micro-loading',
  MicroNavigation = 'dashboard-micro-navigation',
  SubmicroNavigation = 'submicro-navigation',
  SubmicroClose = 'submicro-close',
  DashboardBack = 'dashboard-back',
  CheckoutBack = 'checkout-back',
  SwitcherBack = 'switcher-back',
  ProfileMenuChange = 'profile-menu',
  ShowAppSelector = 'show-app-selector'
}

export enum BackdropActionsEnum {
  Hide = 'HideBackdrop',
  Show = 'ShowBackdrop'
}

export enum MicroContainerTypeEnum {
  InfoBox = 'InfoBox',
  Layout = 'Layout',
  FullScreen = 'FullScreen'
}