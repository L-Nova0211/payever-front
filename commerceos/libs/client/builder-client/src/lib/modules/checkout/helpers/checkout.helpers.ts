import {
  FlowBodyInterface,
} from '../interfaces/checkout.interfaces';

export const createFlowBody = (
  channelSet: string,
  merchantMode = false,
): FlowBodyInterface => {
  return {
    x_frame_host: getXFrameHost(),
    shop_url: getAppUrl(), // TODO: Add path,
    channel_set_id: channelSet,
    pos_merchant_mode:
      merchantMode || String(sessionStorage.getItem('enableMerchantMode')) === 'true',
    cart: [],
    generatePaymentCode: true,
  };
};

export const getXFrameHost = (): string => {
  return window.location.ancestorOrigins &&
    window.location.ancestorOrigins.length
    ? window.location.ancestorOrigins[0]
    : window.location.origin;
};

const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getAppUrl = (): string => {
  let appUrl: string;
  const pathSegments: string[] = location.pathname.split('/');
  if (
    pathSegments.length > 1 &&
    pathSegments[pathSegments.length - 2] === 'product' &&
    UUID_REGEXP.test(pathSegments[pathSegments.length - 1])
  ) {
    pathSegments.splice(pathSegments.length - 2);
    appUrl = getXFrameHost() + pathSegments.join('/');
  } else if (
    pathSegments.length > 0 &&
    pathSegments[pathSegments.length - 1] === 'cart'
  ) {
    pathSegments.splice(pathSegments.length - 1);
    appUrl = getXFrameHost() + pathSegments.join('/');
  } else {
    appUrl = getXFrameHost() + location.pathname;
  }

  return appUrl;
};
