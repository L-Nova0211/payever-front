import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorActionsHistoryTool } from './actions-history.tool';


@NgModule({
  declarations: [
    PebEditorActionsHistoryTool,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
  exports: [
    PebEditorActionsHistoryTool,
  ],
})
export class PebEditorActionsHistoryToolModule {
}
