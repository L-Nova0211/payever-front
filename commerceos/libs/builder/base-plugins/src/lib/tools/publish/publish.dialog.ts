import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { share, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi, PEB_STORAGE_PATH } from '@pe/builder-api';
import {
  getPageUrlByName,
  PebPageShort,
  PebPageVariant,
  PebShopContainer,
  PebShopRoute,
  PebShopThemeVersionEntity,
  PebShopThemeVersionId,
  PebThemeShortPageInterface,
} from '@pe/builder-core';
import { BackgroundActivityService, PebEditorStore, SnackbarErrorService } from '@pe/builder-services';
import { PeDestroyService } from '@pe/common';

import { OverlayData, OVERLAY_DATA } from '../../misc/overlay.data';

@Component({
  selector: 'peb-editor-publish-dialog',
  templateUrl: 'publish.dialog.html', // TODO: add skeleton
  styleUrls: ['./publish.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebEditorPublishToolDialogComponent implements OnInit {
  @ViewChild('logoFileInput') logoFileInput: ElementRef;
  @ViewChild('logo') logoEl: ElementRef;
  @ViewChild('logoWrapper') logoWrapperEl: ElementRef;

  shopPicture: string;
  versionName: string;
  shopNameValue = '';
  currentShopName$ = new BehaviorSubject<string>('');

  isVersionCreating: boolean;
  isVersionsLoading = true;
  isEmpty = true;
  isLargeThenParent = false;
  isLoading = false;
  uploadProgress = 0;

  hasActiveBackgroundTasks$ = this.backgroundActivityService.hasActiveTasks$.pipe(
    shareReplay(1),
  );

  readonly versions$ = new BehaviorSubject<PebShopThemeVersionEntity[]>([]);

  private readonly activatedVersionIdSubject$ = new BehaviorSubject<PebShopThemeVersionId>(null);
  get activatedVersionId$(): Observable<PebShopThemeVersionId> {
    return this.activatedVersionIdSubject$.asObservable().pipe(share());
  }

  private editorStore: PebEditorStore;

  constructor(
    @Inject(OVERLAY_DATA) public data: OverlayData,
    @Inject(PEB_STORAGE_PATH) private storagePath: string,
    private api: PebEditorApi,
    private cdr: ChangeDetectorRef,
    private backgroundActivityService: BackgroundActivityService,
    private snackbarErrorService: SnackbarErrorService,
    private dialog: MatDialog,
    private readonly destroy$: PeDestroyService,
  ) {
    this.editorStore = data.data;
  }

  ngOnInit() {
    this.editorStore.theme$.pipe(
      tap((theme) => {
        if (theme.name) {
          this.currentShopName$.next(theme.name);
          this.shopNameValue = theme.name;
        }
        if (theme.picture) {
          this.shopPicture = `${this.storagePath}${theme.picture}`;
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.editorStore.theme$.pipe(
      take(1),
      switchMap(theme => this.api.getShopThemeVersions(theme.id)),
      tap((versions) => {
        versions.sort((a: any, b: any) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        this.isVersionsLoading = false;
        this.versions$.next(versions);
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.versions$.pipe(
      tap((versions) => {
        this.versionName = '0';
        versions.map((version) => {
          if (
            !isNaN(parseInt(version.name, 10)) &&
            version.name.length < 10 &&
            (parseInt(version.name, 10) >= parseInt(this.versionName, 10))) {
            this.versionName = version.name;
          }
        });
        this.versionName = `${parseInt(this.versionName, 10) + 1}`;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onCreateVersion(name: string) {
    this.data.emitter.next({ type: 'publish' } as any);
    // return;
    // if (this.isVersionCreating) {
    //   return;
    // }
    //
    // this.isVersionCreating = true;
    // const homePage = Object.values(this.editorStore.snapshot.pages).find(
    //   page => page.variant === 'front' && page.type !== 'master',
    // );
    // const homeMasterPage = Object.values(this.editorStore.snapshot.pages).find(
    //   page => page.variant === 'front' && page.type === 'master',
    // );
    //
    // if (!homePage) {
    //   this.dialog.open(ErrorDialogComponent, {
    //     position: {
    //       top: 'calc(50vh - 82px)',
    //       left: 'calc(50vw - 200px)',
    //     },
    //     data: {
    //       setBtnCaption: 'Set',
    //       cancelBtnCaption: 'Cancel',
    //       errorText: 'Oh no!',
    //       maintext: `Please select at least one page as homepage.`,
    //       setAction: () => {
    //         const activePage = this.editorStore.snapshot.pages.find(p => p.id === this.editorStore.lastActivePages.replica);
    //         const pagesPayload = this.getPagesPayload(true, activePage);
    //         const routingPayload = this.getRoutingPayload(pagesPayload);
    //         this.editorStore.versionUpdatedSubject$.next(!homeMasterPage);
    //
    //         this.editorStore.updatePagesWithShopRouting(pagesPayload, routingPayload).pipe(
    //           switchMap(() => this.editorStore.theme$),
    //           take(1),
    //           delay(200),
    //           switchMap(theme => this.api.createShopThemeVersion(theme.id, name)),
    //           tap((version: PebShopThemeVersionEntity) => {
    //             this.versionName = '';
    //             this.isVersionCreating = false;
    //             this.versions$.next([version, ...this.versions$.value.map(v => ({ ...v, isActive: false }))]);
    //           }),
    //           takeUntil(this.destroy$),
    //         ).subscribe();
    //       },
    //       cancelAction: () => {
    //         this.versionName = '';
    //         this.isVersionCreating = false;
    //         this.cdr.detectChanges();
    //       },
    //     },
    //     height: '164px',
    //     maxWidth: '400px',
    //     width: '400px',
    //     panelClass: 'error-dialog',
    //   });
    //
    //   return;
    // }
    // this.editorStore.theme$.pipe(
    //   take(1),
    //   switchMap(theme => this.api.createShopThemeVersion(theme.id, name)),
    //   tap((version: PebShopThemeVersionEntity) => {
    //     this.versionName = '';
    //     this.isVersionCreating = false;
    //     this.versions$.next([version, ...this.versions$.value.map(v => ({ ...v, isActive: false }))]);
    //   }),
    //   takeUntil(this.destroy$),
    // ).subscribe();
  }

  private getPagesPayload(
    value: boolean,
    activePage: PebThemeShortPageInterface,
  ): Array<Partial<PebThemeShortPageInterface>> {
    const prevFrontPage = Object.values(this.editorStore.snapshot.pages)
      .find(page => page.variant === PebPageVariant.Front);

    return [
      ...(prevFrontPage ? [{
        ...prevFrontPage,
        variant: PebPageVariant.Default,
      }] : []),
      ...(value ? [{
        ...activePage,
        variant: PebPageVariant.Front,
      }] : []),
    ];
  }

  private getRoutingPayload(pages: Array<Partial<PebPageShort>>): PebShopRoute[] {
    return pages.map((page) => {
      const route = this.editorStore.snapshot.application.routing.find(r => r.pageId === page.id);

      return {
        ...route,
        url: page.variant === PebPageVariant.Front ? '/' : getPageUrlByName(page.name),
      };
    });
  }

  onSelectVersion(id: PebShopThemeVersionId) {
    this.versions$.next(
      this.versions$.value.map(version => ({
        ...version,
        isActive: version.id === id,
      })),
    );
    this.editorStore.theme$.pipe(
      take(1),
      switchMap(theme => this.api.activateShopThemeVersion(theme.id, id)),
      switchMap(({ theme }) => forkJoin([
        this.api.getShopThemeById(theme),
        this.api.getThemeDetail(theme),
      ])),
      tap(([theme, snapshot]) => this.editorStore.openTheme(theme, snapshot, null)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onPublishVersion(id: PebShopThemeVersionId) {
    this.editorStore.theme$.pipe(
      take(1),
      switchMap(theme => this.api.publishShopThemeVersion(theme.id, id)),
      tap(version => this.versions$.next(this.versions$.value.map((v) => {
        v.published = v.id === version.id;

        return v;
      }))),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onDeleteVersion(id: PebShopThemeVersionId) {
    this.editorStore.theme$.pipe(
      take(1),
      switchMap(theme => this.api.deleteShopThemeVersion(theme.id, id)),
      tap(() => this.versions$.next(this.versions$.value.filter(v => v.id !== id))),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onChangeShopName() {
    const name = this.shopNameValue;
    this.currentShopName$.next(name);
    this.editorStore.theme$.pipe(
      take(1),
      switchMap(() => this.editorStore.updateThemeName(name)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onLogoUpload($event: Event) {
    const files = ($event.target as HTMLInputElement).files;
    if (files.length > 0) {
      this.isLoading = true;
      this.isLargeThenParent = false;
      const file = files[0];
      this.logoFileInput.nativeElement.value = '';

      this.api.uploadImageWithProgress(PebShopContainer.Builder, file, true).pipe(
        tap((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress: {
              this.uploadProgress = event.loaded;
              this.cdr.detectChanges();
              break;
            }
            case HttpEventType.Response: {
              this.shopPicture = `${this.storagePath}${event.body.blobName}`;
              this.isLoading = false;
              this.uploadProgress = 0;
              this.cdr.detectChanges();
              this.editorStore.updateThemePreview(event.body.blobName).subscribe();
              break;
            }
            default: break;
          }
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  onLogoLoad() {
    const logo: HTMLImageElement = this.logoEl.nativeElement;
    const logoWrapper: HTMLImageElement = this.logoWrapperEl.nativeElement;
    this.isLargeThenParent = logo.width >= logoWrapper.clientWidth || logo.height >= logoWrapper.clientHeight;
  }
}
