import { ComponentRef, Injectable, Injector, Type } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { isEqual, isObject, transform } from 'lodash';
import { EMPTY, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  map,
  pairwise,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorApi } from '@pe/builder-api';
import { PebControlsService, PebRadiusService, PebSetSelectionBBoxAction } from '@pe/builder-controls';
import {
  isImageContext,
  isIntegrationData,
  MediaType,
  PEB_DEFAULT_FONT_COLOR,
  PebEditorState,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  pebGenerateId,
  PebMediaService,
  PebScreen,
  pebScreenContentWidthList,
  PebShopContainer,
  pebScreenDocumentWidthList,
} from '@pe/builder-core';
import {
  PebEditorElement,
  PebEditorRenderer,
  PebShadow,
  VideoSourceType,
  VideoSubTab,
} from '@pe/builder-main-renderer';
import {
  AlignType,
  BgGradient,
  FillType,
  getBgScale,
  getFillType,
  getGradientProperties,
  getSelectedOption,
  ImageSize,
  ImageSizes,
  initFillType,
  isBackgroundGradient,
  PageSidebarDefaultOptions,
  rgbToHex,
  SelectedMedia,
  SelectOption,
  toBase64,
  VideoSize,
} from '@pe/builder-old';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore, SnackbarErrorService } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';
import { PE_ENV } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';

import { showImageSpinner } from '../_utils';
import { stringToRgba } from '../form-control';

export interface DimensionsFormValues {
  width: number;
  height: number;
  keepRation: boolean;
}

export interface ShadowValues {
  blur: number;
  offset: number;
  color: string;
  opacity: number;
  angle: number;
}

@Injectable({ providedIn: 'any' })
export abstract class AbstractEditElementPlugin<T> {
  abstract logger: { log: (...args: any) => void };
  protected abstract sidebarComponent: Type<T>;

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$: Observable<PebScreen>;

  screen: PebScreen;

  protected set editor(editor) {
  }

  protected get editor() {
    return this.editorAccessorService.editorComponent;
  }

  protected editorAccessorService = this.injector.get(PebEditorAccessorService);
  protected state = this.injector.get(PebEditorState);
  protected renderer = this.injector.get(PebEditorRenderer);
  protected editorStore = this.injector.get(PebEditorStore);
  protected formBuilder = this.injector.get(FormBuilder);
  protected snackbarService = this.injector.get(SnackbarService);
  protected snackbarErrorService = this.injector.get(SnackbarErrorService);
  protected domSanitizer = this.injector.get(DomSanitizer);
  protected controlsService = this.injector.get(PebControlsService);
  protected radiusService = this.injector.get(PebRadiusService);

  protected editorApi = this.injector.get(PebEditorApi);
  protected mediaService = this.injector.get(PebMediaService);
  protected tree = this.injector.get(PebRTree);
  protected store = this.injector.get(Store);

  readonly ImageSizes: typeof ImageSizes = ImageSizes;

  protected readonly entityName = this.injector.get('PEB_ENTITY_NAME');

  protected sourceTypeOptions: SelectOption[] = [
    { name: 'My video', value: VideoSourceType.MyVideo },
  ];

  protected constructor(protected injector: Injector) {}

  initElementForms(elCmp: PebEditorElement): PebEditorElement {
    return elCmp;
  }

  initSidebarForms(sidebarRef: ComponentRef<any>): void { }
  handleForms(elCmp: PebEditorElement, sidebarRef: ComponentRef<any>): Observable<any> {
    return new Subject().asObservable();
  }

  finalizeForms(elCmp: PebEditorElement, sidebarRef: ComponentRef<any>): () => void {
    return () => { return; };
  }

  protected initSidebar<P extends PebEditorElement>(elementCmp: P, instanceProps?: Partial<T>): ComponentRef<T> {
    const sidebarCmpRef = this.editor.insertToSlot(this.sidebarComponent, PebEditorSlot.sidebar);

    Object.assign(
      sidebarCmpRef.instance,
      {
        element: elementCmp.definition,
        styles: elementCmp.styles,
        component: elementCmp,
      },
      instanceProps,
    );

    sidebarCmpRef.changeDetectorRef.detectChanges();

    return sidebarCmpRef;
  }

  /** Alignment */
  protected initAlignmentForm(sidebarRef: ComponentRef<any>) {
    sidebarRef.instance.alignment = {
      form: this.formBuilder.group({
        align: [],
      }),
      submit: new Subject<any>(),
    };
  }

