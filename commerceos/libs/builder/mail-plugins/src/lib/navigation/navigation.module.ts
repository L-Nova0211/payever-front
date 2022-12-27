import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebRendererModule } from '@pe/builder-renderer';
import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorMailNavigationComponent } from './navigation.component';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    PebEditorIconsModule,
    PebRendererModule,
  ],
  declarations: [
    PebEditorMailNavigationComponent,
  ],
  exports: [
    PebEditorMailNavigationComponent,
  ],
})
export class PebEditorMailNavigationModule {
}
