// TODO Take all from SDK

export interface CheckoutStateParamsInterface {
  merchantMode?: boolean;
  embeddedMode?: boolean;
  openNextStepOnInit?: boolean; // Should be triggered once
  forceUseCard?: boolean;
  forceNoPaddings?: boolean;
  forceFullScreen?: boolean;
  forceNoSnackBarNotifications?: boolean;
  showQRSwitcher?: boolean;
  forceNoScroll?: boolean;
  forcePhoneRequired?: boolean;
  forceCodeForPhoneRequired?: boolean;
  forceNoCloseButton?: boolean;
  forceShowBusinessHeader?: boolean;
  forcePaymentOnly?: boolean; // choose payment + payment step only, step 2 opened
  forceChoosePaymentOnlyAndSubmit?: boolean; // choose payment + payment step only, submit on load
  forceNoOrder?: boolean;
  forceNoHeader?: boolean;
  forceNoSendToDevice?: boolean;
  forceHideReference?: boolean;
  cancelButtonText?: string;
  layoutWithPaddings?: boolean;
  showOtherPayment?: boolean;

  flash_bag?: string; // TODO Not sure that we need this one

  // Internal:
  forceAddressOnlyFillEmptyAllowed?: boolean; // Allow only to fill empty fields at address step

  // TODO Remove. Now we have event
  forceShowOrderStep?: boolean; // Should be triggered once

  editMode?: boolean;
  setDemo?: boolean;
}

export interface CheckoutEventInterface {
  event: string;
  value: any;
}

export enum CheckoutPluginEventEnum {
  payeverCheckoutModalShow = 'payeverCheckoutModalShow',
  payeverCheckoutModalHide = 'payeverCheckoutModalHide',
  payeverCheckoutStepPanelOpened = 'payeverCheckoutStepPanelOpened',
  payeverCheckoutHeightChanged = 'payeverCheckoutHeightChanged',
  payeverCheckoutHeightChangedEx = 'payeverCheckoutHeightChangedEx',
  payeverCheckoutFlowFinished = 'payeverCheckoutFlowFinished',
  payeverCheckoutCartChanged = 'payeverCheckoutCartChanged',
  payeverCheckoutLoaded = 'payeverCheckoutLoaded',
  payeverCheckoutClosed = 'payeverCheckoutClosed',
  payeverCheckoutFlowSavedToStorage = 'payeverCheckoutFlowSavedToStorage',
  payeverCheckoutSnackBarToggle = 'payeverCheckoutSnackBarToggle',
  payeverCheckoutBeforeFlowClone = 'payeverCheckoutBeforeFlowClone',
  payeverCheckoutAfterFlowClone = 'payeverCheckoutAfterFlowClone',
  payeverCheckoutScrollOfParentElement = 'payeverCheckoutScrollOfParentElement',
  payeverCheckoutSantanderStateChanged = 'payeverCheckoutSantanderStateChanged',
  payeverCheckoutSantanderStateChangedEx = 'payeverCheckoutSantanderStateChangedEx'
}
