export const environment = {
  production: true,
  envUrls: {
    custom: {
      i18n: 'MICRO_URL_PHP_TRANSLATION',
      cdn: 'MICRO_URL_CUSTOM_CDN',
      widgetsCdn: 'MICRO_URL_WIDGETS_CDN',
      translation: 'MICRO_URL_TRANSLATION_STORAGE',
      storage: 'MICRO_URL_CUSTOM_STORAGE',
    },
    backend: {
      media: 'MICRO_URL_MEDIA',
      message: 'MICRO_URL_MESSAGE',
      products: 'MICRO_URL_PRODUCTS',
      livechat: 'MICRO_URL_CONNECT_LIVECHAT',
      auth: 'MICRO_URL_AUTH',
    },
    frontend: {
      commerceos: 'MICRO_URL_FRONTEND_COMMERCEOS',
    },
    apis: {
      custom: {
        elasticUrl: 'MICRO_URL_ELASTIC_APM_SERVER_URL',
      },
    },
  },
};
