import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeChatMessage } from '@pe/shared/chat';

import { PeChatForwardSenderComponent } from '../chat-forward-sender/chat-forward-sender.component';

@Component({
  selector: 'pe-chat-forward-menu',
  styleUrls: ['./chat-forward-menu.component.scss'],
  templateUrl: './chat-forward-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeChatForwardMenuComponent {
  @Input() theme = '';
  @Input() forwardMessage : PeChatMessage[];
  @Output() showNameOnForwardMessageEvent = new EventEmitter<boolean>();
  @Output() openChangeRecipientOverlay = new EventEmitter<any>();
  @Output() closeForwardMessageMenuEvent = new EventEmitter<any>();

  constructor(
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    protected cdr: ChangeDetectorRef,
    private overlay: Overlay,
    private translateService: TranslateService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  public _showNameOnForwardMessage = true;
  get showNameOnForwardMessage() {
    return this._showNameOnForwardMessage;
  }

  set showNameOnForwardMessage(value: boolean) {
    this._showNameOnForwardMessage = value;
    this.showNameOnForwardMessageEvent.next(value);
  }

  openForwardSenderFormOverlay(): void {
    const onCloseSubject$ = new Subject<boolean>();
    const onChangeSenderNameSubject$ = new Subject<boolean>();
    const onChangeRecipientSubject$ = new Subject<boolean>();
    const peOverlayConfig: PeOverlayConfig = {
      backdropClick: () => {
        this.peOverlayWidgetService.close();
      },
      data: {
        onChangeSenderNameSubject$,
        onCloseSubject$,
        onChangeRecipientSubject$,
        data: this.showNameOnForwardMessage,
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.forward.overlay.title'),
        theme: this.theme,
      },
      panelClass: 'pe-message-forward-form-overlay',
      component: PeChatForwardSenderComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      tap((res: null | boolean) => {
        this.showNameOnForwardMessage = res;
        this.cdr.detectChanges();
        this.peOverlayWidgetService.close();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    onChangeSenderNameSubject$.pipe(
      tap((res: null | boolean) => {
        this.showNameOnForwardMessage = res;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    onChangeRecipientSubject$.pipe(
      tap((res: null | boolean) => {
        this.peOverlayWidgetService.close();
        this.openChangeRecipientOverlay.emit();
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  closeForwardMessageMenu() {
    this.closeForwardMessageMenuEvent.emit();
  }
}
