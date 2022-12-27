import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { MediaService } from '@pe/builder-api';
import {
  isImageContext,
  isIntegrationData,
  MediaItemType,
  MediaType,
  PebElementDef,
} from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { MediaDialogService } from '@pe/builder-media';
import { FillType, FillTypes, ImageSizes, SelectOption, VideoSize, VideoSizes } from '@pe/builder-old';
import { isBackgroundGradient, PebRTree } from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';

export enum PebBackgroundFormTab {
  Preset = 'Preset',
  Color = 'Color',
  Gradient = 'Gradient',
  Media = 'Media',
}

@Component({
  selector: 'peb-background-form',
  templateUrl: './background.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './background.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebBackgroundForm implements OnInit, OnDestroy {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  selectedElements: PebElementDef[];

  @Input() formGroup: FormGroup;
  @Input() label = 'Background';
  @Input() fillTypes: SelectOption[] = FillTypes;
  @Input() tabs: { [tabName in PebBackgroundFormTab]: boolean } = {
    [PebBackgroundFormTab.Preset]: true,
    [PebBackgroundFormTab.Color]: true,
    [PebBackgroundFormTab.Gradient]: true,
    [PebBackgroundFormTab.Media]: true,
  };

  @Input() activeTab: PebBackgroundFormTab = PebBackgroundFormTab.Media;
  @Output() blurred = new EventEmitter<void>();

  @ViewChild('bgImageInput') bgImageInput: ElementRef;
  @ViewChild('videoInput') videoInput: ElementRef;

  readonly fillType: typeof FillType = FillType;
  readonly PebBackgroundFormTab: typeof PebBackgroundFormTab = PebBackgroundFormTab;
  readonly imageSize: typeof ImageSizes = ImageSizes;
  readonly videoSize: typeof VideoSizes = VideoSizes;
  mediaType = MediaType;
  mediaTypes: Array<{ name: string; value: MediaType }> = [
    { name: 'No media', value: MediaType.None },
    { name: 'Image', value: MediaType.Image },
    { name: 'Video', value: MediaType.Video },
    { name: 'payever Studio', value: MediaType.Studio },
  ];

  readonly destroy$ = new Subject<void>();

  gradientActive = 'start';

  get gradient() {
    const gradient = `linear-gradient(90deg,
      ${this.gradientStartColor} ${this.gradientStartPercent}%,
      ${this.gradientStopColor} ${this.gradientStopPercent}%)`;

    return this.sanitizer.bypassSecurityTrustStyle(gradient);
  }

  get gradientStartColor() {
    return this.formGroup.value.bgColorGradientStart ?? '#ffffff';
  }

  get gradientStartPercent() {
    return this.formGroup.value.bgColorGradientStartPercent ?? 0;
  }

  get gradientStopColor() {
    return this.formGroup.value.bgColorGradientStop ?? '#ffffff';
  }

  get gradientStopPercent() {
    return this.formGroup.value.bgColorGradientStopPercent ?? 100;
  }

  bgImageLoading$ = new BehaviorSubject<boolean>(false);

  thumbnail$ = new ReplaySubject<string>(1);

  component;

  imageBackground$: Observable<{ [klass: string]: any } | null>;

  isImageContext = false;

  constructor(
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private editorAccessorService: PebEditorAccessorService,
    private mediaDialogService: MediaDialogService,
    private renderer: PebEditorRenderer,
    public mediaService?: MediaService,
  ) {
    // TODO: it's temporary
    this.selectedElements$.pipe(
      filter(elements => elements.length > 0),
      tap((elements) => {
        this.component = this.renderer.getElementComponent(elements[0].id);
        const fn = this.component.target.data?.functionLink;
        this.isImageContext = isIntegrationData(fn) && isImageContext(fn);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit(): void {
    this.imageBackground$ = this.formGroup.get('imageBgForm.bgColor')?.valueChanges.pipe(
      startWith(this.formGroup.get('imageBgForm.bgColor').value),
      distinctUntilChanged(),
      map(backgroundColor => ({ backgroundColor })),
    );

    this.formGroup.get('bgImage')?.valueChanges.pipe(
      tap((value) => {
        if (!isBackgroundGradient(value)) { this.thumbnail$.next(value); }
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.formGroup.get('mediaType')?.valueChanges.pipe(
      startWith(this.formGroup.get('mediaType').value),
      tap((mediaType) => {
        const bgImage = this.formGroup.value.bgImage;
        if (mediaType === MediaType.Video && this.component?.video?.form.value.thumbnail) {
          this.thumbnail$.next(this.component.video.form.value.thumbnail);
        } else if (mediaType === MediaType.Image) {
          this.thumbnail$.next(
            bgImage && !isBackgroundGradient(bgImage) ? bgImage : this.component?.styles?.backgroundImage
          );
        } else {
          this.thumbnail$.next(null);
        }

        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.component?.video?.form.get('videoObjectFit')?.valueChanges.pipe(
      startWith(this.component.video.form.get('videoObjectFit').value),
      tap((videoObjectFit: any) => {
        if (videoObjectFit?.value !== VideoSize.OriginalSize) {
          this.component.video.form.get('videoScale')?.disable({ emitEvent: false });
        } else {
          this.component.video.form.get('videoScale')?.enable({ emitEvent: false });
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.component?.video?.form.valueChanges.pipe(
      filter(() => this.formGroup.get('mediaType')?.value === MediaType.Video),
      tap((value: any) => {
        this.thumbnail$.next(value.thumbnail);
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  changeBgInputHandler($event) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      this.formGroup.controls.file.patchValue(file);
      this.bgImageInput.nativeElement.value = null;
    }
  }

  changeVideoInputHandler($event) {
    if ($event.target.files.length) {
      this.bgImageLoading$.next(true);
      this.component?.video?.submit.next($event);

      this.component?.video?.form.valueChanges.pipe(
        take(1),
        finalize(() => this.bgImageLoading$.next(false)),
        takeUntil(this.component.video.result$),
      ).subscribe();

      this.videoInput.nativeElement.value = null;
    }
  }

  getFillType(): string {
    return this.formGroup.get('fillType').value && this.formGroup.get('fillType').value.name
      ? this.formGroup.get('fillType').value.name
      : this.formGroup.get('fillType').value;
  }

  changeMedia() {
    const mediaType = this.formGroup.value.mediaType;

    if (mediaType === MediaType.Image) { this.bgImageInput?.nativeElement?.click(); }
    if (mediaType === MediaType.Video) { this.videoInput?.nativeElement?.click(); }
    if (mediaType === MediaType.Studio) { this.openMediaStudio(); }
  }

  openMediaStudio() {
    this.mediaDialogService.openMediaDialog({ types: [MediaItemType.Image] })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data && data !== '') {
          this.formGroup.get('mediaType').patchValue(MediaType.Image, { emitEvent: false });
          this.formGroup.get('bgImage').patchValue(data.thumbnail);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showImageBackgroundForm(): void {
    const editor = this.editorAccessorService.editorComponent;
    editor.optionList = { back: 'Style', title: 'Fill' };
    const sidebarCmpRef = editor.insertToSlot(PebBackgroundForm, PebEditorSlot.sidebarOptionList);
    sidebarCmpRef.instance.formGroup = this.formGroup.get('imageBgForm') as FormGroup ;
    sidebarCmpRef.instance.tabs[PebBackgroundFormTab.Media] = false;
    sidebarCmpRef.instance.tabs[PebBackgroundFormTab.Gradient] = false;
    sidebarCmpRef.instance.activeTab = PebBackgroundFormTab.Color;
    sidebarCmpRef.instance.blurred.pipe(
      tap(() => {
        this.component.background.submit.next();
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }
}
