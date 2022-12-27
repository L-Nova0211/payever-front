import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders, Type } from '@angular/core';

import { ngxZendeskWebwidgetConfig } from './ngx-zendesk-webwidget.model';
import { ngxZendeskWebwidgetService } from './ngx-zendesk-webwidget.service';

@NgModule({
  imports: [CommonModule],
})
export class ngxZendeskWebwidgetModule {
  static forRoot(zendeskConfig: Type<ngxZendeskWebwidgetConfig>): ModuleWithProviders<ngxZendeskWebwidgetModule> {
    return {
      ngModule: ngxZendeskWebwidgetModule,
      providers: [
        { provide: ngxZendeskWebwidgetConfig, useClass: zendeskConfig },
        {
          provide: ngxZendeskWebwidgetService,
          useClass: ngxZendeskWebwidgetService,
          deps: [ngxZendeskWebwidgetConfig],
        },
      ],
    };
  }
}

export { ngxZendeskWebwidgetService, ngxZendeskWebwidgetConfig };
