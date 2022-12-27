import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { I18nModule } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  PebButtonModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
  PeSubscriptModule,
} from '@pe/ui';

import {
  PeDomainsConnectExistingDomainComponent,
  PeDomainsPayeverDomainComponent,
  PeDomainsPersonalDomainComponent,
} from './components';
import {
  PeDomainsApiService,
  PeErrorsHandlerService,
} from './services';

@NgModule({
  declarations: [
    PeDomainsConnectExistingDomainComponent,
    PeDomainsPayeverDomainComponent,
    PeDomainsPersonalDomainComponent,
  ],
  exports: [
    PeDomainsConnectExistingDomainComponent,
    PeDomainsPayeverDomainComponent,
    PeDomainsPersonalDomainComponent,
  ],
  imports: [
    ClipboardModule,
    CommonModule,
    ReactiveFormsModule,

    I18nModule,
    PebButtonModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    PeSubscriptModule,
  ],
  providers: [
    PeDomainsApiService,
    PeErrorsHandlerService,
    PeOverlayWidgetService,
  ],
})
export class PeDomainsModule { }
