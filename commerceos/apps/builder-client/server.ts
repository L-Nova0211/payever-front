/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { APP_BASE_HREF } from '@angular/common';
import '@angular/localize/init';
import { renderModule } from '@angular/platform-server';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as cookieParser from 'cookie-parser';
import express from 'express';
import fetch from 'node-fetch';
import { HTMLElement, parse } from 'node-html-parser';
import * as xml from 'xml';

import { getRouteData } from '@pe/builder-client';
import { AzureHelper, AZURE_BLOB_NAME, createAzureHelper, getHost, ShortAppData, ShortPageData } from '@pe/builder-client-helpers';
import { PebPageVariant } from '@pe/builder-core';
import { AppType, APP_TYPE, PE_ENV } from '@pe/common';

import 'zone.js/dist/zone-node';
import {
  DEFAULT_APP,
  detectScreen,
  fetchApp,
  fetchAppData,
  fetchCategories,
  fetchProducts,
  fetchThemeData,
  generateAffiliateCookies,
  getAffiliateCookies,
  HandledError,
  PE_AFFILIATE_COOKIE,
  PE_AFFILIATE_PARAM,
  PE_HASH_PARAM,
  PE_PROGRAM_PARAM,
} from './src/config';
import { environment } from './src/environments/environment';
import { AppServerModule } from './src/main.server';



// https://github.com/angular/universal/issues/1159
// global['requestAnimationFrame'] = (callback, _) => {
//   let lastTime = 0;
//   const currTime = new Date().getTime();
//   const timeToCall = Math.max(0, 16 - (currTime - lastTime));
//   const id = setTimeout(() => callback(currTime + timeToCall),
//     timeToCall);
//   lastTime = currTime + timeToCall;
//   return id;
// };
global['cancelAnimationFrame'] = (id) => clearTimeout(id);
global['XMLHttpRequest'] = require('xhr2');

if (!environment.production) {
  require('dotenv').config();
}
const appType = process.env.APP_TYPE as AppType;

async function createSitemap(appData: ShortAppData, domain: string): Promise<string> {
  const pagesDict: { [id: string]: ShortPageData } = appData.pages.reduce((acc, page) => {
    acc[page.id] = page;

    return acc;
  }, {});
  const sitemapItems = appData.routing.reduce((acc, route) => {
    const page = pagesDict[route.pageId];
    if (page) {
      const urlLevel = route.url === '/' ? 0 : route.url.replace(/^\/|\/$/g, '').split('/').length;
      acc.push({
        urlLevel,
        item: {
          url: [
            { loc: `${domain}${route.url}` },
            { lastmod: page.updatedAt?.split('T')[0] },
            { changefreq: 'weekly' },
            { priority: route.url === '/' ? '1.0' : '0.6' },
          ],
        },
      });
    }

    return acc;
  }, []);

  const products = await fetchProducts(environment.apis, appData.app, fetch);
  const productsUrl = appData.data.productPages;

  if (productsUrl) {
    const productUrlLevel = productsUrl.replace(/^\/|\/$/g, '').split('/').length;
    products.forEach(product => {
      if (product.slug) {
        sitemapItems.push({
          urlLevel: productUrlLevel,
          item: {
            url: [
              { loc: `${domain}${productsUrl.replace(':productId', product.slug)}` },
              { changefreq: 'weekly' },
              { priority: '0.6' },
            ],
          },
        });
      }
    });
  }

  sitemapItems.sort((a, b) => a.urlLevel - b.urlLevel);

  const sitemapObject = {
    urlset: [
      {
        _attr: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        },
      },
      ...sitemapItems.map(i => i.item),
    ],
  };

  return `<?xml version="1.0" encoding="UTF-8"?>${xml(sitemapObject)}\n`;
}


