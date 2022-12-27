import { StaticProvider } from '@angular/core';

import { PebPageId, PebPageVariant, PebScreen, PebShopRoute } from '@pe/builder-core';
import { AppType, APP_TYPE, PE_ENV } from '@pe/common';

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

export class PebClientPasswordError extends Error { }

export const fetchApp = async (
  env,
  host: string,
  fetch,
  appType,
) => {
  const appPath = appType === AppType.Subscriptions ? 'billingSubscription' : appType;
  const apiPath = `${env.backend[appPath]}/api`;
  const appEndpoint = `${apiPath}/${appApis[appType]}/by-domain?domain=${host}`;
  const app = await fetch(appEndpoint)
    .then(response => !response.ok ? Promise.reject(response) : response.json())
    .catch(() => ({}));
  const themeEndpoint = `${apiPath}/${appType}/${app?._id ?? app?.id}/theme`;
  const theme = await fetch(themeEndpoint).then(response => response.json());

  return { app, theme };
};

export const getProviders = async (
  env,
  host,
  fetch,
  appType,
): Promise<StaticProvider[]> => {
  const { app, theme } = await fetchApp(env, host, fetch, appType);
  const categories = await fetchCategories(env, app, fetch);

  return [
    {
      provide: APP_TYPE,
      useValue: appType,
    },
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

export function fetchCategories(env, app, fetch): Promise<any[]> {
  const methodAll = 'getCategoriesForBuilder';
  const methodByProducts = 'getCategoriesByProductsForBuilder';

  const fetchFunc = (method, path) => {
    const body = {
      query: `{
      ${method} (
        business:"${app.businessId}", filter: "[]", offset: 0, order: "[]",
      ) {
        result {
          id name description slug parent { id name description }
        }
        totalCount
      }
    }`,
    };

    return fetch(`${env.backend?.products}/${path}`, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: [
        ['content-type', 'application/json'],
        ['accept', 'application/json, text/plain, */*'],
      ],
    })
      .then(r => r.json())
      .then(r => r?.data?.[method]?.result ?? [])
      .catch(() => []);
  };

  return Promise.all([
    fetchFunc(methodAll, 'categories'),
    fetchFunc(methodByProducts, 'products'),
  ]).then(categories => categories.reduce((acc, c) => ([...acc, ...c]), []));
}

export function fetchCategoriesByProduct(env, app, fetch): Promise<any[]> {
  const method = 'getCategoriesByProductsForBuilder';
  const body = {
    query: `{
      ${method} (
        business:"${app.businessId}", filter: "[]", offset: 0, order: "[]",
      ) {
        result {
          id name description slug parent { id name description }
        }
        totalCount
      }
    }`,
  };

  return fetch(`${env.backend?.products}/categories`, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: [
      ['content-type', 'application/json'],
      ['accept', 'application/json, text/plain, */*'],
    ],
  })
    .then(r => r.json())
    .then(r => r?.data?.[method]?.result ?? []);
}

export function buildRoutes(theme, categories): { [r: string]: RouteData } {
  const routes = categories?.reduce(
    (acc, category) => {
      acc[`^/${category.slug.toLowerCase()}$`] = {
        pageId: null,
        pageVariant: PebPageVariant.Category,
        routeId: null,
      };

      return acc;
    },
    {},
  ) ?? {};
  routes[`^/products/[\\w-]+`] = {
    pageId: null,
    pageVariant: PebPageVariant.Product,
    routeId: null,
  };
  theme?.routing?.forEach((route: PebShopRoute) => {
    let routeUrl = `^${route.url}$`;
    let i = 0;
    while (routes[routeUrl]) {
      i += 1;
      routeUrl = `^${route.url}-${i}$`;
    }
    routes[routeUrl] = {
      pageId: route.pageId,
      pageVariant: route.url === '/' ? PebPageVariant.Front : PebPageVariant.Default,
      routeId: route.routeId,
    };
  });

  return routes;
}

export function getRouteData(url: string, theme: any, categories: any[]): RouteData {
  const routes = buildRoutes(theme, categories);

  for (const [regexp, routeData] of Object.entries(routes)) {
    if (new RegExp(regexp, 'i').test(url)) {
      return routeData;
    }
  }

  return {
    pageId: null,
    pageVariant: '404',
    routeId: null,
  };
}
