import { StaticProvider } from '@angular/core';

import { getHost } from '@pe/builder-client-helpers';
import { PebPageId, PebPageVariant, PebScreen } from '@pe/builder-core';
import { AppType, PE_ENV } from '@pe/common';

import { environment } from './environments/environment';

const envAppType = environment.apis.config.appType as AppType;
const defaultDomain = environment?.defaultDomain ?? '';
export const DEFAULT_APP = `${defaultDomain}.${getHost(envAppType, environment.apis)}`;

export type RouteData = { pageId: PebPageId, pageVariant: PebPageVariant | string, routeId: string };

const appApis = {
  [AppType.Affiliates]: 'affiliates-branding',
  [AppType.Blog]: 'blog',
  [AppType.Invoice]: 'invoice',
  [AppType.Mail]: 'mail',
  [AppType.Pos]: 'terminal',
  [AppType.Shop]: 'shop',
  [AppType.Site]: 'site',
  [AppType.Subscriptions]: 'subscription-network',
};

export const PE_AFFILIATE_PARAM = 'pe_affiliate';
export const PE_PROGRAM_PARAM = 'pe_program';
export const PE_HASH_PARAM = 'pe_hash';
export const PE_AFFILIATE_COOKIE = 'pe_affiliate';

export class HandledError extends Error {}

export const fetchAppData = async (env, host: string, fetch, appType: AppType) => {
  const appPath = appType === AppType.Subscriptions ? 'billingSubscription' : appType;
  const endpoint = `${env.backend[appPath]}/api/${appApis[appType]}/by-domain?domain=${host}`;

  return fetch(endpoint)
    .then(response => !response.ok ? Promise.reject(response) : response.json())
    .catch(() => ({}));
};

export const fetchThemeData = (env, fetch, appType: AppType, appId: string) => {
  const appPath = appType === AppType.Subscriptions ? 'billingSubscription' : appType;
  const endpoint = `${env.backend[appPath]}/api/${appType}/${appId}/theme`;

  return fetch(endpoint).then(response => response.json());
};

export const fetchApp = async (env, host, fetch, appType = envAppType) => {
  const app = await fetchAppData(env, host, fetch, appType);
  const theme = await fetchThemeData(env, fetch, appType, app?._id ?? app?.id);

  return { app, theme };
};

export const getProviders = async (env, host = DEFAULT_APP, fetch, appType = envAppType): Promise<StaticProvider[]> => {
  const { app, theme } = await fetchApp(env, host, fetch, appType);
  const categories = await fetchCategories(env, app, fetch);

  return [
    // {
    //   provide: APP_TYPE,
    //   useValue: appType,
    // },
    {
      provide: 'APP',
      useValue: app,
    },
    {
      provide: 'THEME',
      useValue: theme,
    },
    {
      provide: PE_ENV,
      useValue: env,
    },
    {
      provide: 'CATEGORIES',
      useValue: categories,
    },
  ];
};

export function detectScreen(userAgent: string): PebScreen {
  const lowerCaseAgent = userAgent.toLowerCase();
  const mobile = new RegExp(/iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i);
  const tablet = new RegExp(/ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i);

  if (mobile.test(lowerCaseAgent)) {
    return PebScreen.Mobile;
  } else if (tablet.test(lowerCaseAgent)) {
    return PebScreen.Tablet;
  } else {
    return PebScreen.Desktop;
  }
}

export function generateAffiliateCookies(
  env,
  businessId: string,
  affiliateId: string,
  programId: string,
  fetch,
): Promise<any> {
  const endpoint = `${env.backend.affiliates}/api/business/${businessId}/affiliates-program/generate-cookie`;
  const query = `?affiliateProgramId=${programId}&affiliateId=${affiliateId}`;

  return fetch(endpoint + query)
    .then(response => !response.ok
      ? response.json().then(error => { throw new Error(error); })
      : response.json());
}

export function getAffiliateCookies(
  env,
  businessId: string,
  hash: string,
  fetch,
): Promise<any> {
  const endpoint = `${env.backend.affiliates}/api/business/${businessId}/affiliates-program/cookie-data`;
  const query = `?hash=${hash}`;

  return fetch(endpoint + query)
    .then(response => !response.ok
      ? response.json().then(error => { throw new Error(error); })
      : response.json());
}

export function fetchCategories(env, app, fetch): Promise<any[]> {
  const methodAll = 'getCategoriesForBuilder';
  const methodByProducts = 'getCategoriesByProductsForBuilder';
  const fetchFunc = (method: string, path: string) => {
    const body = {
      query: `{
        ${method} (
          business:"${app.businessId}",
          filter: "[]",
          offset: 0,
          order: "[]",
        ) {
          result {
            id
            name
            description
            slug
            parent {
              id
              name
              description
            }
          }
          totalCount
        }
      }`,
    };
    const params = {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/plain, */*',
      },
    };

    return fetch(`${env.backend.products}/${path}`, params)
      .then(response => response.json())
      .then(response => response?.data?.[method]?.result ?? []);
  };

  return Promise.all([
    fetchFunc(methodAll, 'categories'),
    fetchFunc(methodByProducts, 'products'),
  ]).then(categories => categories.reduce((acc, c) => ([...acc, ...c]), []))
    .catch(() => []);
}

export function fetchProducts(env, app, fetch): Promise<any[]> {
  const method = 'getProductsForBuilder';
  const body = {
    query: `{
      ${method} (
        business:"${app.businessId}",
        filter: "[]",
        offset: 0,
        order: "[]",
      ) {
        result {
          id
          slug
          title
          priceAndCurrency
          price
          images
          imagesUrl
          description
          salePriceAndCurrency
          currency
          categories {
            id
            name
            slug
          }
          collections {
            id
            name
          }
        }
        totalCount
      }
    }`,
  };
  const params = {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/plain, */*',
    },
  };

  return fetch(`${env.backend.products}/products`, params)
    .then(response => response.json())
    .then(response => response?.data?.[method]?.result ?? [])
    .catch(() => []);
}

export function fetchCategoriesByProduct(env, app, fetch): Promise<any[]> {
  const method = 'getCategoriesByProductsForBuilder';
  const body = {
    query: `{
      ${method} (
        business:"${app.businessId}",
        filter: "[]",
        offset: 0,
        order: "[]",
      ) {
        result {
          id
          name
          description
          slug
          parent {
            id
            name
            description
          }
        }
        totalCount
      }
    }`,
  };
  const params = {
    body: JSON.stringify(body),
    method: 'POST',
    headers: [
      ['content-type', 'application/json'],
      ['accept', 'application/json, text/plain, */*'],
    ],
  };

  return fetch(`${env.backend.products}/categories`, params)
    .then(response => response.json())
    .then(response => response?.data?.[method]?.result ?? []);
}
