import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { HttpEvent } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, EMPTY, Observable, of, OperatorFunction, timer } from 'rxjs';
import { catchError, filter, mapTo, switchMap, take, tap } from 'rxjs/operators';

import {
  EnvironmentConfigInterface,
  PE_ENV,
  PeDataGridAdditionalFilter,
  PeDataGridFilter,
  PeDataGridItem,
  TreeFilterNode,
} from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { FolderApply, FolderItem, FolderOutputEvent } from '@pe/folders';
import { PeFilterChange, PeGridItem } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PeMyMediaComponent } from '../../studio/my-media/pe-my-media.component';
import { PePreviewComponent } from '../../studio/my-media/preview/pe-preview.component';
import { MediaType, MediaViewEnum } from '../enums';
import {
  PeCreateUserMedia,
  PeStudioAlbum,
  PeStudioCategory,
  PeStudioMedia,
} from '../interfaces';

import { StudioApiService } from './studio-api.service';
import { StudioEnvService } from './studio-env.service';
import { UploadTextService } from './upload-text.service';

export const ALBUMS = 'albums';
export const DEFAULT = 'default';

@Injectable()
export class DataGridItemsService {
  filtersStorage = [];

  get filters$(): Observable<any[]> {
    return this.filtersStream$.asObservable();
  }

  set filters(filters: any[]) {
    this.filtersStream$.next(filters);
  }

  get filters(): any[] {
    return this.filtersStream$.value;
  }

  set selectedIds(selectedIds: string[]) {
    this.selectedIdsStream$.next(selectedIds);
  }

  get dataGridItems$(): Observable<PeDataGridItem[]> {
    return this.dataGridItemsSubject$.asObservable();
  }

  set dataGridItemsFromStorage(items: PeStudioMedia[]) {
    this.dataGridItemsStorage = items;
  }

  get dataGridItemsFromStorage(): PeStudioMedia[] {
    return this.dataGridItemsStorage;
  }

  categories: PeStudioCategory[] = [];
  public userAlbums: PeStudioAlbum[];
  public ownUserMedia: PeStudioMedia[] = [];

  treeItems: TreeFilterNode[];
  attributes: any[] = [];
  mediaFilter: PeDataGridAdditionalFilter;

  private selectedIdsStream$: BehaviorSubject<string[]> = new BehaviorSubject([]);
  private filtersStream$: BehaviorSubject<PeDataGridFilter[]> = new BehaviorSubject([]);
  private dataGridItemsSubject$: BehaviorSubject<PeDataGridItem[]> = new BehaviorSubject([]);
  private dataGridItemsStorage: PeStudioMedia[] = [];

  constructor(
    private studioApiService: StudioApiService,
    private dialog: MatDialog,
    private envService: StudioEnvService,
    private matDialog: MatDialog,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private mediaService: StudioApiService,
    private overlay: Overlay,
    private injector: Injector,
    private apmService: ApmService,
    private uploadTextService: UploadTextService,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
  ) {}

  addFilters(filters: any[]) {
    this.filtersStream$.next(filters);
  }

  public addStudioMediaToList(studioMedia: PeStudioMedia, mediaView: MediaViewEnum | string) {
    let studioMediaItems;
    const previousGridItems = this.dataGridItemsSubject$.getValue().filter(item => item.id !== studioMedia._id);
    studioMediaItems = [
      ...previousGridItems,
      ...[
        this.makeGridItem(studioMedia, mediaView),
      ],
    ];
    this.dataGridItemsSubject$.next(studioMediaItems);
  }

  public removeFromAlbum(ids: string[]): Observable<PeDataGridItem[]> {
    const PeDataGridItems = this.dataGridItemsSubject$.getValue();
    const resultDataGridItems = PeDataGridItems.filter(mediaAlbum => !ids.includes(mediaAlbum.id));
    const result = [...[], ...resultDataGridItems];
    this.dataGridItemsSubject$.next(result);

    return this.dataGridItems$;
  }

  public refreshFilters(): void {
    this.filtersStream$.next(this.filtersStream$.getValue());
  }

  public setDataGridItems(studioMedia: PeStudioMedia[], mediaView: string) {
    this.dataGridItemsSubject$.next(this.transformMediaToGridItems(studioMedia, mediaView));
  }

  transformMediaToGridItems(studioMedia: PeStudioMedia[], mediaView: string) {
    return studioMedia.map((media) => {
      return this.makeGridItem(media, mediaView);
    });
  }