// HACK to provide system variable to Angular
// https://medium.com/geekculture/load-configuration-environment-variables-into-angular-efficiently-when-using-ssr-6474c34bb675
const replaceEnvInline = (templateIndex: string, injectAppType: string, baseHref: string, appName?: string): string => {
  const inlineEnv = `<!-- ENV BEGIN --><script>window['env'] = {}; window['env'].APP_TYPE = '${injectAppType}'; window['env'].APP_BASE_HREF = '${baseHref}';${appName ? `window['env'].APP_NAME = '${appName}'` : ''}</script>`;
  const faviconTpl = `<link rel="icon" type="image/x-icon" href="${injectAppType ? `/assets/${injectAppType}-` : ''}favicon.ico">`;
  const envBeginPosition = templateIndex.indexOf('<!-- ENV BEGIN -->');
  const envEndPosition = templateIndex.indexOf('<!-- ENV END -->');
  const envLink = templateIndex.substring(envBeginPosition, envEndPosition);

  return templateIndex.replace(envLink, inlineEnv).replace('<!-- FAVICON -->', faviconTpl);
};
const injectEnvInline = (filename, injectAppType = appType, baseHref = '/', appName?: string) => {
  const templateIndex = readFileSync(filename).toString();
  const variablesTemplateIndex = replaceEnvInline(templateIndex, injectAppType, baseHref, appName);
  writeFileSync(filename, variablesTemplateIndex, { encoding: 'utf-8' });
};

injectEnvInline(`${join(process.cwd(), 'dist/builder-client/browser')}/index.html`);

const version = require('../../package.json').version;

