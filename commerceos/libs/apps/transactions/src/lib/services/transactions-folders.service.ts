import { Injectable } from '@angular/core';
import { of, OperatorFunction } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { FolderApply, FolderOutputEvent, FolderPosition } from '@pe/folders';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PeFolder } from '../shared';

import { ApiService } from './api.service';

@Injectable()

export class TransactionsFoldersService {
  constructor(
    private snackbarService: SnackbarService,
    private destroy$: PeDestroyService,
    private apiService: ApiService,
    private translateService: TranslateService
  ) {

  }

  onCreateFolder(event: FolderOutputEvent): void {
    const folder = {
      parentFolderId: event.data.parentFolderId,
      position: event.data.position,
      image: event.data.image,
      name: event.data.name,
    } as PeFolder;

    this.apiService.postFolder(folder).pipe(
      tap((createdFolder: PeFolder) => {
        this.applyEvent(event, this.applyFolderMapper(createdFolder));
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
    } as PeFolder;
    this.apiService.postFolder(headline).pipe(
      tap((createdHeadline: PeFolder) => {
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
    };
    this.apiService.patchFolder(folder).pipe(
      tap((updatedFolder: PeFolder) => {
        this.applyEvent(event, this.applyFolderMapper(updatedFolder));
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
      tap((updatedFolder: PeFolder) => {
        this.applyEvent(event, this.applyFolderMapper(updatedFolder));
      }),
      this.errorHandler(event),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onUpdatePositions(positions: FolderPosition[]) {
    if (positions?.length) {
      this.apiService.patchFolderPosition(positions).pipe(
        this.errorHandler(null),
        takeUntil(this.destroy$),
      ).subscribe();

    }

  }

  onDeleteFolder(event: FolderOutputEvent): void {
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
        content: this.translateService.hasTranslation(error.error.message)
          ? this.translateService.translate(error.error.message)
          : error.error.message,
      });

      return of(error);
    });
  }

  private applyEvent(event: FolderOutputEvent, payload: FolderApply | null): void {
    if (event.apply) {
      event.apply(payload);
    }
  }

  private applyFolderMapper(folder: PeFolder): FolderApply | null {
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
