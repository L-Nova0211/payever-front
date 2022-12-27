import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PeMessageContactsStyleComponent } from './message-contacts-style';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PeMessageContactsStyleComponent,
  ],
  providers: [],
  exports: [
    PeMessageContactsStyleComponent,
  ],
})
export class PeSharedModule {}
