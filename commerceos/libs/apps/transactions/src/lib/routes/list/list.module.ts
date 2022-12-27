import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthModule } from '@pe/auth';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { PeSidebarModule } from '@pe/sidebar';
import { PebFormBackgroundModule, PebSelectModule } from '@pe/ui';

import { IconsService } from '../../services/icons.service';
import { SharedModule } from '../../shared/shared.module';

import { ChannelComponent } from './components/channel/channel-component';
import { CreatedAtCellComponent } from './components/created-at-cell/created-at-cell.component';
import { MoveToFolderDialogComponent } from './components/move-to-folder-dialog/move-to-folder.dialog';
import { PaymentComponent } from './components/payment/payment-component';
import { SpecificStatusFieldComponent } from './components/specific-status/specific-status.component';
import { StatusComponent } from './components/status/status-component';
import { PeListComponent } from './list.component';
import { PeListRouteModule } from './list.routing';
import { TransactionLabelPipe } from './pipes';


@NgModule({
  imports: [
    AuthModule,
    PeGridModule,
    PeSidebarModule,
    PeListRouteModule,
    SharedModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    PeFoldersModule,
    CommonModule,
    PebFormBackgroundModule,
    PebSelectModule,
    I18nModule,
  ],
  declarations: [
    PeListComponent,
    MoveToFolderDialogComponent,
    TransactionLabelPipe,

    ChannelComponent,
    CreatedAtCellComponent,
    PaymentComponent,
    StatusComponent,
    SpecificStatusFieldComponent,
  ],
  providers: [
    IconsService,
    TransactionLabelPipe,
  ],
  bootstrap: [
    PeListComponent,
  ],
})

export class PeListModule {}
