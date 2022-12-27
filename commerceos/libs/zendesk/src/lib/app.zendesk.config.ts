import { ngxZendeskWebwidgetConfig } from './ngx-zendesk-webwidget';

window['zESettings'] = {
  webWidget: {
    position: { horizontal: 'left', vertical: 'bottom' },
  },
};

export class ZendeskConfig extends ngxZendeskWebwidgetConfig {
  accountUrl = 'payeverorg.zendesk.com';
  beforePageLoad(zE: any) {
    zE.setLocale('de');
    zE.hide();
  }
}
