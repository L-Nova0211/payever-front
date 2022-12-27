import { CommonModule } from '@angular/common';
import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { FontLoaderService } from '@pe/builder-font-loader';
import { PebRendererModule } from '@pe/builder-renderer';

import { ViewerIconsModule } from './icons/_icons.module';
import { PebViewerDeviceFrameComponent } from './preview-dialog/device-frame/device-frame.component';
import { PebViewerPreviewDialog } from './preview-dialog/preview.dialog';
import {
  defaultScreenThresholds,
  PebViewerConfig,
  ScreenThresholds,
  SCREEN_FROM_WIDTH,
  SCREEN_THRESHOLDS,
} from './viewer.constants';
import { screenFromWidthFactory } from './viewer.utils';
import { PebViewer } from './viewer/viewer';

const exportsViewer = [
  PebViewer,
  PebViewerPreviewDialog,
];

// @dynamic
@NgModule({
  declarations: [
    ...exportsViewer,
    PebViewerDeviceFrameComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    PebRendererModule,
    ViewerIconsModule,
  ],
  providers: [
    FontLoaderService,
  ],
})
export class PebViewerModule {
  static forRoot(thresholds: ScreenThresholds = defaultScreenThresholds): ModuleWithProviders<PebViewerModule> {
    return PebViewerModule.withConfig({ thresholds });
  }

  static withConfig(config: PebViewerConfig): ModuleWithProviders<PebViewerModule> {
    return {
      ngModule: PebViewerModule,
      providers: [
        {
          provide: SCREEN_THRESHOLDS,
          useValue: config.thresholds || defaultScreenThresholds,
        },
        {
          provide: SCREEN_FROM_WIDTH,
          useValue: screenFromWidthFactory(config.thresholds || defaultScreenThresholds),
        },
        FontLoaderService,
      ],
    };
  }

  constructor(
    @Optional() @Inject(SCREEN_THRESHOLDS) thresholds: any,
    @Optional() @Inject(SCREEN_FROM_WIDTH) screenFromWidth: any,
  ) {
    if (!thresholds || !screenFromWidth) {
      console.error('Viewer module should be imported with `forRoot()`');
    }
  }
}
