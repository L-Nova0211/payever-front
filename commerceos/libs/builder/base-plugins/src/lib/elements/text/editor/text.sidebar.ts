import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { delay, filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import {
  isIntegrationData,
  MediaType,
  PebEditorState,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebIntegrationDataType,
} from '@pe/builder-core';
import { PebTextMakerElement } from '@pe/builder-elements';
import { PebEditorElement, PebEditorElementPropertyAlignment } from '@pe/builder-main-renderer';
import { isBackgroundGradient } from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PebBackgroundForm, PebBackgroundFormGroup } from '@pe/builder-shared';
import { PebElementSelectionState } from '@pe/builder-state';
import { PeDestroyService } from '@pe/common';



@Component({
  selector: 'peb-editor-text-sidebar',
  templateUrl: 'text.sidebar.html',
  styleUrls: [
    '../../../../../../styles/src/lib/styles/_sidebars.scss',
    './text.sidebar.scss',
  ],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorTextSidebarComponent implements OnInit {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  @Input() component: PebEditorElement;
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;

  editMode$: Observable<boolean>;

  alignment: PebEditorElementPropertyAlignment;

  background$ = this.selectedElements$.pipe(
    filter(elements => elements.length === 1
      && elements[0].type !== PebElementType.Document),
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
          const objectFit = this.component.video.form.value?.videoObjectFit?.value;

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

  private backgroundFormOpen = false;

  constructor(
    private state: PebEditorState,
    private editorAccessorService: PebEditorAccessorService,
    private destroy$: PeDestroyService,
  ) {
  }

  get backgroundControl(): FormControl {
    return this.component.background?.form.get('bgColor') as FormControl;
  }

  get showTextForm() {
    if (isIntegrationData(this.element?.data?.functionLink)) {
      const dataType = this.element.data.functionLink.dataType;

      return dataType === PebIntegrationDataType.Text;
    }

    return true;
  }

  ngOnInit(): void {
    this.editMode$ = (this.component.target as PebTextMakerElement).editorEnabled$;
    this.component.background?.form.get('bgColor').valueChanges.pipe(
      delay(0),
      tap(() => {
        if (!this.backgroundFormOpen) {
          this.component.background.submit.next();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  showBackgroundForm() {
    this.backgroundFormOpen = true;
    const editor = this.editorAccessorService.editorComponent;
    editor.detail = { back: 'Style', title: 'Fill' };
    const sidebarCmpRef = editor.insertToSlot(PebBackgroundForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formGroup = this.component.background.form;
    sidebarCmpRef.instance.mediaTypes = [
      { name: 'No media', value: MediaType.None },
      { name: 'Image', value: MediaType.Image },
      { name: 'payever Studio', value: MediaType.Studio },
    ];
    sidebarCmpRef.instance.blurred.pipe(
      tap(() => {
        this.backgroundFormOpen = false;
        this.component.background.submit.next();
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }
}
