import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebMessagesComponent } from './messages';

@NgModule({
  imports: [CommonModule],
  exports: [PebMessagesComponent],
  declarations: [PebMessagesComponent],
})
export class PebMessagesModule {}
