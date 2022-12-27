import { ModuleWithProviders, NgModule } from '@angular/core';

import { MediaConfig } from './interfaces';
import { MEDIA_CONFIG } from './media.constants';
import {
  IconsPngUrlPipe,
  MediaUrlPipe,
  SafeStylePipe,
  SafeUrlPipe,
} from './pipes';
import { MediaService } from './services';

const pipes = [
  IconsPngUrlPipe,
  MediaUrlPipe,
  SafeUrlPipe,
  SafeStylePipe,
];

@NgModule({
  declarations: [
    ...pipes,
  ],
  exports: [
    ...pipes,
  ],
  imports: [],
  providers: [MediaService],
})
export class MediaModule {

  public static forRoot(config: MediaConfig = {}): ModuleWithProviders<MediaModule> {
    return {
      ngModule: MediaModule,
      providers: [
        {
          provide: MEDIA_CONFIG,
          useValue: config,
        },
      ],
    };
  }
}
