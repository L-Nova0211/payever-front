import { ComponentRef, Injectable, Injector, NgZone } from '@angular/core';
import { cloneDeep, isEmpty, isEqual, isObject, merge as lodashMerge, transform } from 'lodash';
import { EMPTY, from, merge, Observable, of, Subject, throwError } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  map,
  pairwise,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  MediaType,
  pebCreateLogger,
  PebEditorState,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebShopContainer,
} from '@pe/builder-core';
import { PebShapeMakerElement } from '@pe/builder-elements';
import { PebEditorElement, PebEditorElementPropertyVideo } from '@pe/builder-main-renderer';
import { AfterGlobalInit, asyncGetVideoDimensions, SelectedMedia, VideoSize } from '@pe/builder-old';
import { PebEditorStore, SnackbarErrorService } from '@pe/builder-services';
import { AbstractEditElementPlugin } from '@pe/builder-shared';

import { PebEditorShapeSidebarComponent } from './shape.sidebar';

const log = pebCreateLogger('editor:plugins:edit-block');


interface Changes {
  [prop: string]: any;
}

@Injectable()
export class PebEditorShapePlugin
  extends AbstractEditElementPlugin<PebEditorShapeSidebarComponent>
  implements AfterGlobalInit {

  sidebarComponent = PebEditorShapeSidebarComponent;

  logger = { log };

  // TODO: move to behaviour state
  changes: Changes = null;
  element: any = null;

  behaviourState: {
    initialElement: { element: PebElementDef; styles: PebElementStyles };
    activeElement: PebEditorElement;
    sidebar: ComponentRef<any>;
  } = {
    initialElement: null,
    activeElement: null,
    sidebar: null,
  };

  constructor(
    protected editorStore: PebEditorStore,
    protected snackbarErrorService: SnackbarErrorService,
    injector: Injector,
    protected state: PebEditorState,
    private readonly ngZone: NgZone,
  ) {
    super(injector);
  }

  afterGlobalInit(): Observable<any> {
    return this.screen$.pipe(
      tap((screen) => {
        this.screen = screen;
      }),
      switchMap(() => this.ngZone.onStable.pipe(
        take(1),
        switchMap(() => merge(
          this.handleMultipleSelected(),
          this.handleSingleSelected(),
        )),
      )),
    );
  }

  initElementForms(elCmp: PebEditorElement, isCell = false): PebEditorElement {
    this.initBackgroundForm(elCmp);
    this.initVideoForm(elCmp);
    if (!isCell) {
      this.initShadowForm(elCmp);
    }
    this.behaviourState.activeElement = elCmp;

    this.behaviourState.initialElement = {
      element: cloneDeep(this.behaviourState.activeElement.definition),
      styles: lodashMerge({}, this.behaviourState.activeElement.styles),
    };

    return super.initElementForms(elCmp) as PebEditorElement;
  }

  handleForms(elCmp: PebEditorElement, sidebarRef: ComponentRef<any>, isCell = false): Observable<any> {
    const obs = [
      this.handleBackgroundForm(elCmp, sidebarRef),
      this.handleBackgroundFillType(elCmp, sidebarRef),
      this.handleVideoForm(elCmp, sidebarRef),
    ];

    if (!isCell) {
      obs.push(this.handleShadowForm(elCmp));
    }

    return merge(...obs);
  }

  finalizeForms(elCmp: PebEditorElement, sidebarRef: ComponentRef<any>): () => void {
    return () => {
      const diffStyles = this.difference(elCmp.styles, elCmp.target.styles);
      if (elCmp.definition.type === PebElementType.Shape && !isEmpty(diffStyles)) {
        this.editorStore.updateElementKit(
          this.screen,
          elCmp.definition,
          { [elCmp.definition.id]: elCmp.target.styles });
      }

      sidebarRef.destroy();
    };
  }

  protected handleSingleSelected(): Observable<any> {
    return this.selectedElements$.pipe(
      filter(elements => elements.length === 1 && elements[0].type === PebElementType.Shape),
      map(([element]) => this.renderer.getElementComponent(element.id)),
      switchMap((elCmp) => {
        const isCell = elCmp.parent.definition.type === PebElementType.Grid;

        this.initElementForms(elCmp, isCell);

        const sidebarRef = this.initSidebar(elCmp);
        const obs = [ this.handleForms(elCmp, sidebarRef, isCell) ];

        if (!isCell) {
          this.initAlignmentForm(sidebarRef);
          obs.push(this.handleAlignmentForm(elCmp, sidebarRef));
        }

        return merge(...obs).pipe(
          catchError((err) => {
            console.error(err);

            return EMPTY;
          }),
          takeUntil(this.selectedElements$.pipe(skip(1))),
          finalize(this.finalizeForms(elCmp, sidebarRef)),
        );
      }),
    );
  }

  protected handleMultipleSelected(): Observable<any> {
    return this.selectedElements$.pipe(
      map(elements => elements.map(element => element.id)),
      tap((selectedElementsIds: string[]) => {
        if (selectedElementsIds.length > 1) {
          const elements = selectedElementsIds.map((elementId: string) =>
            this.renderer.getElementComponent(elementId),
          );

          if (elements.every((element: PebEditorElement) => element.definition.type === PebElementType.Shape)) {
            const element = elements[0] as PebEditorElement;

            this.initElementForms(element);
            const sidebarRef = this.initSidebar(element);
            let selectedChanges = false;
            merge(
              this.handleForms(element, sidebarRef)).pipe(
                filter(changes => !!changes),
                tap((changes) => {
                  let newChange: { [key: string]: string } = {};
                  if (typeof changes === 'object') {
                    newChange = changes;
                    if (changes.hasOwnProperty('hasShadow')) {
                      newChange = { shadow: this.shadowToString(changes) };
                    }
                  } else {
                    const key = Object.keys(element.styles).find(k => element.styles[k] === changes) as string;
                    if (key) {
                      newChange = { [key]: changes };
                    } else {
                      if (changes.toString().startsWith('#') || changes.toString().startsWith('rgb')) {
                        newChange = { backgroundColor: changes };
                      }
                    }
                  }

                  elements.forEach((el: PebEditorElement) => {

                    Object.keys(newChange).forEach((key) => {
                      if (newChange[key] !== el.target.styles[key]) {
                        selectedChanges = true;
                      }
                    });

                    el.target.styles = {
                      ...el.target.styles,
                      ...newChange,
                    };
                    el.target.cdr.detectChanges();
                  });
                }),
                takeUntil(this.selectedElements$.pipe(skip(1))),
              ).subscribe();
          }
        }
      }),
    );
  }

  protected handleVideoForm(elementCmp: PebEditorElement, sidebarRef: ComponentRef<any>): Observable<any> {
    const elm = this.tree.find(elementCmp.definition.id);
    const video = elementCmp.video;
    const videoElement = elementCmp.target as any;

    let isSetScale = false;

    const createElementDef = (
      element: PebEditorElement,
      changes: any,
      videoDimensions: { videoWith: number, videoHeight: number },
    ): PebElementDef => {

      return {
        ...element.definition,
        data: {
          ...{
            ...element.definition.data,
            videoObjectFitPosition: changes.videoObjectFit?.name === 'Tile' ? 'top left' : 'center center',
            videoScale: [VideoSize.Cover, VideoSize.Contain].includes(changes.videoObjectFit?.value) ?
              100 :
              changes.videoScale,
          },
          ...changes,
          ...(!isSetScale ? videoDimensions : {}),
        },
      };
    };

    const handleVideoFormChanges = (changes) => {
      const videoDimensions$ = changes.videoObjectFit?.name === 'Original Size' ?
        from(asyncGetVideoDimensions((elementCmp.target as unknown as PebShapeMakerElement).video?.nativeElement)) :
        of({ videoWidth: '100%', videoHeight: '100%' });

      return videoDimensions$.pipe(
        withLatestFrom(this.selectedElements$),
        tap(([videoDimensions, selectedElements]) => {
          if (changes?.source) {
            elementCmp.background.form.get('fillType').patchValue(
              { name: 'Video' },
              {
                emitEvent: false,
              },
            );
            elementCmp.background.form.get('bgColor').patchValue('', { emitEvent: false });
            // elementCmp.background.form.get('bgImage').patchValue('', { emitEvent: false });
            changes.mediaType = MediaType.Video;
          }

          this.updateVideoFieldSetting(elementCmp.video.form);
          if (
            changes.videoObjectFit?.value === VideoSize.Cover ||
            changes.videoObjectFit?.value === VideoSize.Contain ||
            changes.videoObjectFit?.value === VideoSize.Stretch
          ) {
            changes.videoScale = 100;
            video.form.get('videoScale').patchValue(100, { emitEvent: false });
          }

          if (selectedElements?.length) {
            const elementDefArr: PebElementDef[] = [];
            selectedElements.map((element: any) => {
              this.tree.find(element.id).data = { ...changes, ...videoDimensions };

              elementDefArr.push(
                createElementDef(this.renderer.getElementComponent(element.id), changes, videoDimensions)
              );
            });

            return this.editorStore.updateElement(elementDefArr).pipe(
              tap(() => {
                selectedElements.forEach((element) => {
                  this.renderer.getElementComponent(element.id).detectChanges();
                });
              }),
            );
          }
          isSetScale = false;

          this.tree.find(elementCmp.definition.id).data = { ...changes, ...videoDimensions };

          return this.editorStore.updateElement(createElementDef(elementCmp, changes, videoDimensions)).pipe(
            tap(() => {
              elementCmp.detectChanges();
            }),
          );
        }),
      );
    };

    return merge(
      video.form.get('videoScale').valueChanges.pipe(
        tap(() => {
          const videoSize: VideoSize = video.form.get('videoObjectFit').value?.value;
          isSetScale = true;
          if (
            !isSetScale &&
            (
              videoSize === VideoSize.Cover ||
              videoSize === VideoSize.Contain ||
              videoSize === VideoSize.Stretch
            )
          ) {
            elementCmp.video.form.get('videoScale').patchValue(100, { emitEvent: false });
          }
        }),
      ),
      video.form.valueChanges.pipe(
        startWith(null),
        pairwise(),
        switchMap(([prev, curr]) => {
          if (elm.video && prev?.autoplay !== curr.autoplay) {
            curr.autoplay
              ? elm.video.nativeElement.play()
              : elm.video.nativeElement.pause();

            elm.video.nativeElement.currentTime = 0;
          }

          return handleVideoFormChanges(curr);
        }),
      ),
      video.submit.pipe(
        switchMap((changes: Event) => {
          const result$ = new Subject();
          this.uploadVideo(changes, sidebarRef).pipe(
            tap((result) => {
              const payload: SelectedMedia = {
                thumbnail: result.thumbnail,
                source: result.blobName,
              };
              this.snackbarService.toggle(true, {
                content: 'Video is uploaded successfully',
                duration: 2000,
                iconId: 'icon-commerceos-success',
              });

              this.patchForm(payload, video);
            }),
            catchError((err) => {
              this.snackbarService.toggle(true, {
                content: err?.error?.message ?? 'Upload is not possible due to server error',
                duration: 2000,
                iconId: 'icon-commerceos-error',
              });

              return of(true);
            }),
            tap(result$),
            filter(() => sidebarRef.hostView.destroyed),
            switchMap(() => handleVideoFormChanges(video.form.value)),
            takeUntil(video.submit),
          ).subscribe();

          return result$.pipe(tap(r => video.result$.next(r)));
        }),
      ),
      sidebarRef.instance?.editorVideoForm.isLoading$.pipe(
        tap((isLoading: boolean) => {
          videoElement.isVideoLoading = isLoading;
          videoElement.cdr.detectChanges();
        }),
      ),
    );
  }

  private handleBackgroundFillType(
    elementCmp: PebEditorElement,
    sidebar: ComponentRef<PebEditorShapeSidebarComponent>,
  ): Observable<any> {
    const fillType = elementCmp.background?.form.get('fillType');

    return fillType.valueChanges.pipe(
      tap((fill) => {
        if (fill.name?.toLowerCase() !== 'video' && elementCmp.video.form.get('source')) {
          elementCmp.video.form.get('source').patchValue('');
        } else if (fill.name?.toLowerCase() === 'video') {
          sidebar.instance.activeTabIndex$.next(2);
        }
      }),
    );
  }

  protected uploadVideo(
    $event: Event,
    sidebarRef: ComponentRef<any>,
  ): Observable<{ thumbnail: string; blobName: string }> {
    const target = $event.target as HTMLInputElement;
    const files: FileList = target.files;

    sidebarRef.instance.editorVideoForm.previewError = false;
    sidebarRef.instance.editorVideoForm.videoDuration = null;
    sidebarRef.instance.editorVideoForm.cdr.detectChanges();

    return this.mediaService.uploadVideo(files.item(0), PebShopContainer.BuilderVideo).pipe(
      switchMap((response: { thumbnail: string; blobName: string }) => {
        return of(response);
      }),
      catchError((err) => {
        sidebarRef.instance.component.video.form.updateValueAndValidity();
        sidebarRef.instance.editorVideoForm.isLoading$.next(false);
        sidebarRef.instance.editorVideoForm.isLoading$.complete();
        sidebarRef.instance.editorVideoForm.cdr.detectChanges();

        return throwError(err);
      }),
      finalize(() => {
        sidebarRef.instance.editorVideoForm.isLoading$.next(false);
        sidebarRef.instance.editorVideoForm.isLoading$.complete();
        sidebarRef.instance.editorVideoForm.cdr.detectChanges();
      }),
    );
  }

  patchForm(payload: SelectedMedia, video: PebEditorElementPropertyVideo, emitEvent = true) {
    video.form.patchValue(payload, { emitEvent });
  }

  private difference(object, base) {
    function changes(object, base) {
      return transform(object, (result, value, key) => {
        if (!isEqual(value, base[key])) {
          result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
        }
      });
    }

    return changes(object, base);
  }
}
