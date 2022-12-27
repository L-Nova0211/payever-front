import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { PebLanguage } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';

import { OverlayDataValue } from '../../misc/overlay.data';
import { AbstractPebEditorTool } from '../abstract.tool';

import { PebEditorLanguageToolDialogComponent } from './language.dialog';

@Component({
  selector: 'peb-editor-language-tool',
  templateUrl: './language.tool.html',
  styleUrls: ['./language.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorLanguageTool extends AbstractPebEditorTool {

  @Select(PebEditorOptionsState.language) language$!: Observable<PebLanguage>;

  get makerActive$() {
    return this.editorState.textEditorActive$.pipe(map(tea => !!tea));
  }

  constructor(injector: Injector) {
    super(injector);
  }

  openLanguage(element: HTMLElement) {
    const overlay: Observable<OverlayDataValue> = this.openOverlay(
      PebEditorLanguageToolDialogComponent,
      element,
    );

    overlay.pipe(
      take(1),
      tap((language: OverlayDataValue) => {
        if (!language) {
          this.execCommand.emit({ type: 'toggleLanguagesSidebar' });

          return;
        }

        this.detachOverlay();
      }),
    ).subscribe();
  }
}
