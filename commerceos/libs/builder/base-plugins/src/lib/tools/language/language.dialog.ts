import { Component, Inject } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PebLanguage, PebShopDataLanguage } from '@pe/builder-core';
import { PebEditorOptionsState, PebSetLanguageAction } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';

import { OverlayData, OVERLAY_DATA } from '../../misc/overlay.data';

@Component({
  selector: 'peb-shop-editor-language-dialog',
  templateUrl: 'language.dialog.html',
  styleUrls: ['./language.dialog.scss'],
})
export class PebEditorLanguageToolDialogComponent {

  @Select(PebEditorOptionsState.language) language$!: Observable<PebLanguage>;

  languages = this.editorStore.availableLanguages;

  constructor(
    @Inject(OVERLAY_DATA) public overlayData: OverlayData,
    private store: Store,
    private editorStore: PebEditorStore,
  ) {
  }

  setValue(value: PebShopDataLanguage) {
    if (!value.active) {
      return;
    }

    this.store.dispatch(new PebSetLanguageAction(value.language));
    this.overlayData.emitter.next(value.language);
  }

  openLanguageSidebar() {
    this.overlayData.emitter.next(null);
  }
}
