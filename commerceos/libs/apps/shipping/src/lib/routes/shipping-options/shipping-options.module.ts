import { NgModule } from '@angular/core';
import { ApolloModule } from 'apollo-angular';

import { ApolloConfigModule } from '../../apollo.module';
import { ProfileResolver } from '../../resolver/profile.resolver';
import { ZoneResolver } from '../../resolver/zone.resolver';
import { SharedModule } from '../../shared';


import { PebShippingEditOptionsComponent } from './edit-options-modal/edit-options.component';
import { ShippingOptionsRoutingModule } from './shipping-options-routing.module';
import { PebShippingOptionsComponent } from './shipping-options.component';

@NgModule({
  declarations: [
    PebShippingOptionsComponent,
    PebShippingEditOptionsComponent,
  ],
  imports: [
    SharedModule,
    ShippingOptionsRoutingModule,
    ApolloModule,
    ApolloConfigModule,
  ],
  providers: [
    /* ProductsListService,
    ProductsApiService,
    ConfirmDialogService,
    ProductsDialogService, */
    ZoneResolver,
  ],
})
export class ShippingOptionsModule {}
