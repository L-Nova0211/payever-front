import { NgModule } from '@angular/core';
import { ApolloModule } from 'apollo-angular';

import { ApolloConfigModule } from '../../apollo.module';
import { ProfileResolver } from '../../resolver/profile.resolver';
import { SharedModule } from '../../shared';
import { ConfirmDialogService } from '../shipping-profiles/browse-products/dialogs/dialog-data.service';
import { ProductsApiService } from '../shipping-profiles/browse-products/services/api.service';


import { PebNewPackageComponent } from './new-package-modal/new-package.component';
import { ShippingPackagesRoutingModule } from './shipping-packages-routing.module';
import { PebShippingPackagesComponent } from './shipping-packages.component';



@NgModule({
  declarations: [
    PebShippingPackagesComponent,
    PebNewPackageComponent,
  ],
  imports: [
    SharedModule,
    ShippingPackagesRoutingModule,
    ApolloModule,
    ApolloConfigModule,
  ],
  providers: [
    ProductsApiService,
    ConfirmDialogService,
    ProfileResolver,
  ],
})
export class ShippingPackagesModule {}
