import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebLogoPickerComponent } from './logo';

@NgModule({
  imports: [CommonModule, MatProgressSpinnerModule],
  exports: [PebLogoPickerComponent, MatProgressSpinnerModule, PlatformModule],
  declarations: [PebLogoPickerComponent],
})
export class PebLogoPickerModule {}
