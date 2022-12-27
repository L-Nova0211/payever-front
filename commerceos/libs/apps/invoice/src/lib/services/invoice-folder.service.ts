import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { of, OperatorFunction, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { FolderApply, FolderItem, FolderOutputEvent, FolderPosition } from '@pe/folders';
import { SnackbarService } from '@pe/snackbar';

import { InvoicFolderAction } from '../enum/filter.enum';
import { PebInvoiceGridService } from '../routes/grid/invoice-grid.service';
import { DeleteItems } from '../routes/grid/store/folders.actions';

import { InvoiceApiService } from './api.service';

@Injectable()
export class InvoiceFoldersService {
  folderChange$ = new Subject<{ folder: FolderItem, action: InvoicFolderAction }>();
  constructor(
    private snackbarService: SnackbarService,
    private destroy$: PeDestroyService,
    private apiService: InvoiceApiService,
    private store: Store,
    private invoiceGridService: PebInvoiceGridService,
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
          action: InvoicFolderAction.Add,
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
          action: InvoicFolderAction.Update,
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
      }
    })
    if (positions?.length) {
      this.apiService.patchFolderPosition(newPositions).pipe(
        this.errorHandler(null),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  onDeleteFolder(event: FolderOutputEvent): void {
    if (event?.data) {
      const folder = {
        _id: event.data._id,
      };
      this.apiService.deleteFolder(folder._id).pipe(
        tap(() => {
          this.applyEvent(event, folder);
          this.store.dispatch(new DeleteItems([folder._id]));
        }),
        this.errorHandler(event),
        takeUntil(this.destroy$),
      ).subscribe();
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
        content: error.error.errors || error.error.message,
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
}