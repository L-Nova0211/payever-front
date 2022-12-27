import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { MediaService, PebEditorApi } from '@pe/builder-api';
import { MediaType, PebElementDef, PebElementStyles, PebElementType, PebScreen } from '@pe/builder-core';
import { PebInsertAction } from '@pe/builder-main-editor';
import { PebEditorElement } from '@pe/builder-main-renderer';
import { isBackgroundGradient, PebEditorOptionsState } from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PebBackgroundForm, PebBackgroundFormGroup } from '@pe/builder-shared';
import { PebElementSelectionState } from '@pe/builder-state';


@Component({
  selector: 'peb-editor-section-sidebar',
  templateUrl: 'section.sidebar.html',
  styleUrls: [
    '../../../../../../styles/src/lib/styles/_sidebars.scss',
    './section.sidebar.scss',
  ],
})
export class PebEditorSectionSidebarComponent implements OnInit, OnDestroy {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;
  @Input() component: PebEditorElement;

  mediaType = MediaType;
  PebScreen = PebScreen;
  activeMediaType: MediaType;


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

  private readonly destroy$ = new Subject<void>();

  constructor(
    public sanitizer: DomSanitizer,
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
    private editorAccessorService: PebEditorAccessorService,
    private store: Store,
  ) {
  }

  ngOnInit() {
    this.activeMediaType = this.component.background.form.value.mediaType;
    this.component.background.form.get('mediaType').valueChanges.pipe(
      tap(value => this.activeMediaType = value),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
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

  addSection(): void {
    this.store.dispatch(new PebInsertAction())
  }

  // resetSection(): void {
  //   this.component.section.form.get('copyChanges').patchValue(PebScreen.Desktop);
  // }
  //
  // selectCopyPebScreen(screen: PebScreen) {
  //   this.component.section.form.get('copyChanges').patchValue(screen);
  // }

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