  makeGridItem(media, mediaView) {
    return {
      id: media._id,
      title: media.name,
      image: media.url,
      description: media.albumName ? media.albumName : media.mediaType,
      name: media.name,
      type: media.mediaType,
      updatedAt: media.updatedAt,
      data: {
        mediaView,
        mediaType: media.mediaType,
        ...(media.mediaType === MediaType.Text && media.description && { text: media.description }),
      },
      action: {
        label: media.mediaType !== MediaType.Text && this.translateService.translate('studio-app.grid.action_open'),
        more: true,
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
    };
  }

  openMediaPreview(id: string, mediaView: string) {
    const medias = this.dataGridItemsSubject$.getValue();
    let singleMedia = medias.find(item => item.id === id) as any;
    const theme = this.envService.theme;
    singleMedia = { ...singleMedia, businessId: this.envService.businessId, theme, mediaView };
    this.dialog.open(PeMyMediaComponent, {
      height: '100%',
      width: '100%',
      maxWidth: '100%',
      data: singleMedia,
      panelClass: `preview-modal-overlay`,
    });
  }

  addMultipleMediaToAlbum(id: string, album: PeStudioAlbum): Observable<any> {
    this.dataGridItemsSubject$.next(this.dataGridItemsSubject$.getValue());

    return this.studioApiService.getSubscriptionMediaById(id).pipe(
      take(1),
      switchMap((data) => {
        const payload: PeCreateUserMedia = {
          mediaType: MediaType.Image,
          url: data.url,
          name: data.title ? data.title : this.translateService.translate('studio-app.grid.sample_title'),
        };

        return this.studioApiService.createUserMedia(payload);
      }),
      switchMap((media: PeStudioMedia) => {
        this.ownUserMedia = [media, ...this.ownUserMedia];

        return this.studioApiService.addMultipleMediaToAlbum([media._id], album._id);
      }),
      tap(() => {
        this.dataGridItemsSubject$.next(this.dataGridItemsSubject$.getValue());
      }),
    );
  }

  createFolder(event) {
    const folder = {
      name: event.data.name,
      businessId: this.envService.businessId,
      icon: event.data.image,
      parent: event.data.parentFolderId,
    };

    return this.checkUniqueFolderName(event)
      ? this.studioApiService.createAlbum(folder).pipe(
      tap((album) => {
        const folderItem: FolderItem = {
          ...album,
          position: event.data.position,
        };
        this.filtersStorage = [ ...this.filtersStorage, folderItem];
        this.applyEvent(event, this.applyFolderMapper(folderItem));
      }),
      this.errorHandler(event),
    ) : EMPTY;
  }

  updateFolder(event) {
    const folder = {
      albumId: event.data._id,
      businessId: this.envService.businessId,
      icon: event.data.image,
      name: event.data.name,
      parent: event.data.parentFolderId,
    };

    return this.checkUniqueFolderName(event)
      ? this.studioApiService.updateAlbum(event.data._id, folder)
      .pipe(
        tap((album: PeStudioAlbum) => {
          const folderItem: FolderItem = {
            ...album,
            position: event.data.position,
          };
          this.applyEvent(event, this.applyFolderMapper(folderItem));
        }),
        this.errorHandler(event),
        take(1),
      )
      : EMPTY;
  }

  deleteFolder(event) {
    if (event?.data) {
      const folder = {
        _id: event.data._id,
      };

      if (event.data.children?.length > 0) {
        this.snackbarService.toggle(true, {
          content: `${this.translateService.translate('studio-app.folder.folder_is_not_empty_1')}` +
            ` "${event.data.name}" ${this.translateService.translate('studio-app.folder.folder_is_not_empty_2')}`,
          duration: 2500,
        });

        return EMPTY;
      }

      return this.studioApiService.deleteAlbum(event.data._id)
        .pipe(
          tap(() => {
            this.applyEvent(event, folder);
          }),
          this.errorHandler(event),
        );
    } else {
      return EMPTY;
    }
  }

  checkUniqueFolderName(event) {
    if (
      !event.data.data.hasOwnProperty('oldParent')
      && this.filtersStorage.find(item => item.name === event.data.name)
    ) {
      this.snackbarService.toggle(true, {
        content: `${this.translateService.translate('studio-app.folder.already_exist_1')}` +
          `"${event.data.name}"${this.translateService.translate('studio-app.folder.already_exist_2')}`,
        duration: 2500,
      });

      timer(100).pipe(
        tap(() => this.applyEvent(event, this.applyFolderMapper(null))),
      ).subscribe();

      return false;
    }

    return true;
  }

  private errorHandler(event: FolderOutputEvent): OperatorFunction<any, any> {
    return catchError((error) => {
      if (event) {
        this.applyEvent(event, null);
      }

      this.apmService.apm.captureError(
        `Uploading media in studio / ERROR ms:\n ${JSON.stringify(error)}`
      );

      const constraints = error.error.message[0] ? error.error.message[0].constraints : null;
      this.snackbarService.toggle(true, {
        content: constraints ? constraints[Object.keys(constraints)[0]] : error.error.error,
        duration: 2500,
      });

      return of(error);
    });
  }

  private applyEvent(event: FolderOutputEvent, payload: FolderApply | null): void {
    if (event.apply) {
      event.apply(payload);
    }
  }

  private applyFolderMapper(folder: FolderItem): FolderApply | null {
    if (!folder) {
      return null;
    }

    return {
      _id: folder._id,
      name: folder.name,
      image: folder?.image || null,
      parentFolderId: folder?.parentFolderId || null,
    };
  }

  filterStudioMediaItems(filters: PeFilterChange[], items: PeStudioMedia[]): PeStudioMedia[] {
    let itemsAfterFilters = items;
    filters.forEach((filter) => {
      itemsAfterFilters = itemsAfterFilters.filter((item) => {
        const searchEl =  item[filter.filter];
        const isFound = (new RegExp(filter.search as string, 'i')).test(searchEl);

        return filter.contain === 'contains' ? isFound : !isFound;
      });
    });

    return itemsAfterFilters;
  }

  editItem(gridItem: PeGridItem): Observable<HttpEvent<PeStudioMedia>> {
    switch (gridItem.data.mediaType) {
      case MediaType.Text:
        return this.editTextItem(gridItem);
      default:
        return this.editMediaItem(gridItem);
    }
  }

  private editTextItem(gridItem: PeGridItem): Observable<HttpEvent<PeStudioMedia>> {
    return this.uploadTextService.openTextEditor({
      id: gridItem.id,
      title: gridItem.title,
      description: gridItem.data.text,
    }).pipe(
      tap(({ overlayRef }) => overlayRef.close()),
      switchMap(({ payload }) => this.uploadTextService.editText(payload)),
    );
  }

  private editMediaItem(gridItem): Observable<any> {
    return this.mediaService.getUserSubscriptionMediaById(gridItem.id).pipe(
      switchMap((image) => {
        const overlayRef = this.overlay.create({
          disposeOnNavigation: true,
          hasBackdrop: true,
          positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
          backdropClass: 'cdk-dark-backdrop',
          panelClass: 'preview-modal',
        });
        const confirmScreenPortal = new ComponentPortal(PePreviewComponent, null,
          this.createInjector({ ...image, theme: this.envService.theme }),
        );
        const confirmScreenRef = overlayRef.attach(confirmScreenPortal);

        return confirmScreenRef.instance.detachOverlay
          .pipe(
            tap(() => {
              overlayRef.detach();
              overlayRef.dispose();
            })
          );
      }),
      take(1),
    );
  }

  private createInjector(headings = {}): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [{
        provide: MAT_DIALOG_DATA,
        useValue: { ...headings },
      }],
    });
  }

  deleteMedia(gridItems: PeGridItem[]): Observable<boolean> {
    const selectedIds = gridItems.map(item => item.id);

    const wordsMultiple = selectedIds.length === 1
      ? this.translateService.translate('studio-app.grid.this_media_file')
      : this.translateService.translate('studio-app.grid.these_media_files');

    const dialogRef = this.matDialog.open(ConfirmActionDialogComponent, {
      panelClass: 'studio-confirm-dialog',
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      data: {
        title: this.translateService.translate('studio-app.grid.are_you_sure'),
        description: `${this.translateService.translate('studio-app.grid.delete_message')} ${wordsMultiple}?`,
        cancelButtonTitle: this.translateService.translate('studio-app.grid.confirm'),
        confirmButtonTitle: this.translateService.translate('studio-app.grid.cancel'),
        theme: this.envService.theme,
      },
    });

    return dialogRef.afterClosed().pipe(
      filter(Boolean),
      switchMap(() => {
        return this.removeFromAlbum(selectedIds).pipe(
          switchMap(() =>
            this.studioApiService.deleteMultipleUserMedia(selectedIds).pipe(
              mapTo(true),
              catchError(() => of(false)),
            ),
          ),
        );
      }),
    );
  }
}