  protected handleAlignmentForm(elementCmp: PebEditorElement, sidebarRef: ComponentRef<any>) {
    const alignment = sidebarRef.instance.alignment;

    const element = this.tree.find(elementCmp.definition.id);
    const parent = element.parent;

    return merge(
      alignment.form.get('align').valueChanges.pipe(
        withLatestFrom(this.screen$),
        map(([align, screen]) => {
          const prevPosition = { left: element.styles.left, top: element.styles.top };
          const currPosition = this.getNextAlignmentPosition(screen, parent, element, align);

          element.styles = { ...element.styles, ...currPosition };

          const siblings = [];

          this.tree.elements.forEach((abstractElement) => {
            if (elementCmp.definition.id !== abstractElement.element.id
              && abstractElement.parent?.element.id === elementCmp.definition.parent.id) {
              siblings.push(abstractElement);
            }
          });

          const elementBBox = this.tree.toBBox(element);
          const intersected = siblings.some((editorElement) => {
            const sibling = this.tree.toBBox(this.tree.find(editorElement.element.id));

            return sibling.maxY > elementBBox.minY
              && sibling.maxX > elementBBox.minX
              && sibling.minY < elementBBox.maxY
              && sibling.minX < elementBBox.maxX;
          });

          if (intersected) {
            element.styles = { ...element.styles, ...prevPosition };

            this.snackbarService.toggle(true, {
              content: 'Invalid position',
              duration: 2000,
              iconId: 'icon-commerceos-error',
            });

            return false;
          }
          const controls = this.controlsService.createDefaultControlsSet([element]);
          this.radiusService.renderRadius(controls);
          this.controlsService.renderControls(controls);

          return true;
        }),
        filter((submit) => !!submit),
        tap(() => alignment.submit.next()),
      ),
      alignment.submit.pipe(
        switchMap(() => this.screen$),
        switchMap((screen: PebScreen) => {
          const changes = {
            [elementCmp.definition.id]: {
              top: element.styles.top,
              left: element.styles.left,
            },
          };

          this.tree.insert(element);
          const bBox = this.tree.toBBox(element);
          this.store.dispatch(new PebSetSelectionBBoxAction({
            left: bBox.minX,
            top: bBox.minY,
            right: bBox.maxX,
            bottom: bBox.maxY,
          }));

          // this.controlsService.redraw();

          this.logger.log('Align: Submit ', alignment.form.value);

          return this.editorStore.updateStyles(screen, changes);
        }),
      ),
    );
  }

  /** Video */
  protected initVideoForm(elementCmp: PebEditorElement) {
    const elm = this.tree.find(elementCmp.definition.id);

    const initialValue = {
      videoSubTab: VideoSubTab.Media,
      sourceOptions: this.sourceTypeOptions,
      sourceType: this.sourceTypeOptions[0],
      source: elm?.data?.source,
      thumbnail: elm?.data?.thumbnail,
      file: elm?.data?.file,
      autoplay: elm?.data?.autoplay,
      controls: elm?.data?.controls,
      loop: elm?.data?.loop,
      sound: elm?.data?.sound,
      preview: elm?.data?.preview,
      videoObjectFit: elm?.data?.videoObjectFit ?? PageSidebarDefaultOptions.VideoSize,
      videoScale: elm?.data?.videoScale ?? PageSidebarDefaultOptions.videoScale,
    };

    elementCmp.video = {
      initialValue,
      form: this.formBuilder.group({
        sourceType: [initialValue.sourceType],
        source: [initialValue.source],
        file: [initialValue.file],
        thumbnail: [initialValue.thumbnail],
        autoplay: [initialValue.autoplay],
        controls: [initialValue.controls],
        loop: [initialValue.loop],
        sound: [initialValue.sound],
        preview: [initialValue.preview],
        videoObjectFit: [initialValue.videoObjectFit],
        videoScale: [initialValue.videoScale],
      }),
      update: null,
      submit: new Subject<Event>(),
      result$: new Subject(),
    };

    if (initialValue.source) {
      elementCmp.background.form.get('fillType').patchValue({ name: 'Video' });
    }
  }

  protected handleVideoForm(elementCmp: PebEditorElement, sidebarRef: ComponentRef<any>): Observable<any> {
    const video = elementCmp.video;
    const elm = this.tree.find(elementCmp.definition.id);

    return merge(
      this.updateVideoFieldSetting(elementCmp.video.form),
      video.form.valueChanges.pipe(
        startWith(null),
        pairwise(),
        switchMap(([prev, changes]) => {
          if (elm.video && prev?.autoplay !== changes.autoplay) {
            changes.autoplay
              ? elm.video.nativeElement.play()
              : elm.video.nativeElement.pause();

            elm.video.nativeElement.currentTime = 0;
          }

          const newElementDef: PebElementDef = {
            ...elementCmp.definition,
            data: {
              ...elementCmp.definition.data,
              ...changes,
            },
          };

          if (changes?.source) {
            const type = elementCmp.definition.type
            const emitEvent = type !== PebElementType.Document && type !== PebElementType.Section;

            elementCmp.background.form.get('fillType').patchValue({ name: 'Video' }, { emitEvent: false });
            elementCmp.background.form.get('bgColor').patchValue('', { emitEvent });
            elementCmp.background.form.get('bgImage').patchValue('', { emitEvent });
          }

          const findElement = this.tree.find(elementCmp.definition.id);

          findElement.data = { ...findElement.data, ...changes };

          return this.editorStore.updateElement(newElementDef).pipe(
            tap(() => {
              elementCmp.detectChanges();
            }),
          );
        }),
      ),
      video.submit.pipe(
        switchMap((changes: Event) => {
          return this.uploadVideo(changes, sidebarRef).pipe(
            tap((result) => {
              const payload: SelectedMedia = {
                preview: result.preview,
                thumbnail: result.thumbnail,
                source: result.blobName,
              };
              video.form.get('preview').patchValue(payload.preview);
              video.form.get('source').patchValue(payload.source);
              video.form.get('thumbnail').patchValue(payload.thumbnail);
              this.snackbarService.toggle(true, {
                content: 'Video is uploaded successfully',
                duration: 2000,
                iconId: 'icon-commerceos-success',
              });
            }),
            catchError((err) => {
              this.snackbarService.toggle(true, {
                content: err?.error?.message ?? 'Upload is not possible due to server error',
                duration: 2000,
                iconId: 'icon-commerceos-error',
              });

              return of(true);
            }),
          ).pipe(tap(r => video.result$.next(r)));
        }),
      ),
    );
  }

