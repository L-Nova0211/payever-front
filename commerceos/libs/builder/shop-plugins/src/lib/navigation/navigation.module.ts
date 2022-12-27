import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebRendererModule } from '@pe/builder-renderer';
import { PebDirectivesModule, PebEditorIconsModule } from '@pe/builder-shared';

import { PebShopEditorCreatePageDialogComponent } from './dialogs/create-page/create-page.dialog';
import { PageContextMenuComponent } from './dialogs/page-context-menu/page-context-menu.component';
import { PebEditorShopNavigationComponent } from './navigation.component';
import { PageListComponent } from './page-list/page-list.component';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    PebEditorIconsModule,
    PebRendererModule,
    DragDropModule,
    PebDirectivesModule,
  ],
  declarations: [
    PebEditorShopNavigationComponent,
    PageListComponent,
    PageContextMenuComponent,
    PebShopEditorCreatePageDialogComponent,
  ],
  exports: [
    PebEditorShopNavigationComponent,
  ],
})
export class PebEditorShopNavigationModule {}
