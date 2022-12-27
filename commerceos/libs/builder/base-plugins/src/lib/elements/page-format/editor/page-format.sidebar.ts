import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import {
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebThemeApplicationInterface,
  PebThemePageInterface,
} from '@pe/builder-core';
import { PebEditorElement } from '@pe/builder-main-renderer';
import { isBackgroundGradient } from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PebBackgroundForm, PebBackgroundFormGroup } from '@pe/builder-shared';
import { PebElementSelectionState } from '@pe/builder-state';

@Component({
  selector: 'peb-editor-page-sidebar-format',
  templateUrl: 'page-format.sidebar.html',
  styleUrls: [
    '../../../../../../styles/src/lib/styles/_sidebars.scss',
    './page-format.sidebar.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorPageSidebarFormatComponent {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  @Input() page: PebThemePageInterface;
  @Input() application: PebThemeApplicationInterface;
  @Input() component: PebEditorElement;
  @Input() styles: PebElementStyles;

  background$ = this.selectedElements$.pipe(
    filter(elements => elements.length === 1
      && elements[0].type === PebElementType.Document),
    switchMap(() => this.component.background.form.valueChanges.pipe(
      startWith(this.component.background.form.value),
    )),
    map((value: PebBackgroundFormGroup) => {
      const isGradient = isBackgroundGradient(value.bgImage) && !value.bgColor;

      switch (value.mediaType) {
        case 'none':
          return isGradient
            ? { backgroundImage: value.bgImage }
            : { backgroundColor: value.bgColor };
        case 'video':
          const objectFit = this.component.video.form.value.videoObjectFit?.value ?? null;

          return {
            backgroundSize: objectFit === 'fill' ? '100% 100%' : objectFit,
            backgroundPosition: 'center center',
            backgroundColor: value.bgColor,
            backgroundImage: `url('${this.component.video.form.value.thumbnail}')`,
          };
        default:
          const { backgroundRepeat, backgroundPosition } = this.styles;
          let backgroundSize;
          if (!isGradient) {
            backgroundSize = this.styles.backgroundSize ?? '';
            if (backgroundSize.includes('px')) {
              backgroundSize = backgroundSize
                .replace(/px/g, '')
                .split(' ')
                .map(dimension => `${Number(dimension) / 20}px`)
                .join(' ');
            }
          }

          return {
            backgroundSize,
            backgroundRepeat,
            backgroundPosition,
            backgroundColor: value.bgColor,
            backgroundImage: isGradient ? value.bgImage : `url('${value.bgImage}')`,
          };
      }
    }),
  );

  constructor(
    private editorAccessorService: PebEditorAccessorService,
  ) {
  }

  showBackgroundForm() {
    const editor = this.editorAccessorService.editorComponent;
    editor.detail = { back: 'Style', title: 'Fill' };
    const sidebarCmpRef = editor.insertToSlot(PebBackgroundForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formGroup = this.component.background.form;
    sidebarCmpRef.instance.blurred.pipe(
      tap(() => {
        this.component.background.submit.next();
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }

}
