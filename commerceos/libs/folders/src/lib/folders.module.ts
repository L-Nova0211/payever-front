
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';

import { PebDeviceService } from '@pe/common';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { I18nModule } from '@pe/i18n';
import { PeLongPressEventDirectiveModule } from '@pe/ui'

import { PeFoldersMaterialComponent } from './components/material/material.component';
import { PreviewContainerComponent } from './components/preview-container/preview.component';
import { PeFolderSkeletonComponent } from './components/skeleton/skeleton.component';
import { PeFolderComponent } from './container/folders.component';
import { DropIntoFolderDirective } from './directives/drop-into-folder.directive';
import { ClickOutsideDirective } from './directives/outside-click.directive';
import { DragAndDropService } from './services/drag-drop.service';
import { FolderDatabase } from './services/folder-database.service';
import { FolderService } from './services/folder.service';

export const i18n = I18nModule.forChild();

@NgModule({
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    i18n,
    ConfirmationScreenModule,
    DragDropModule,
    PortalModule,
    PeLongPressEventDirectiveModule,
  ],
  declarations: [
    PeFolderComponent,
    DropIntoFolderDirective,
    ClickOutsideDirective,
    PeFoldersMaterialComponent,
    PreviewContainerComponent,
    PeFolderSkeletonComponent,
  ],
  providers: [
    FolderService,
    FolderDatabase,
    PebDeviceService,
    DragAndDropService,
  ],
  exports: [
    PeFolderComponent,
    DropIntoFolderDirective,
    DragDropModule,
    ConfirmationScreenModule,
  ],
})
export class PeFoldersModule {
  public static forChild(): ModuleWithProviders<PeFoldersModule> {
    return {
      ngModule: PeFoldersModule,
      providers: [
        FolderService,
        FolderDatabase,
        PebDeviceService,
        DragAndDropService,
      ],
    };
  }

}
