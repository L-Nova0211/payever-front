import { NgModule } from '@angular/core';
import { ApolloModule } from 'apollo-angular';

import { ApolloConfigModule } from '../../apollo.module';
import { ProfileResolver } from '../../resolver/profile.resolver';
import { SharedModule } from '../../shared';

import { DialogDataExampleDialogComponent } from './browse-products/dialogs/dialog-data.component';
import { ConfirmDialogService } from './browse-products/dialogs/dialog-data.service';
import { ProductsDialogService } from './browse-products/products/products-dialog.service';
import { ProductsApiService } from './browse-products/services/api.service';
import { ProductsListService } from './browse-products/services/products-list.service';
import { ProfileWrapComponent } from './profiles-dialog/profile-wrap.component';
import { PebShippingProfileFormComponent } from './profiles-dialog/profiles-dialog.component';
import { ShippingProfilesRoutingModule } from './shipping-profiles-routing.module';
import { PebShippingProfilesComponent } from './shipping-profiles.component';

@NgModule({
  declarations: [
    ProfileWrapComponent,
    PebShippingProfilesComponent,
    PebShippingProfileFormComponent,
    DialogDataExampleDialogComponent,
  ],
  imports: [
    SharedModule,
    ShippingProfilesRoutingModule,
    ApolloModule,
    ApolloConfigModule,
  ],
  providers: [
    ProductsListService,
    ProductsApiService,
    ConfirmDialogService,
    ProductsDialogService,
    ProfileResolver,
  ],
})
export class ShippingProfilesModule {}
