# static

script `pe-static.js` from CDN adds global variable PayeverStatic.

## Load icons to page

Page should contain script
- for test `https://payevertest.azureedge.net/js/pe-static.js`
- for stage `https://payeverstage.azureedge.net/js/pe-static.js`
- for prod `https://payever.azureedge.net/js/pe-static.js`

Call script like this. Pass array with needed icons sets as param.
Script will add only missed icons to page

```javascript
PayeverStatic.IconLoader.loadIcons([
  'set',
  'apps',
  'settings',
  'builder',
  'dock',
  'edit-panel',
  'social',
  'dashboard',
  'notification',
  'commerceos',
  'widgets',
  'payment-methods',
  'shipping'
]);
``` 
