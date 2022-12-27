import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CosMessageBus } from '@pe/base';
import { ButtonModule } from '@pe/button';
import { MessageBus } from '@pe/common';
import { PlatformHeaderService } from '@pe/header';
import { I18nModule } from '@pe/i18n';
import { loadStyles } from '@pe/lazy-styles-loader';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { PeSimpleStepperService, PeStepperModule, PeStepperService } from '@pe/stepper';
import { WelcomeScreenModule } from '@pe/welcome-screen';

import { MicroContainerComponent } from './components/micro-container/micro-container.component';
import { PricingOverlayComponent } from './components/pricing-overlay/pricing-overlay.component';
import { SelectPlanBarComponent } from './components/select-plan-bar/select-plan-bar.component';
import { MicroContainerRoutingModule } from './micro-container-routing.module';
import { PeMicroHeaderService } from './services/micro-header.service'


loadStyles(['lazy-styles']);
(window as any).PayeverStatic.IconLoader.loadIcons([
  'apps',
  'settings',
  'builder',
  'dock',
  'edit-panel',
  'social',
  'dashboard',
  'notification',
  'widgets',
  'payment-methods',
  'shipping',
  'banners',
]);


@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    MicroContainerRoutingModule,
    ButtonModule,
    MatProgressSpinnerModule,
    PeStepperModule,
    WelcomeScreenModule,
    PePlatformHeaderModule,
  ],
  declarations: [
    MicroContainerComponent,
    SelectPlanBarComponent,
    PricingOverlayComponent,
  ],
  providers: [
    PeStepperService,
    PeSimpleStepperService,
    PeMicroHeaderService,
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderService,
    },
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
  ],
})
export class MicroContainerModule { }
