import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import isEqual from 'lodash/isEqual';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { filter, map, pairwise, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { MediaService, PebEditorApi } from '@pe/builder-api';
import {
  isImageContext,
  isIntegrationData,
  MediaType,
  PebEditorState,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebIntegrationDataType,
} from '@pe/builder-core';
import { PebShapeMakerElement } from '@pe/builder-elements';
import {
  PebEditorElement,
  PebEditorElementPropertyAlignment,
  PebShadow,
} from '@pe/builder-main-renderer';
import { MediaDialogService } from '@pe/builder-media';
import { isBackgroundGradient } from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import {
  PebBackgroundForm,
  PebColorForm,
  PebVideoForm,
} from '@pe/builder-shared';
import { PebElementSelectionState } from '@pe/builder-state';

import { PebElementShape } from './shape.constants';

@Component({
  selector: 'peb-editor-shapes-sidebar',
  templateUrl: 'shape.sidebar.html',
  styleUrls: [
    '../../../../../../styles/src/lib/styles/_sidebars.scss',
    './shape.sidebar.scss',
  ],
})
export class PebEditorShapeSidebarComponent implements OnInit, OnDestroy {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  @Input() component: PebEditorElement;
  @Input() element: PebElementShape | PebElementDef;
  @Input() styles: PebElementStyles;

  @ViewChild(PebVideoForm) editorVideoForm: PebVideoForm;
  @ViewChild('shapeMenu') public shapeMenu: TemplateRef<any>;

  color = 'white';
  mediaType = MediaType;
  activeTabIndex$ = new BehaviorSubject<number>(0);

  activeMediaType: MediaType;
  editMode$: Observable<boolean>;

  alignment: PebEditorElementPropertyAlignment;
  form: FormGroup;

  readonly PebIntegrationDataType = PebIntegrationDataType;
  private readonly destroy$ = new Subject<void>();

  background$ = this.selectedElements$.pipe(
    filter(elements => elements.length === 1
      && elements[0].type !== PebElementType.Document),
    switchMap(() =>
      merge(this.component.background.form.valueChanges, this.component.target.data$).pipe(
        startWith(this.component.background.form.value)
      )
    ),
    map(() => {
      const value = this.component.background.form.value;
      const isGradient = isBackgroundGradient(value.bgImage) && !value.bgColor;

      switch (value.mediaType) {
        case MediaType.None:
          return isGradient
            ? { backgroundImage: value.bgImage }
            : { backgroundColor: value.bgColor };
        case MediaType.Video:
          const objectFit = this.component.video.form.value.videoObjectFit?.value;

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

  shadowColor$ = this.selectedElements$.pipe(
    filter(elements => elements.length === 1
      && elements[0].type !== PebElementType.Document),
    switchMap(() => this.component.shadow.form.valueChanges.pipe(
      startWith(this.component.shadow.form.value),
    )),
    map((value: PebShadow) => ({ backgroundColor: value.shadowColor })),
  );

  isImageContext = false;
  isCell = false;

  showRadius$ = this.selectedElements$.pipe(
    filter(elements => elements.length === 1),
    map(elements => {
      return !elements[0]?.meta?.borderRadiusDisabled;
    }),
  );

  constructor(
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
    private editorAccessorService: PebEditorAccessorService,
    private state: PebEditorState,
    private mediaDialogService: MediaDialogService,
  ) {
  }

  ngOnInit() {
    this.editMode$ = (this.component.target as unknown as PebShapeMakerElement).editorEnabled$;

    this.editMode$?.pipe(
      tap((editMode: boolean) => {
        this.activeTabIndex$.next(editMode ? 1 : this.activeTabIndex$.value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.isCell = this.component.parent.definition.type === PebElementType.Grid;

    this.activeMediaType = this.getMediaType();

    this.component.background.form.get('mediaType').patchValue(this.activeMediaType, { emitEvent: false });
    this.component.background.form.get('mediaType').valueChanges.pipe(
      tap(value => this.activeMediaType = value),
      takeUntil(this.destroy$),
    ).subscribe();

    this.component.target.data$.pipe(
      startWith(null),
      pairwise(),
      filter(([prev, curr]) =>
        !isEqual(prev?.context, curr?.context) || !isEqual(prev?.functionLink, curr?.functionLink)),
      tap(([prev, curr]) => {
        this.activeMediaType = this.getMediaType();

        const fn = curr?.functionLink;
        this.isImageContext = isIntegrationData(fn) && isImageContext(fn);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  get showTextForm(): boolean {
    if (isIntegrationData(this.component?.definition.data?.functionLink)) {
      const dataType = this.component.definition.data.functionLink.dataType as PebIntegrationDataType;

      return this.component.definition.type === PebElementType.Shape
        &&  [PebIntegrationDataType.Text, PebIntegrationDataType.Input].includes(dataType);
    }

    return this.component?.definition.type === PebElementType.Shape;
  }

  getMediaType() {
    const bgImage = this.component.background.form.value.bgImage;
    const source = this.component.video.form.value.source;
    const mediaType = this.component.background.form.value.mediaType;

    if (mediaType === MediaType.None) { return MediaType.None; }
    if (mediaType === MediaType.Video && source && source !== '') { return MediaType.Video; }
    if (bgImage && bgImage !== '' && !isBackgroundGradient(bgImage)) { return MediaType.Image; }
    if (mediaType === MediaType.Studio) { return MediaType.Studio; }

    return MediaType.None;
  }

  changeBgInputHandler($event) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      this.component.background.form.controls.file.patchValue(file);
    }
  }

  openStudio(): void {
    const dialog = this.mediaDialogService.openMediaDialog();

    dialog.afterClosed().pipe(
      takeUntil(this.destroy$),
      filter(data => data && data !== ''),
    ).subscribe((data) => {
      if (data && data !== '') {
        this.component.background.form.get('bgImage').patchValue(data.thumbnail);
      }
    });
  }

  getMaxBorderRadius(): number {

    return 0;
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

  showShadowColorForm() {
    const editor = this.editorAccessorService.editorComponent;
    editor.detail = { back: 'Style', title: 'Shadow Color' };
    const sidebarCmpRef = editor.insertToSlot(PebColorForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formControl = this.component.shadow.form.get('shadowColor') as FormControl;
    sidebarCmpRef.instance.blurred.pipe(
      tap(() => {
        this.component.shadow.submit.next();
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