export function app(secondary = false): any {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/builder-client/browser');
  const indexDocument = readFileSync(`${distFolder}/index.html`).toString();
  const env = environment.apis;
  const azureHelper = createAzureHelper(env.custom?.storage ?? '');

  server.use(cookieParser());
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y',
  }));

  server.get('/api/status', (req, res) => res.send('ok'));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    let baseHref = req.baseUrl;
    let host = environment.production
      ? (req.get('x-forwarded-host') || req.headers.host).replace(/\:.*$/, '')
      : DEFAULT_APP;
    let reqAppType = appType;
    let url = req.params[0];

    if (secondary) {
      if (!req.headers['app-type'] || !req.headers['app-name'] || !req.headers['app-url']) {
        res.status(404).send('');

        return;
      }

      baseHref = req.url.replace(new RegExp(`${url.replace('?', '\\?')}$`), '');
      host = req.headers['app-name'] as string;
      reqAppType = req.headers['app-type'] as AppType;
      url = req.headers['app-url'] as string;
    }

    const appHost = getHost(reqAppType, env);
    const hostMatches = host.match(new RegExp(`(.+)\.${appHost?.replace('.', '\.')}$`));
    let domain = hostMatches && hostMatches.length > 1 ? hostMatches[1] : host;
    const userAgentScreen = detectScreen(req.get('user-agent') ?? '');

    if (reqAppType !== AppType.Pos || url === 'sitemap.xml') {
      let isSpecialPage = false;

      return azureHelper.getAppData(distFolder, host, env, undefined, reqAppType)
        .then(appData => {
          if (appData.app?.accessConfig?.internalDomain !== domain) {
            throw new Error('fetch app data');
          }

          return appData;
        })
        .catch(() => fetchAppData(env, host, fetch, reqAppType)
          .then(app => {
            if (app.accessConfig?.internalDomain) {
              domain = app.accessConfig.internalDomain;
            }
            const internalHost = `${domain}.${appHost}`;

            return azureHelper.getAppData(distFolder, internalHost, env, undefined, reqAppType)
              .catch(() => {
                const appId = app?._id ?? app?.id;

                return fetchThemeData(env, fetch, reqAppType, appId)
                  .then(theme => ({ theme, app }));
              });
          }),
        )
        .then(appData => {
          if (!req.cookies[PE_AFFILIATE_COOKIE]) {
            if (req.query[PE_HASH_PARAM]) {
              return getAffiliateCookies(env, appData?.app?.businessId, req.query[PE_HASH_PARAM] as string, fetch)
                .then(cookieData => {
                  const cookieOptions: express.CookieOptions = {
                    maxAge: cookieData?.cookieTime ? (cookieData?.cookieTime * 86400000) : 3600000,
                    httpOnly: true,
                    secure: environment.production,
                  };
                  res.cookie(PE_AFFILIATE_COOKIE, cookieData, cookieOptions);

                  return appData;
                });
            }

            if (req.query[PE_AFFILIATE_PARAM] && req.query[PE_PROGRAM_PARAM]) {
              return generateAffiliateCookies(
                  env,
                  appData.app?.businessId,
                  req.query[PE_AFFILIATE_PARAM] as string,
                  req.query[PE_PROGRAM_PARAM] as string,
                  fetch
                )
                .then(cookieData => {
                  res.redirect(301, `${req.url}&${PE_HASH_PARAM}=${cookieData.hash}`);

                  throw new HandledError();
                })
                .catch(() => appData);
            }
          }

          return appData;
        })
        .then(appData => fetchCategories(env, appData.app, fetch).then(categories => ({ appData, categories })))
        .then(({ appData, categories }) => {
          const routeData = getRouteData(url, appData.theme, categories);
          isSpecialPage = [PebPageVariant.Default, PebPageVariant.Front].some( v => v === routeData.pageVariant);
          const cdnUrl = `${env?.custom?.storage}/${AZURE_BLOB_NAME}`;
          const domainName = appData?.version ? `${domain}/${appData?.version}` : `${domain}`;
          const path = url === '/sitemap.xml'
            ? AzureHelper.getBlobUrl(cdnUrl, domainName, '/', 'sitemap.xml', reqAppType)
            : AzureHelper.getTemplateBlobUrl(cdnUrl, domainName, url, userAgentScreen, reqAppType);

          return { path, appData, categories };
        })
        .then(({ path, appData, categories }) => {
          if (url === '/sitemap.xml') {
            return createSitemap(appData, `https://${domain}.${appHost}`)
              .then(sitemap => {
                res.setHeader('content-type', 'text/xml');
                res.status(200).send(sitemap);
              });
          }

          return (secondary ? Promise.reject() : fetch(path))
            .then(data => {
              if (!data.ok || !environment.production) {
                throw new Error();
              }

              return data.text();
            })
            .then(template => {
              const dom: HTMLElement = parse(template);
              const html = dom?.childNodes.find((node: HTMLElement) => node.rawTagName === 'html');
              const body = html?.childNodes.find((node: HTMLElement) => node.rawTagName === 'body') as HTMLElement;
              const peClientVersion = body?.getAttribute('pe-client-version');

              if (peClientVersion && peClientVersion !== version) {
                throw new Error('invalid client version');
              }

              return template;
            })
            .catch(async () => {
              const { app: application, theme } = await fetchApp(env, host, fetch, reqAppType);
              const template = await renderModule(
                AppServerModule,
                {
                  url,
                  document: indexDocument,
                  extraProviders: [
                    {
                      provide: APP_TYPE,
                      useValue: reqAppType,
                    },
                    {
                      provide: APP_BASE_HREF,
                      useValue: baseHref,
                    },
                    {
                      provide: 'USER_AGENT_SCREEN',
                      useValue: userAgentScreen,
                    },
                    {
                      provide: 'APP',
                      useValue: application,
                    },
                    {
                      provide: 'THEME',
                      useValue: theme,
                    },
                    {
                      provide: 'CATEGORIES',
                      useValue: categories,
                    },
                    {
                      provide: PE_ENV,
                      useValue: env,
                    },
                  ],
                },
              );

              if (environment.production && !isSpecialPage) {
                azureHelper.uploadFile(
                  template,
                  `${domain}/${appData.app?.accessConfig?.version}`,
                  url,
                  `index.${userAgentScreen}.html`,
                  reqAppType,
                );
              }

              return template;
            })
            .then(template => {
              const tpl = secondary ? replaceEnvInline(template, reqAppType, baseHref, host) : template;
              res.send(tpl);
            });
        })
        .catch(error => {
          if (error instanceof HandledError) {

              return;
            }

          throw error;
        });
    } else {
      return fetchApp(env, host, fetch, reqAppType)
        .then(({ app: application, theme }) => {
          return renderModule(
            AppServerModule,
            {
              url,
              document: indexDocument,
              extraProviders: [
                {
                  provide: APP_TYPE,
                  useValue: reqAppType,
                },
                {
                  provide: APP_BASE_HREF,
                  useValue: baseHref,
                },
                {
                  provide: 'USER_AGENT_SCREEN',
                  useValue: userAgentScreen,
                },
                {
                  provide: 'APP',
                  useValue: application,
                },
                {
                  provide: 'THEME',
                  useValue: theme,
                },
                {
                  provide: PE_ENV,
                  useValue: env,
                },
              ],
            },
          );
        })
        .then(template => {
          res.send(template);
        });
    }
  });

  return server;
}

function run(): void {
  const port = process.env.APP_PORT || process.env.PORT || 4000;
  const secondaryPort = process.env.APP_SECONDARY_PORT || process.env.SECONDARY_PORT || 4001;

  // Start up the Node server
  const server = app();
  const secondaryServer = app(true);
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });

  secondaryServer.listen(secondaryPort, (err) => {
    if (err) {
      console.error(err);

      return;
    }

    console.log(`Node Express secondary server listening on http://localhost:${secondaryPort}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
// eslint-disable-next-line no-underscore-dangle
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
