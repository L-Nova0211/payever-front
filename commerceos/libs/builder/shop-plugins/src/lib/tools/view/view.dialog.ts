import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';

import { PebEditorState, PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes } from '@pe/builder-services';

import { OverlayShopData, OVERLAY_SHOP_DATA } from '../../misc/overlay.data';
import { ShopEditorSidebarTypes } from '../../misc/types';


@Component({
  selector: 'peb-shop-editor-view-dialog',
  templateUrl: 'view.dialog.html',
  styleUrls: ['./view.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorViewToolDialogComponent implements OnInit {
  option = { ...EditorSidebarTypes, ...ShopEditorSidebarTypes };

  options: { [key in EditorSidebarTypes | ShopEditorSidebarTypes]: { disabled: boolean; active: boolean; } } = {
    [EditorSidebarTypes.Navigator]: {
      disabled: false,
      active: false,
    },
    [EditorSidebarTypes.Inspector]: {
      disabled: false,
      active: false,
    },
    [ShopEditorSidebarTypes.EditMasterPages]: {
      disabled: false,
      active: false,
    },
    [EditorSidebarTypes.Layers]: {
      disabled: false,
      active: false,
    },
  };

  private state: PebEditorState;

  ngOnInit() {
    if (this.state.pagesView === PebPageType.Master) {
      this.options[ShopEditorSidebarTypes.EditMasterPages].active = true;
    }
    this.options[EditorSidebarTypes.Navigator].active = this.state.sidebarsActivity[EditorSidebarTypes.Navigator];
    this.options[EditorSidebarTypes.Inspector].active = this.state.sidebarsActivity[EditorSidebarTypes.Inspector];
    this.options[EditorSidebarTypes.Layers].active = this.state.sidebarsActivity[EditorSidebarTypes.Layers];
  }

  constructor(
    @Inject(OVERLAY_SHOP_DATA) public data: OverlayShopData,
  ) {
    this.state = data.data;
  }

  setValue(value: EditorSidebarTypes | ShopEditorSidebarTypes): void {
    if (!this.options[value].disabled) {
      this.data.emitter.next(value);
    }
  }
}
