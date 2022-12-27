import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebSocialSharingComponentComponent } from './social-sharing-image';

@NgModule({
  imports: [CommonModule, MatProgressSpinnerModule, PlatformModule],
  exports: [PebSocialSharingComponentComponent, PlatformModule, MatProgressSpinnerModule],
  declarations: [PebSocialSharingComponentComponent],
})
export class PebSocialSharingImageModule {}
