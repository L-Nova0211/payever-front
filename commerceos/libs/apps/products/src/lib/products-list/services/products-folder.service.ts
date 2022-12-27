import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { FolderApply, FolderItem, FolderOutputEvent, FolderPosition } from '@pe/folders';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ProductsFolderAction } from '../../shared/interfaces/folder.interface';
import { ProductsApiService } from '../../shared/services/api.service';

@Injectable()

export class ProductsFoldersService {
  folderChange$ = new Subject<{ folder: FolderItem, action: ProductsFolderAction }>();

  constructor(
    private snackbarService: SnackbarService,
    private destroy$: PeDestroyService,
    private apiService: ProductsApiService,
    private translateService: TranslateService,
  ) {

  }

  onCreateFolder(event: FolderOutputEvent): void {
    const folder = {
      parentFolderId: event.data.parentFolderId,
      position: event.data.position,
      image: event.data.image,
      name: event.data.name,
    };

    this.apiService.postFolder(folder).pipe(
      tap((createdFolder: FolderItem) => {
        this.applyEvent(event, this.applyFolderMapper(createdFolder));
        this.folderChange$.next({
          folder: createdFolder,
          action: ProductsFolderAction.Add,
        });
      }),
      this.errorHandler(event),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onCreateHeadline(event: FolderOutputEvent): void {
    const headline = {
      name: event.data.name,
      position: event.data.position,
      isHeadline: true,
    };
    this.apiService.postFolder(headline).pipe(
      tap((createdHeadline: FolderItem) => {
        this.applyEvent(event, this.applyFolderMapper(createdHeadline));
      }),
      this.errorHandler(event),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onUpdateFolder(event: FolderOutputEvent): void {
    const folder = {
      parentFolderId: event.data.parentFolderId,
      image: event.data.image,
      name: event.data.name,
      position: event.data.position,
      _id: event.data._id,
      isProtected: event.data.isProtected,
      isHeadline: event.data.isHeadline,
    };
    this.apiService.patchFolder(folder).pipe(
      tap((updatedFolder: FolderItem) => {
        this.applyEvent(event, this.applyFolderMapper(updatedFolder));
        this.folderChange$.next({
          folder: updatedFolder,
          action: ProductsFolderAction.Update,
        });
      }),
      this.errorHandler(event),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onUpdateHeadline(event: FolderOutputEvent): void {
    const folder = {
      image: event.data.image,
      name: event.data.name,
      position: event.data.position,
      _id: event.data._id,
    };
    this.apiService.patchFolder(folder).pipe(
      tap((updatedFolder: FolderItem) => {
        this.applyEvent(event, this.applyFolderMapper(updatedFolder));
      }),
      this.errorHandler(event),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onUpdatePositions(positions: FolderPosition[]) {
    const newPositions = positions.map((p) => {
      return {
        _id: p._id,
        position: p.position,
      };
    });
    if (positions?.length) {
      this.apiService.patchFolderPosition(newPositions).pipe(
        this.errorHandler(null),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  onDeleteFolder(event: FolderOutputEvent): Observable<any> {
    if (event?.data) {
      const folder = {
        _id: event.data._id,
      };

      return this.apiService.getFolderDocuments(folder._id, {}).pipe(
        switchMap((data) => {
          let foldersToMove = [];
          data.collection.forEach((item) => {
            foldersToMove.push(this.apiService.moveToRoot(item._id));
          });

          const deleteFolder$ = this.apiService.deleteFolder(folder._id).pipe(
            tap(() => {
              this.applyEvent(event, folder);
              this.folderChange$.next({
                folder: event.data,
                action: ProductsFolderAction.Delete,
              });
            }),
            this.errorHandler(event),
            takeUntil(this.destroy$),
          );

          return foldersToMove.length ? forkJoin(foldersToMove).pipe(
            switchMap(() => {
              return deleteFolder$;
            }),
          ) : deleteFolder$;
        }),
      );
    }
  }

  onDeleteHeadline(event: FolderOutputEvent): void {
    const folder = {
      _id: event.data._id,
    };
    this.apiService.deleteFolder(folder._id).pipe(
      tap(() => {
        this.applyEvent(event, folder);
      }),
      this.errorHandler(event),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private errorHandler(event: FolderOutputEvent): OperatorFunction<any, any> {
    return catchError((error) => {
      if (event) {
        this.applyEvent(event, null);
      }

      this.snackbarService.toggle(true, {
        content: this.getErrorTranslate(error.error.errors || error.error.message, event.data),
      });

      return of(error);
    });
  }

  getErrorTranslate(message, data) {
    return `${this.translateService.translate('folders.actions.error.folder_intro')}
     ${data.name} ${this.translateService.translate(message)}`;
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
}
