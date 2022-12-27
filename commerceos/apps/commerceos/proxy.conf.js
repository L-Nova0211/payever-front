const PROXY_CONFIG = [
  {
    context: [
      '/auth'
    ],
    pathRewrite: {
      "^/auth": ""
    },
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true
  },
  {
    context: [
      '/user'
    ],
    pathRewrite: {
      "^/user": ""
    },
    target: 'http://localhost:3500',
    secure: false,
    changeOrigin: true
  },
];

module.exports = PROXY_CONFIG;
