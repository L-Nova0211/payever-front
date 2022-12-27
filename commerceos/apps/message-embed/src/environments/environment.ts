// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  envUrls: {
    custom: {
      i18n: 'https://translation-backend.test.devpayever.com',
      cdn: 'https://cdn.test.devpayever.com',
      widgetsCdn: 'https://widgets.test.devpayever.com',
      translation: 'https://payevertesting.azureedge.net',
      storage: 'https://payevertesting.blob.core.windows.net',
    },
    backend: {
      media: 'https://media.test.devpayever.com',
      message: 'https://message-backend.test.devpayever.com',
      products: 'https://products-backend.test.devpayever.com',
      livechat: 'https://livechat-backend.test.devpayever.com',
      auth: 'https://auth.test.devpayever.com',
    },
    frontend: {
      commerceos: 'https://commerceos.test.devpayever.com',
    },
    apis: {
      custom: {
        elasticUrl: 'https://dcf931daf8b94ce8aaa202112daad769.apm.westeurope.azure.elastic-cloud.com:443',
      },
    },
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
