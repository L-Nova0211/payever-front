import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UploaderComponent } from './uploader.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    UploaderComponent,
  ],
  exports: [
    UploaderComponent,
  ],
})
export class PeUploaderModule { }

