import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ComponentType } from '@angular/cdk/portal';
import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { uniqBy } from 'lodash';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, Observable, of } from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  finalize,
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebAbstractTextElement } from '@pe/builder-abstract';
import { PebEditorApi } from '@pe/builder-api';
import {
  collectFonts,
  PebEditorCommand,
  PebEditorState,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  PebEnvService,
  pebGenerateId,
  PebLanguage,
  PebPageEffect,
  PebPageType,
  PebPageVariant,
  PebScreen,
  PebShopContainer,
  PebShopThemeVersion,
  PebTheme,
} from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { BackgroundActivityService, PebEditorAccessorService, PebEditorStore, } from '@pe/builder-services';
import { PagePreviewService } from '@pe/builder-shared';
import { PebElementSelectionState } from '@pe/builder-state';
import { APP_TYPE, AppThemeEnum, MessageBus, PeDestroyService } from '@pe/common';

export const PEB_EDITOR_PUBLISH_DIALOG = new InjectionToken<ComponentType<any>>('PEB_EDITOR_PUBLISH_DIALOG');

export interface PebEditorPublishDialogData {
  appId: string;
}

@Component({
  selector: 'peb-publish-dialog',
  templateUrl: './publish-dialog.component.html',
  styleUrls: ['./publish-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebEditorPublishDialogComponent implements OnInit {

  @Select(PebEditorOptionsState.language) language$!: Observable<PebLanguage>;
  @Select(PebElementSelectionState.textElements) selectedElements$!: Observable<PebElementDef[]>;

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  readonly theming = this.pebEnvService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  readonly publishing$ = new BehaviorSubject(false);
  readonly loading$ = new BehaviorSubject(false);
  readonly pictureLoading$ = new BehaviorSubject(false);
  readonly app$ = new BehaviorSubject(null);
  readonly uploadProgress$ = new BehaviorSubject(100);
  readonly isReviewEnabledSubject$ = new BehaviorSubject<boolean>(localStorage.getItem('review_enabled') === 'true');
  readonly isReviewEnabled$ = this.isReviewEnabledSubject$.pipe(
    tap(value => localStorage.setItem('review_enabled', value.toString())),
  );


  language: PebLanguage;

  readonly activeThemeVersion$ = new BehaviorSubject<PebShopThemeVersion>(null);
  get activeThemeVersion() {
    return this.activeThemeVersion$.getValue();
  }

  readonly theme$ = new BehaviorSubject<PebTheme>(null);
  get theme() {
    return this.theme$.getValue();
  }

  readonly isNewTheme$ = this.activeThemeVersion$.pipe(
    map(theme => theme === null),
  );

  readonly isNotNewTheme$ = this.activeThemeVersion$.pipe(
    map(theme => theme !== null),
  );

  readonly reviewable$ = this.activeThemeVersion$.pipe(
    map(theme => theme === null || !!theme?.published),
  );

  get reviewable() {
    return this.activeThemeVersion?.published;
  }

  readonly pictureSrc$ = new BehaviorSubject(null);

  readonly tags$ = new BehaviorSubject<string[]>([]);
  get tags() {
    return this.tags$.getValue();
  }

  set tags(value) {
    this.tags$.next(value);
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  activeTextEditors$ = this.selectedElements$.pipe(
    map(elements => elements.filter(elm => [PebElementType.Text, PebElementType.Shape].includes(elm.type))),
    map(elements => elements.map(elm => this.renderer.getElementComponent(elm.id))),
    switchMap(elements => combineLatest(elements.map(elm => (elm.target as PebAbstractTextElement).editorEnabled$.pipe(
      concatMap(enabled => enabled ? of(elm) : EMPTY),
    )))),
    startWith([]),
    tap((elements) => {
      elements.forEach((elm) => {
        setTimeout(() => (elm.target as PebAbstractTextElement).deactivate());
      });
    }),
  );

  readonly canPublish$ = this.activeTextEditors$.pipe(
    concatMap(() => combineLatest([
      this.editorStore.lastActionId$,
      this.editorStore.lastPublishedActionId$,
      this.backgroundActivityService.hasActiveTasks$,
    ]).pipe(
      map(([lastActionId, lastPublishedActionId, hasActiveTasks]) => {
        return !hasActiveTasks && !lastPublishedActionId || lastActionId !== lastPublishedActionId
      }),
    )));

  readonly hasActiveTask$ = this.backgroundActivityService.hasActiveTasks$;


  readonly $enabled = combineLatest([
    this.reviewable$,
    this.publishing$,
    this.canPublish$,
    this.isNewTheme$,
  ]).pipe(
    map(([reviewable, publishing, canPublish]) => canPublish && !publishing && reviewable),
  );

  readonly disabled$ = this.$enabled.pipe(map(result => !result));

  readonly showDescription$ = combineLatest([
    this.$enabled,
    this.isNotNewTheme$,
    this.isNewTheme$,
  ]).pipe(
    map(([enabled, isNotNewTheme, isNewTheme]) => isNotNewTheme || (enabled && isNewTheme)),
  );

  constructor(
    private dialogRef: MatDialogRef<PebEditorPublishDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: PebEditorPublishDialogData,
    private readonly editorApi: PebEditorApi,
    private readonly pebEnvService: PebEnvService,
    private readonly destroy$: PeDestroyService,
    private readonly editorAccessorService: PebEditorAccessorService,
    private readonly editorStore: PebEditorStore,
    private readonly pagePreviewService: PagePreviewService,
    private readonly editorState: PebEditorState,
    private readonly renderer: PebEditorRenderer,
    private readonly dialog: MatDialog,
    private readonly messageBus: MessageBus,
    @Optional() @Inject(APP_TYPE) private readonly appType: string,
    @Optional() @Inject(PEB_EDITOR_PUBLISH_DIALOG) private readonly publishDialog: ComponentType<any>,
    private backgroundActivityService: BackgroundActivityService,
  ) {
    this.language$.pipe(
      tap((language) => {
        this.language = language;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit() {
    this.editorApi.getApp(this.dialogData.appId).pipe(
      tap(app => this.app$.next(app)),
    ).subscribe();

    this.pictureLoading$.next(true);
    const themeId = this.editorStore.theme.id;
    forkJoin([
      this.editorApi.getShopThemeById(themeId).pipe(
        tap(theme => this.theme$.next(theme)),
      ),
      this.editorApi.getShopThemeActiveVersion(themeId).pipe(
        tap((version) => {
          this.activeThemeVersion$.next(version);
          this.tags = version?.tags ?? [];
        }),
      ),
    ]).pipe(
      map(([theme]) => theme),
      switchMap((theme) => {
        // use theme picture if exist
        if (theme.picture) {
          return of(theme.picture);
        }
        const frontPageId = this.editorStore.snapshot.pages.find(p => p.variant === PebPageVariant.Front)?.id ??
          this.editorStore.activePageId;
        // get front or current page for preview (force generate preview for current page)
        const frontPage$ = this.editorStore.pages[frontPageId] ?
          of({ page: this.editorStore.pages[frontPageId], forceGenerate: true }) :
          this.editorStore.getPage(frontPageId).pipe(
            map(page => ({ page, forceGenerate: false })),
          );
        const screen = PebScreen.Desktop;

        return frontPage$.pipe(
          switchMap(({ page, forceGenerate }) => {
            return of(page.data?.preview?.[screen] ?? null);
          }),
        );
      }),
      catchError((err) => {
        console.error(err);

        return of(null);
      }),
      tap(url => this.pictureSrc$.next(url)),
      finalize(() => this.pictureLoading$.next(false)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onImgLoad(): void {
    this.pictureLoading$.next(false);
  }

  updateThemeName(name: string) {
    this.editorStore.updateThemeName(name).pipe(
      tap(() => this.theme$.next({
        ...this.theme,
        name,
      })),
    ).subscribe();
  }

  onPublish(): void {
    let pages = [];

    const isReviewEnabled = this.isReviewEnabledSubject$.getValue();
    this.publishing$.next(true);
    const publishing$ = this.editorApi.getCurrentShopPreview(this.dialogData.appId, true).pipe(
      switchMap(({ current, published }) => {
        const curr = { pages: current.pages, snapshot: current };
        if (published?.pages) {
          const totalPages = uniqBy([...curr.pages, ...published.pages], 'id');
          const samePages = totalPages.filter((page) => {
            const currentPage = curr.pages.find(p => p.id === page.id);
            const publishedPage = published.pages.find(p => p.id === page.id);

            return currentPage?.updatedAt === publishedPage?.updatedAt;
          });
          pages = totalPages.filter((page) => {
            if (page.type === PebPageType.Replica) {
              return !samePages.includes(page);
            }

            return false;
          });
        } else {
          pages = curr.pages;
        }

        if (!this.reviewable || !isReviewEnabled) {
          return of(true);
        } else {
          const dialogData = {
            published,
            totalPages: pages,
            current: curr,
          };

          const dialogRef = this.dialog.open(this.publishDialog, {
            height: '82.3vh',
            maxHeight: '82.3vh',
            maxWidth: '78.77vw',
            width: '78.77vw',
            panelClass: ['review-publish-dialog', this.theming],
            data: { ...dialogData },
          });
          dialogRef.backdropClick().pipe(
            tap(() => dialogRef.close()),
            takeUntil(dialogRef.componentInstance.destroy$),
          ).subscribe();

          return dialogRef.beforeClosed();
        }
      }),
      catchError((err) => {
        console.error(err);

        return of(false);
      }),
    );

    publishing$.pipe(
      take(1),
      filter(r => !!r),
      switchMap(() => {
        const effects = [];

        const targetPageId = this.editorStore.page.id;
        const affectedPageIds = [];

        const recursive = (page, element) => {
          collectFonts(page, element);

          if (element.children.length) {
            element.children.forEach(child => recursive(page, child));
          }
        };

        pages.forEach((page) => {
          recursive(page, page.template);

          affectedPageIds.push(page._id);
          effects.push({
            type: PebPageEffect.Update,
            target: `${PebEffectTarget.Pages}:${page._id}`,
            payload: {
              data: page.data,
            },
          });
        });

        return this.editorStore.commitAction({
          id: pebGenerateId('action'),
          targetPageId,
          affectedPageIds,
          createdAt: new Date(),
          effects,
        });
      }),
      finalize(() => this.dialogRef.close()),
    ).subscribe(() => this.execCommand({ type: 'publish' }));
  }

  onViewUrl(): void {
    this.messageBus.emit(`${this.appType}.open`, this.app$.getValue());
  }

  addTag(inputEvent: MatChipInputEvent) {
    const input = inputEvent.input;
    const value = inputEvent.value;
    if ((value || '').trim()) {
      this.tags = [...this.tags, value.trim()];
    }

    if (input) {
      input.value = '';
    }
    this.editorApi.updateThemeVersion(this.theme.id, this.activeThemeVersion?.id, { tags: this.tags }).subscribe();
  }

  removeTag(index): void {
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.tags = this.tags;
      this.editorApi.updateThemeVersion(this.theme.id, this.activeThemeVersion?.id, { tags: this.tags }).subscribe();
    }
  }

  onImageUpload($event: any) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';
      reader.onload = () => {
        this.pictureLoading$.next(true);
        this.editorApi.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroy$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.uploadProgress$.next(event.loaded);
                break;
              }
              case HttpEventType.Response: {
                this.uploadProgress$.next(100);
                break;
              }
              default:
                break;
            }
          },
          ),
          filter(event => event.type === HttpEventType.Response && event.body?.blobName),
          switchMap((event) => {
            return this.editorStore.updateThemePreview(event.body.blobName).pipe(
              tap(() => {
                this.theme$.next({
                  ...this.theme,
                  picture: event.body.blobName,
                });
                this.pictureSrc$.next(event.body.blobName);
              }),
            );
          }),
          finalize(() => this.pictureLoading$.next(false)),
        ).subscribe();
      };
    }
  }

  onReviewToggle(): void {
    this.isReviewEnabledSubject$.next(!this.isReviewEnabledSubject$.getValue());
  }

  private execCommand(command: PebEditorCommand) {
    this.editorAccessorService.editorComponent.commands$.next(command);
  }

}
