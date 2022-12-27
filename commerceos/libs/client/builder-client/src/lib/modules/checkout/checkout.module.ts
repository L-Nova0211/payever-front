import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import {
  CHANNEL_SET_ID,
  CheckoutMicroService,
  CheckoutSharedService,
  ECMAScriptSupportService,
} from '@pe/common';

import { PebClientStoreService } from '../../services';

import { PebClientCheckoutComponent } from './checkout.component';
import { PebClientCheckoutCartService } from './services/cart.service';
import { PebClientCheckoutService } from './services/checkout.service';
import { PebClientCheckoutMicroLoaderService } from './services/micro.service';

@NgModule({
  declarations: [PebClientCheckoutComponent],
  imports: [CommonModule],
  exports: [PebClientCheckoutComponent],
  providers: [
    PebClientCheckoutMicroLoaderService,
    PebClientCheckoutCartService,
    PebClientCheckoutService,
    ECMAScriptSupportService,
    CheckoutMicroService,
    CheckoutSharedService,
    {
      provide: CHANNEL_SET_ID,
      deps: [PebClientStoreService],
      useFactory: (store) => store.channelSetId,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PebClientCheckoutModule {}
