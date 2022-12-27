import { HttpEvent } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { MessageBus } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeThemeEnum } from '@pe/theme-switcher';

import {
  PeStudioUploadTextOptionComponent,
} from '../../studio/upload-options/upload-text-option/upload-text-option.component';
import { MediaType } from '../enums';
import { PeStudioMedia } from '../interfaces';
import { StudioApiService } from '../services/studio-api.service';

@Injectable()
export class UploadTextService implements OnDestroy {
  destroy$ = new Subject<void>();

  constructor(
    private peOverlayWidgetService: PeOverlayWidgetService,
    private studioApiService: StudioApiService,
    private confirmScreenService: ConfirmScreenService,
    private messageBus: MessageBus,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createText({ title, description }): Observable<HttpEvent<PeStudioMedia>> {
    return this.studioApiService.createUserMedia({
      description,
      mediaType: MediaType.Text,
      name: title,
    }, true) as Observable<HttpEvent<PeStudioMedia>>;
  }

  editText({ id, title, description }): Observable<HttpEvent<PeStudioMedia>> {
    return this.studioApiService.updateUserMedia({
      id,
      description,
      mediaType: MediaType.Text,
      name: title,
    }, true) as Observable<HttpEvent<PeStudioMedia>>;
  }

  openTextEditor(data?: { title, description, id: string }): Observable<{ payload: any, overlayRef: PeOverlayRef }> {
    const payloadSubject$ = new ReplaySubject<any>();
    const closingSubject$ = new Subject<void>();

    this.messageBus.listen<boolean>('confirm').pipe(
      filter(Boolean),
      tap(() => overlayRef.close()),
      take(1),
      takeUntil(this.destroy$),
    ).subscribe();

    const showConfirmationDialog = () => {
      return this.confirmScreenService.show({
        confirmBtnText: 'Close',
        declineBtnText: 'Cancel',
        subtitle: 'Do you really want to close this window? \
          All data will be lost and you will not be able to restore it',
        title: 'Uploading Text',
      });
    }

    const overlayRef = this.peOverlayWidgetService.open({
      backdropClick: () => showConfirmationDialog(),
      component: PeStudioUploadTextOptionComponent,
      headerConfig: {
        title: data ? 'Edit text' : 'Add text',
        backBtnTitle: 'Cancel',
        backBtnCallback: () => showConfirmationDialog(),
        theme: PeThemeEnum.DARK,
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          closingSubject$.next();
        },
      },
      hasBackdrop: true,
      panelClass: 'overlay',
      data: {
        ...(data || {}),
        closingSubject$,
        payloadSubject$,
      },
    });

    return payloadSubject$.pipe(
      map(payload => ({
        payload: {
          ...payload,
          ...( data?.id && { id: data.id }),
        },
        overlayRef,
      })),
      take(1),
    );
  }
}