  protected uploadVideo(
    $event: Event,
    sidebarRef: ComponentRef<any>,
  ): Observable<any> {
    const target = $event.target as HTMLInputElement;
    const files: FileList = target.files;

    return this.mediaService.uploadVideo(files.item(0), PebShopContainer.BuilderVideo).pipe(
      switchMap((response: { preview: string; thumbnail: string; blobName: string }) => {
        return of(response);
      }),
    );
  }


  protected handleDescriptionForm(elementCmp: PebEditorElement): Observable<any> {
    const description = elementCmp.description;

    return merge(
      description.submit.pipe(
        switchMap(() => {
          if (description.form.invalid) {
            this.logger.log('Description: Change: Invalid');

            return EMPTY;
          }
          const changes = {
            description: description.form.value.description,
          };
          this.logger.log('Description: Submit ', changes);

          return this.editorStore.updateElement({
            ...elementCmp.definition,
            data: {
              ...elementCmp.definition.data,
              ...changes,
            },
          });
        }),
      ),
    );
  }

  /** Shadow */
  protected initShadowForm(elementCmp: PebEditorElement) {
    const shadow = this.parseShadowString(elementCmp.styles.shadow);
    const initialValue = {
      hasShadow: !!elementCmp.styles.shadow,
      shadowBlur: shadow.blur ?? 5,
      shadowColor: shadow.color ?? '#000000',
      shadowOffset: shadow.offset ?? 10,
      shadowOpacity: shadow.opacity ?? 100,
      shadowAngle: shadow.angle ?? 315,
    };

    elementCmp.shadow = {
      initialValue,
      form: this.formBuilder.group({
        hasShadow: [initialValue.hasShadow],
        shadowColor: [initialValue.shadowColor],
        shadowOffset: [initialValue.shadowOffset],
        shadowBlur: [initialValue.shadowBlur, [Validators.min(0), Validators.max(100)]],
        shadowOpacity: [initialValue.shadowOpacity, [Validators.min(0), Validators.max(100)]],
        shadowAngle: [initialValue.shadowAngle, [Validators.min(0), Validators.max(360)]],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  protected handleShadowForm(elementCmp: PebEditorElement): Observable<any> {
    const shadow = elementCmp.shadow;

    return merge(
      shadow.form.valueChanges.pipe(
        tap((value) => {
          if (shadow.form.invalid) {
            this.logger.log('Shadow: Change: Invalid');

            return;
          }

          this.logger.log('Shadow: Change: Valid ', value);
          elementCmp.styles = { ...elementCmp.styles, shadow: this.shadowToString(value) };
        }),
      ),
      shadow.submit.pipe(
        switchMap(() => this.screen$),
        switchMap((screen) => {
          if (shadow.form.invalid) {
            return EMPTY;
          }

          this.logger.log('Shadow: Submit ', shadow.form.value);

          return this.editorStore.updateStyles(screen, {
            [elementCmp.definition.id]: {
              shadow: this.shadowToString(shadow.form.value),
            },
          });
        }),
      ),
    );
  }

  /** Background */
  protected initBackgroundForm(elementCmp: PebEditorElement) {
    const bgGradient: BgGradient = getGradientProperties(elementCmp.styles);

    const initialValue = {
      imageSize: getSelectedOption(
        this.ImageSizes,
        elementCmp.styles.backgroundRepeat === 'repeat' ? ImageSize.Initial : elementCmp.styles.backgroundSize,
        PageSidebarDefaultOptions.ImageSize,
      ),
      bgColor: elementCmp.styles.backgroundColor?.toString() || '',
      bgColorGradientAngle: bgGradient?.angle || null,
      bgColorGradientStart: bgGradient?.startColor || null,
      bgColorGradientStartPercent: bgGradient?.start || 0,
      bgColorGradientStop: bgGradient?.endColor || null,
      bgColorGradientStopPercent: bgGradient?.end || 100,
      file: null,
      bgImage: elementCmp.styles.backgroundImage?.toString() || '',
      bgImageMeta: {
        mimeType: elementCmp.styles.backgroundImageMimeType,
        width: elementCmp.styles.backgroundImageWidth,
        height: elementCmp.styles.backgroundImageHeight,
      },
      fillType: initFillType(elementCmp.styles),
      imageScale: isBackgroundGradient(elementCmp.styles.backgroundImage) ? 100 : getBgScale(elementCmp.styles),
      mediaType: elementCmp.styles.mediaType ?? MediaType.None,
      imageBgForm: {
        bgColor: elementCmp.styles.imageBackgroundColor?.toString() ||
          elementCmp.styles.color?.toString() || PEB_DEFAULT_FONT_COLOR,
      },
    };

    elementCmp.background = {
      initialValue,
      form: this.formBuilder.group({
        bgColor: [initialValue.bgColor],
        bgColorGradientAngle: [initialValue.bgColorGradientAngle],
        bgColorGradientStart: [initialValue.bgColorGradientStart],
        bgColorGradientStartPercent: [initialValue.bgColorGradientStartPercent],
        bgColorGradientStop: [initialValue.bgColorGradientStop],
        bgColorGradientStopPercent: [initialValue.bgColorGradientStopPercent],
        file: [initialValue.file],
        bgImage: [initialValue.bgImage],
        bgImageMeta: [initialValue.bgImageMeta],
        fillType: [initialValue.fillType],
        imageSize: [initialValue.imageSize],
        imageScale: [initialValue.imageScale],
        mediaType: [initialValue.mediaType],
        imageBgForm: this.formBuilder.group({
          bgColor: [initialValue.imageBgForm.bgColor],
        }),
      }),
      update: null,
      submit: new Subject<any>(),
    };

    this.updateImageScaleFieldSetting(elementCmp.background.form);
  }

  protected handleBackgroundForm(elementCmp: PebEditorElement, sidebarRef: ComponentRef<any>): Observable<any> {
    const sectionBackground = elementCmp.background;
    const elm = this.tree.find(elementCmp.definition.id);

    const updateImageScale = (widthContainer, widthImage = null) => {
      widthImage = widthImage ?? elementCmp.styles.backgroundImageWidth;
      const scale = Math.round((widthImage / widthContainer) * 100);
      const scaleMax = scale > 200 ? 200 : scale
      sectionBackground.form.get('imageScale').setValue(scaleMax);

      return scaleMax;
    }


    return merge(
      sectionBackground.form.get('bgColor').valueChanges.pipe(
        withLatestFrom(this.selectedElements$),
        tap(([value, elements]) => {
          const selectedElements = elements
            .map(element => this.tree.find(element.id));

          if (selectedElements.length) {
            selectedElements.forEach((element: any, i) => {
              element.styles = {
                ...element.styles,
                backgroundColor: value,
                backgroundImage: '',
              };

              element.detectChanges();
            });
          } else {
            elementCmp.styles = {
              ...elementCmp.styles,
              backgroundColor: value,
              backgroundImage: '',
            };

            elementCmp.detectChanges();
          }

          if (value) {
            if (sectionBackground.form.get('fillType').value.name !== FillType.ColorFill) {
              const fillType = getFillType(FillType.ColorFill);
              sectionBackground.form.patchValue({ fillType, backgroundImage: null }, { emitEvent: false });
            }
          }
        }),
      ),

      sectionBackground.form.get('imageBgForm.bgColor').valueChanges.pipe(
        withLatestFrom(this.selectedElements$),
        tap(([value, elements]) => {
          const selectedElements = elements
            .filter(e => e.parent?.type === PebElementType.Grid)
            .map(element => this.renderer.getElementComponent(element.id));

          if (selectedElements.length) {
            selectedElements.forEach((element: any, i) => {
              element.styles = {
                ...element.styles,
                imageBackgroundColor: value,
              };

              element.detectChanges();
            });
          } else {
            elementCmp.styles = {
              ...elementCmp.styles,
              imageBackgroundColor: value,
            };

            elementCmp.detectChanges();
          }
        }),
      ),

      sectionBackground.form.get('bgColorGradientAngle').valueChanges.pipe(
        tap((value: number) => {
          if (value || value === 0) {
            const gradient = this.getBackgroundGradient(value, null, null, null, null, sectionBackground.form);
            this.updateGradientBackground(gradient, sectionBackground.form);
          }
        }),
      ),

      sectionBackground.form.get('bgColorGradientStart').valueChanges.pipe(
        tap((value: string) => {
          if (value ?? value) {
            const gradient = this.getBackgroundGradient(null, value, null, null, null, sectionBackground.form);
            this.updateGradientBackground(gradient, sectionBackground.form);
          }
        }),
      ),

      sectionBackground.form.get('bgColorGradientStartPercent').valueChanges.pipe(
        tap((value: number) => {
          if (value ?? value) {
            const gradient = this.getBackgroundGradient(null, null, value, null, null, sectionBackground.form);
            this.updateGradientBackground(gradient, sectionBackground.form);
          }
        }),
      ),

      sectionBackground.form.get('bgColorGradientStop').valueChanges.pipe(
        tap((value: string) => {
          if (value ?? value) {
            const gradient = this.getBackgroundGradient(null, null, null, value, null, sectionBackground.form);
            this.updateGradientBackground(gradient, sectionBackground.form);
          }
        }),
      ),

      sectionBackground.form.get('bgColorGradientStopPercent').valueChanges.pipe(
        tap((value: number) => {
          if (value ?? value) {
            const gradient = this.getBackgroundGradient(null, null, null, null, value, sectionBackground.form);
            this.updateGradientBackground(gradient, sectionBackground.form);
          }
        }),
      ),

      sectionBackground.form.get('bgImage').valueChanges.pipe(
        withLatestFrom(this.selectedElements$),
        map(([value, elements]) => [value, elements.map(el => this.renderer.getElementComponent(el.id))]),
        tap(([value, selectedElements]) => {
          if (!isBackgroundGradient(value)) {
            const bgImageMeta = sectionBackground.form.get('bgImageMeta').value;
            if (selectedElements.length) {
              selectedElements.forEach((element) => {
                element.styles.mediaType = MediaType.Image;
                element.styles.backgroundColor = value ? '' : element.styles.backgroundColor;
                element.styles.backgroundImage = value;
                element.styles.backgroundImageMimeType = bgImageMeta.mimeType;
                element.styles.backgroundImageWidth = bgImageMeta.width;
                element.styles.backgroundImageHeight = bgImageMeta.height;
                element.detectChanges();
              });
            } else {
              elementCmp.styles.mediaType = MediaType.Image;
              elementCmp.styles.backgroundColor = value ? '' : elementCmp.styles.backgroundColor;
              elementCmp.styles.backgroundImage = value;
              elementCmp.styles.backgroundImageMimeType = bgImageMeta.mimeType;
              elementCmp.styles.backgroundImageWidth = bgImageMeta.width;
              elementCmp.styles.backgroundImageHeight = bgImageMeta.height;
              elementCmp.detectChanges();
            }

            this.updateImageScaleFieldSetting(sectionBackground.form);
            sidebarRef.changeDetectorRef.detectChanges();
          } else {
            selectedElements.forEach(el => {
              this.tree.find(el.definition.id).styles.backgroundImage = value;
            })
          }
        }),
        debounceTime(300),
        withLatestFrom(this.screen$),
        switchMap(([[value, selectedElements], screen]) => {
          let bgImageMetaStyles: PebElementStyles = {};
          if (!isBackgroundGradient(value)) {
            sectionBackground.form.get('imageSize').updateValueAndValidity({ emitEvent: false });
            if (value) {
              const bgImageMeta = sectionBackground.form.get('bgImageMeta').value;
              bgImageMetaStyles = {
                backgroundImageMimeType: bgImageMeta.mimeType,
                backgroundImageWidth: bgImageMeta.width,
                backgroundImageHeight: bgImageMeta.height,
              };
            }
          }
          const newStyles: PebElementStyles = {
            backgroundImage: value,
            backgroundColor: '',
            ...bgImageMetaStyles,
          };
          if (value) {
            newStyles.mediaType = MediaType.Image;
          }

          if (selectedElements.length) {
            const definitionArr = [];
            const stylesArr = [];
            selectedElements.map((element: any) => {
              definitionArr.push({
                ...element.definition,
                data: {
                  ...element.definition.data,
                },
              });
              stylesArr.push({ [element.definition.id]: newStyles });
            });

            return this.editorStore.updateElementKit(screen, definitionArr, stylesArr).pipe(
              tap(() => {
                selectedElements.forEach((element: any) => {
                  showImageSpinner(false, element);
                });
              }),
            );
          }
          const newDefinition = {
            ...elementCmp.definition,
            data: {
              ...elementCmp.definition.data,
            },
          };

          return this.editorStore.updateElementKit(screen, newDefinition, {
            [elementCmp.definition.id]: newStyles,
          }).pipe(
            tap(() => showImageSpinner(false, elementCmp)),
          );
        }),
      ),

      sectionBackground.form.get('file').valueChanges.pipe(
        tap((file: File) => {
          const blobName = pebGenerateId(PebShopContainer.Builder);
          const env = this.injector.get(PE_ENV);
          const container = `${this.entityName}-images`;
          const url = `${env?.custom?.cdn}/${container}/${blobName}`;
          const messageChannel$ = new Observable((obs) => {
            const messageChannel = new MessageChannel();
            toBase64(file).then((data) => {
              messageChannel.port1.onmessage = (event) => {
                if (event.data.error) {
                  obs.error(event.data.error);
                } else {
                  obs.next(event.data);
                }
                obs.complete();
              };
              /** Store blob in service worker cache until we got uploaded image */
              navigator.serviceWorker?.controller?.postMessage(
                { url, data, action: 'UPLOAD' },
                [messageChannel.port2]);
            });
          });

          const imgDimensions$ = new Observable<{ width: number, height: number }>((obs) => {
            const img = new Image();
            img.onload = () => {
              obs.next({ width: img.width, height: img.height });
              obs.complete();
            };
            img.src = URL.createObjectURL(file);
          });

          forkJoin([
            messageChannel$.pipe(
              catchError(() => of(true)),
            ),
            imgDimensions$.pipe(
              switchMap(dimensions => this.mediaService.uploadImage(file, `cdn/${container}`, blobName).pipe(
                withLatestFrom(this.screen$),
                tap(([_,screen]) => {
                  sectionBackground.form.patchValue({
                    bgImage: this.domSanitizer.bypassSecurityTrustResourceUrl(url),
                    bgImageMeta: { mimeType: file.type, ...dimensions },
                  });

                  const widthContainer = pebScreenDocumentWidthList[screen];
                  const widthImage = dimensions.width;
                  const scale = updateImageScale(widthContainer, widthImage);

                  elementCmp.target.styles = {
                    ...elementCmp.target.styles,
                    backgroundImageMimeType: file.type,
                    backgroundImageWidth: dimensions.width,
                    backgroundImageHeight: dimensions.height,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundImage: url,
                    backgroundSize: `${scale}%`,
                  };

                  this.snackbarService.toggle(true, {
                    content: 'Image is uploaded successfully',
                    duration: 2000,
                    iconId: 'icon-commerceos-success',
                  })
                }),
                catchError((err) => {
                  this.snackbarService.toggle(true, {
                    content: err.error?.message ?? 'Cannot load image',
                    duration: 2000,
                    iconId: 'icon-commerceos-error',
                  });

                  return of(true);
                }),
              )),
            ),
          ]).toPromise();
        }),
      ),

      sectionBackground.form.get('imageSize').valueChanges.pipe(
        switchMap((option: SelectOption) => {
          const backgroundSize$ = of(option.value);

          return backgroundSize$.pipe(
            withLatestFrom(this.selectedElements$, this.screen$),
            tap(([backgroundSize, selectedElements, screen]) => {
              if (!isBackgroundGradient(sectionBackground.form.value.backgroundImage)) {
                const data: any = {};
                data.backgroundPosition = 'center';
                data.backgroundRepeat = 'no-repeat';

                if (option.value === ImageSize.Initial) {
                  data.backgroundPosition = null;
                  data.backgroundRepeat = 'repeat';
                }

                if (option.value === ImageSize.OriginalSize) {
                  const widthContainer = pebScreenDocumentWidthList[screen];
                  const scale = updateImageScale(widthContainer);

                  data.backgroundSize = `${scale}%`;
                  data.backgroundRepeat = 'no-repeat';
                }

                const elements = selectedElements
                  .filter(e => e.parent?.type === PebElementType.Grid)
                  .map(element => this.renderer.getElementComponent(element.id));

                if (option.value !== ImageSize.OriginalSize)  {
                  sectionBackground.form.get('imageScale').patchValue(100);
                  if (option.value !== ImageSize.Initial) {
                    if (elements.length) {
                      elements.forEach((element) => {
                        this.updateStyles(element, { backgroundSize });
                      });
                    } else {
                      this.updateStyles(elementCmp, { backgroundSize });
                    }
                  }
                }

                if (elements.length) {
                  elements.forEach((element) => {
                    element.styles = { ...element.styles, ...data };
                  });
                } else {
                  elementCmp.styles = { ...elementCmp.styles, ...data };
                }

                this.updateImageScaleFieldSetting(sectionBackground.form);
                sectionBackground.submit.next();
              }
            }),
          );
        }),
      ),

      sectionBackground.form.get('fillType').valueChanges.pipe(
        tap((option: SelectOption) => {
          const data: any = {};

          switch (option.name) {
            case FillType.ColorFill:
              data.backgroundColor = elementCmp.styles.backgroundColor || PageSidebarDefaultOptions.BgColor;
              data.backgroundImage = null;
              data.backgroundSize = null;
              data.mediaType = MediaType.None;
              break;
            case FillType.ImageFill:
              const control = sectionBackground.form.get('bgImage');
              data.backgroundColor = null;
              data.backgroundImage = isBackgroundGradient(control.value, sectionBackground.form)
                ? control.setValue('', { emitEvent: false })
                : control.value;
              data.mediaType = MediaType.Image;
              break;
            case FillType.GradientFill:
              data.backgroundColor = null;
              data.backgroundSize = null;
              data.backgroundImage = this.getBackgroundGradient(null, null, null, null, null, sectionBackground.form);
              data.mediaType = MediaType.None;
              break;
            case FillType.None:
            case FillType.Video:
              data.backgroundColor = null;
              data.backgroundImage = null;
              data.mediaType = MediaType.Video;
              break;
          }

          // Drop data for gradient in form
          if (option.name !== FillType.GradientFill) {
            sectionBackground.form.get('bgColorGradientAngle').patchValue('', { emitEvent: false });
            sectionBackground.form.get('bgColorGradientStart').patchValue('', { emitEvent: false });
            sectionBackground.form.get('bgColorGradientStartPercent').patchValue('', { emitEvent: false });
            sectionBackground.form.get('bgColorGradientStop').patchValue('', { emitEvent: false });
            sectionBackground.form.get('bgColorGradientStopPercent').patchValue('', { emitEvent: false });
          }

          sectionBackground.form.get('bgColor').patchValue(data.backgroundColor, { emitEvent: false });
          sectionBackground.form.get('bgImage').patchValue(data.backgroundImage, { emitEvent: false });
          sectionBackground.form.get('mediaType').patchValue(data.mediaType, { emitEvent: false });

          this.updateImageScaleFieldSetting(sectionBackground.form);
        }),
      ),

      sectionBackground.form.get('imageScale').valueChanges.pipe(
        map(value => `${value}%`),
        filter((value: string) => (
          elementCmp.styles.backgroundSize !== value
          && (
            sectionBackground.form.get('imageSize').value.value === ImageSize.Initial
            || sectionBackground.form.get('imageSize').value.value === ImageSize.OriginalSize
          )
        )),
        withLatestFrom(this.selectedElements$),
        tap(([value, selectedElements]) => {
          const elements = selectedElements.map((cell: any) => this.renderer.getElementComponent(cell.id));
          if (elements.length) {
            elements.forEach((element) => {
              this.updateStyles(element, { backgroundSize: value });
            });
          } else {
            this.updateStyles(elementCmp, { backgroundSize: value });
          }
        }),
        debounceTime(300),
        tap(() => sectionBackground.submit.next()),
      ),

      sectionBackground.form.get('mediaType').valueChanges.pipe(
        filter(value => value !== MediaType.Studio),
        tap((value) => {
          elementCmp.styles = {
            ...elementCmp.styles,
            mediaType: value,
          };
          elm.data = { ...elm.data, mediaType: value };
          sectionBackground.submit.next();
        }),
      ),

      sectionBackground.submit.pipe(
        switchMap(() => this.screen$),
        withLatestFrom(this.selectedElements$),
        switchMap(([screen, selectedElements]) => {
          if (
            sectionBackground.form.invalid ||
            (
              isEqual(sectionBackground.initialValue, sectionBackground.form.value) &&
              elementCmp.styles.mediaType !== MediaType.None
            )
          ) {
            return EMPTY;
          }

          this.logger.log('Background: Submit ', sectionBackground.form.value);

          if (selectedElements.length) {
            const definitionsArr = [];
            const stylesArr = [];
            const elements: PebEditorElement[] = [];
            let cellScreen: PebScreen | PebScreen[] = screen;
            selectedElements.map((cell: any) => {
              const element = this.renderer.getElementComponent(cell.id);
              const functionLink = element.definition.data?.functionLink;

              elements.push(element);
              cellScreen = element.target.element.data?.sync ? Object.values(PebScreen) : screen;
              definitionsArr.push(element.definition);
              stylesArr.push({
                [element.definition.id]: {
                  ...element.styles,
                  ...(
                    isIntegrationData(functionLink) && isImageContext(functionLink)
                      ? { backgroundImage: null, mediaType: MediaType.None }
                      : {}
                  ),
                },
              });
            });

            this.editorStore.updateElementKit(cellScreen, definitionsArr, stylesArr)

            return of(true);
          }

          const screens = elementCmp.target.element.data?.sync ? Object.values(PebScreen) : screen;
          const definition = elementCmp.definition;
          const styles = {
            [definition.id]: difference(
              { ...elementCmp.styles },
              { ...this.editorStore.page.stylesheets[screen][definition.id] },
            ),
          };

          if (Object.keys(styles[definition.id]).length) {
            return this.editorStore.updateElementKit(screens, definition, styles);
          }

          return of(true);

          function difference(object, baseObject) {
            function changes(obj, base) {
              return transform(obj, (result, value, key) => {
                if (!isEqual(value, base[key])) {
                  result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
                }
              });
            }

            return changes(object, baseObject);
          }
        }),
      ),
    );
  }


  protected updateVideoFieldSetting(form: FormGroup) {
    return form.get('videoObjectFit').valueChanges.pipe(
      startWith(form.get('videoObjectFit').value),
      tap((value) => {
        const { value: videoSize } = value ?? {};
        if (videoSize === VideoSize.Cover || videoSize === VideoSize.Contain || videoSize === VideoSize.Stretch) {
          form.get('videoScale').patchValue(100, { emitEvent: false });
          form.get('videoScale').disable({ emitEvent: false });
        } else {
          form.get('videoScale').enable({ emitEvent: false });
        }
      }),
    );
  }

  private getNextAlignmentPosition(
    screen: PebScreen,
    parent: PebAbstractElement,
    element: PebAbstractElement,
    align: AlignType
  ) {
    const parentBBox = this.tree.toBBox(parent);
    const parentRect = {
      width: parent.element.type === PebElementType.Section
        ? pebScreenContentWidthList[screen]
        : parentBBox.maxX - parentBBox.minX,
      height: parentBBox.maxY - parentBBox.minY,
    };

    const elementBBox = this.tree.toBBox(element);
    const elementRect = {
      width: elementBBox.maxX - elementBBox.minX,
      height: elementBBox.maxY - elementBBox.minY,
    };
    const nextPosition: { left?: number, top?: number } = {};

    if (align === AlignType.Left) {
      nextPosition.left = 0;
    }

    if (align === AlignType.Center) {
      nextPosition.left = Math.round((parentRect.width - elementRect.width) / 2);
    }

    if (align === AlignType.Right) {
      nextPosition.left = Math.round(parentRect.width - elementRect.width);
    }

    if (align === AlignType.Top) {
      nextPosition.top = 0;
    }

    if (align === AlignType.Middle) {
      nextPosition.top = Math.round((parentRect.height - elementRect.height) / 2);
    }

    if (align === AlignType.Bottom) {
      nextPosition.top = Math.round(parentRect.height - elementRect.height);
    }

    return nextPosition;
  }

  public shadowToString(value: PebShadow): string | null {
    if (!value.hasShadow) {
      return null;
    }
    const { shadowBlur, shadowColor, shadowOffset, shadowAngle, shadowOpacity } = value;
    const color = stringToRgba(shadowColor);

    const offsetX = shadowOffset * Math.cos((shadowAngle * Math.PI) / 180);
    const offsetY = shadowOffset * -Math.sin((shadowAngle * Math.PI) / 180);

    return `drop-shadow(${offsetX}pt ${offsetY}pt ${shadowBlur}px rgba(${color.r},${color.g},${color.b},${shadowOpacity / 100}))`;
  }

  private parseShadowString(value: string): ShadowValues {
    if (!value) {
      return {} as ShadowValues;
    }
    const nextShadowString = value.replace('drop-shadow(', '').replace('))', '');
    const shadowValuesArray = nextShadowString.split(' ');
    const shadowValuesColors = shadowValuesArray[3].replace('rgba(', '').split(',');
    const offsetX = +shadowValuesArray[0].replace('pt', '');
    const offsetY = +shadowValuesArray[1].replace('pt', '');
    const angle = Math.round(Math.atan2(-offsetY, offsetX) * (180 / Math.PI));

    return {
      blur: +shadowValuesArray[2].replace(/pt|px/, ''),
      offset: Math.round(Math.sqrt(offsetX * offsetX + offsetY * offsetY)),
      color: rgbToHex(+shadowValuesColors[0], +shadowValuesColors[1], +shadowValuesColors[2]),
      opacity: Math.round(+shadowValuesColors[3] * 100),
      angle: angle >= 0 ? angle : angle + 360,
    };
  }

  private getBackgroundGradient(
    deg?: number,
    start?: string,
    startPercent?: number,
    end?: string,
    endPercent?: number,
    form?: FormGroup,
  ): string {
    let degrees = '90deg';
    if (deg || form.get('bgColorGradientAngle').value) {
      degrees = deg ? `${deg}deg` : `${form.get('bgColorGradientAngle').value}deg`;
    }
    const startGradient = start || form.get('bgColorGradientStart').value || '#ffffff';
    const endGradient = end || form.get('bgColorGradientStop').value || '#ffffff';

    const percentStart = startPercent || form.get('bgColorGradientStartPercent').value || 0;
    const percentEnd = endPercent || form.get('bgColorGradientStopPercent').value || 100;

    return `linear-gradient(${degrees}, ${startGradient} ${percentStart}%, ${endGradient} ${percentEnd}%)`;
  }

  private updateGradientBackground(gradient: string, form: FormGroup): void {
    form.get('bgColor').patchValue('', { emitEvent: false });
    form.get('bgImage').patchValue(gradient);

    if (isBackgroundGradient(gradient)) {
      form.get('mediaType').patchValue(MediaType.None, { emitEvent: false });
    }
  }

  private updateImageScaleFieldSetting(form: FormGroup) {
    const imageSize: ImageSize = form.get('imageSize').value.value;
    if (
      form.get('mediaType').value === MediaType.Image &&
      (imageSize === ImageSize.Initial ||
        imageSize === ImageSize.OriginalSize) &&
      !!form.get('bgImage').value
    ) {
      form.get('imageScale').enable({ emitEvent: false });
    } else {
      form.get('imageScale').disable({ emitEvent: false });
    }
  }

  public updateStyles(element, styles) {
    if (styles.backgroundColor || styles.backgroundColor === '') {
      element.styles.backgroundColor = styles.backgroundColor;
    }
    if (styles.backgroundImage || styles.backgroundImage === '') {
      element.styles.backgroundImage = styles.backgroundImage;
    }

    if (styles.height) {
      element.styles.height = styles.height;
    }

    element.styles = { ...element.styles, ...styles };
    // element.applyStyles();

    return styles;
  }
}

