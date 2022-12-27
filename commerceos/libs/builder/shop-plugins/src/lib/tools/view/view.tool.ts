import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { AbstractPebEditorTool } from '@pe/builder-base-plugins';
import { PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes } from '@pe/builder-services';

import { OVERLAY_SHOP_DATA } from '../../misc/overlay.data';
import { OverlayShopDataValue, ShopEditorSidebarTypes } from '../../misc/types';

import { PebEditorViewToolDialogComponent } from './view.dialog';

@Component({
  selector: 'peb-editor-view-tool',
  templateUrl: './view.tool.html',
  styleUrls: ['./view.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorViewTool extends AbstractPebEditorTool {

  constructor(injector: Injector) {
    super(injector);
    this.overlayData = OVERLAY_SHOP_DATA;
  }

  openView(element: HTMLElement) {
    const overlay: Observable<OverlayShopDataValue> = this.openOverlay(
      PebEditorViewToolDialogComponent,
      element,
      this.editorState,
    );

    overlay.pipe(
      first(),
      filter(Boolean),
      tap((selectedView: OverlayShopDataValue) => {
        if (selectedView === ShopEditorSidebarTypes.EditMasterPages) {
          this.editorState.pagesView = this.editorState.pagesView === PebPageType.Replica
            ? PebPageType.Master
            : PebPageType.Replica;
        }
        if (
          selectedView === EditorSidebarTypes.Navigator
          || selectedView === EditorSidebarTypes.Inspector
          || selectedView === EditorSidebarTypes.Layers
        ) {
          this.editorState.sidebarsActivity = {
            ...this.editorState.sidebarsActivity,
            [selectedView]: !this.editorState.sidebarsActivity[selectedView],
          };
        }
      }),
      tap(() => this.detachOverlay()),
    ).subscribe();
  }
}
