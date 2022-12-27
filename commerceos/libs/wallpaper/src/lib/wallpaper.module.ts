import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BrowserDetectService } from '@pe/browser';
import { MediaModule } from '@pe/media';

@NgModule({
  imports: [CommonModule, MediaModule],
  providers: [BrowserDetectService],
})
export class WallpaperModule {}
