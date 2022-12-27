import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AuthModule } from '@pe/auth';
import { SnackBarService } from '@pe/forms-core';
import { MediaUrlPipe } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';

import { CountriesPipe } from './pipes/countries.pipe';
import { CountryPipe } from './pipes/country.pipe';
import { CurrencySymbolPipe } from './pipes/currency.pipe';
import { NumericPipe } from './pipes/keypress.pipe';
import { PebConnectComponent } from './routes/connect/connect.component';
import { PebDeliveryByLocationComponent } from './routes/delivery-by-location/delivery-by-location.component';
import {
  LibShippingEditLocationModalComponent,
} from './routes/delivery-by-location/edit-location-modal/edit-location-modal.component';
import { PebPackagingSlipComponent } from './routes/packaging-slip/packaging-slip.component';
import { PebPickupByLocationComponent } from './routes/pickup-by-location/pickup-by-location.component';
import { PebShippingComponent } from './routes/root/shipping.component';
import { SharedModule } from './shared';
import { PebShippingRouteModule } from './shipping.routing';
import { ShippingAppState } from './store/shipping.state';

// HACK: fix --prod build
export const PeAuthModuleForRoot = AuthModule.forRoot();
export const ngxsModule = NgxsModule.forFeature([ShippingAppState]);



(window as any)?.PayeverStatic.IconLoader.loadIcons([
  'apps',
  'set',
  'flags',
]);

@NgModule({
  declarations: [
    PebShippingComponent,
    PebDeliveryByLocationComponent,
    PebPickupByLocationComponent,
    PebPackagingSlipComponent,
    PebConnectComponent,
    LibShippingEditLocationModalComponent,
    CountryPipe,
    CountriesPipe,
    CurrencySymbolPipe,
  ],
  imports: [
    PebShippingRouteModule,
    SharedModule,
    PePlatformHeaderModule,
    PeAuthModuleForRoot,
    ngxsModule,
  ],
  providers: [
    PeOverlayWidgetService,
    SnackBarService,
    MediaUrlPipe,
    CountriesPipe,
    NumericPipe,
  ],
})
export class PebShippingModule {}
