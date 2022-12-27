import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { LoadImageDirective } from './directives/load-image.directive';
import { PeDataAddCollectionProductIconComponent } from './icons/add-collection-product.icons';
import { CloseIconComponent } from './icons/close.icon';
import { HelpIconComponent } from './icons/help.icon';
import { CurrencyFormatterPipe } from './pipes/currency-formatter.pipe';

const ICONS = [PeDataAddCollectionProductIconComponent, HelpIconComponent, CloseIconComponent];

const EXP: any[] = [LoadImageDirective, CurrencyFormatterPipe];

@NgModule({
  imports: [
    MatDialogModule,
    CommonModule,
  ],
  providers: [],
  declarations: [...EXP, ...ICONS],
  exports: [...EXP, ...ICONS],
  entryComponents: [],
})
export class SharedModule {}
