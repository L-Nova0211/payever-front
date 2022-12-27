import { StylesSettingsInterface } from '../../../interfaces';

export const CORNERS = ['4px', '12px', '50px', '0px'];
export const CORNERS_ICONS = {
  '4px': '#icon-corner-round-25',
  '12px': '#icon-corner-circle-25',
  '50px': '#icon-corner-arc-25',
  '0px': '#icon-corner-square-25',
};

export const ALIGNMENTS = {
  left: '#icon-alignment-left-25',
  center: '#icon-alignment-center-25',
  right: '#icon-alignment-right-25',
};


export const DEFAULT_STYLES: StylesSettingsInterface = {
  businessHeaderBackgroundColor: '#fff',
  businessHeaderBorderColor: '#dfdfdf',
  businessHeaderDesktopHeight: 55,
  businessHeaderMobileHeight: 55,

  businessLogoDesktopWidth: 0,
  businessLogoDesktopHeight: 0,
  businessLogoDesktopPaddingTop: 0,
  businessLogoDesktopPaddingRight: 0,
  businessLogoDesktopPaddingBottom: 0,
  businessLogoDesktopPaddingLeft: 0,
  businessLogoDesktopAlignment: 'left',

  businessLogoMobileWidth: 0,
  businessLogoMobileHeight: 0,
  businessLogoMobilePaddingTop: 0,
  businessLogoMobilePaddingRight: 0,
  businessLogoMobilePaddingBottom: 0,
  businessLogoMobilePaddingLeft: 0,
  businessLogoMobileAlignment: 'left',

  buttonBackgroundColor: '#333333',
  buttonBackgroundDisabledColor: '#656565',
  buttonTextColor: '#ffffff',
  buttonBorderRadius: CORNERS[0],

  buttonSecondaryBackgroundColor: '#ffffff',
  buttonSecondaryBackgroundDisabledColor: '#656565',
  buttonSecondaryTextColor: '#0084ff',
  buttonSecondaryBorderRadius: CORNERS[0],

  pageBackgroundColor: '#f7f7f7',
  pageLineColor: '#dfdfdf',
  pageTextPrimaryColor: '#777777',
  pageTextSecondaryColor: '#8e8e8e',
  pageTextLinkColor: '#444444',

  inputBackgroundColor: '#ffffff',
  inputBorderColor: '#dfdfdf',
  inputTextPrimaryColor: '#3a3a3a',
  inputTextSecondaryColor: '#999999',
  inputBorderRadius: CORNERS[0],
}
