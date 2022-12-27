import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, take, takeUntil, tap } from 'rxjs/operators';

import { EnvService, PeDestroyService } from '@pe/common';
import { OverlayHeaderConfig, PeOverlayConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChat } from '@pe/shared/chat';

import { PeMessageChannelInfo } from '../../../interfaces';
import { PeMessageAppearanceComponent } from '../../../modules/integration';
import { PeMessageIntegrationService } from '../../../services';
import { PeMessageApiService } from '../../../services/message-api.service';

@Component({
  selector: 'pe-message-chat-permissions',
  templateUrl: './message-chat-permissions.component.html',
  styleUrls: ['./message-chat-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageChatPermissionsComponent {
  collapsed = true;
  config: PeOverlayConfig;

  public chatPermissions = this.formBuilder.group({
    addMembers: [],
    change: [],
    live: [],
    pinMessages: [],
    publicView: [],
    sendMedia: [],
    sendMessages: [],
    showSender: [],
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private injector: Injector,
    private overlay: Overlay,
    private router: Router,

    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: PeMessageChat,
    private envService: EnvService,
    private readonly destroy$: PeDestroyService,

    private peMessageApiService: PeMessageApiService,
    private peMessageIntegrationService: PeMessageIntegrationService,
  ) {
    this.chatPermissions.patchValue(this.peOverlayData.permissions);
    this.chatPermissions.markAsPristine();
    this.peOverlayConfig.doneBtnCallback = () => {
      if (this.chatPermissions.dirty) {
        this.saveConversationPermissions();
      } else {
        this.peOverlayConfig.backBtnCallback();
      }
    };
  }

  private readonly saveConversationPermissions = (): void => {
    const { _id, type, business } = this.peOverlayData;
    this.peOverlayConfig.isLoading = true;
    this.peMessageApiService.postConversationPermissions(business, _id, type, this.chatPermissions.value)
      .pipe(
        tap(() => {
          this.peOverlayConfig.onSaveSubject$.next(true);
          this.peOverlayConfig.isLoading = false;
        }),
        catchError((error) => {
          this.peOverlayConfig.onSaveSubject$.next(true);
          this.peOverlayConfig.isLoading = false;

          return of(error);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  openAppearanceIntegrationDialog(): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'permissions-appearance-backdrop',
      panelClass: 'permissions-appearance-widget-panel',
    });

    overlayRef.backdropClick().subscribe(() => overlayRef.dispose());

    return overlayRef;
  }

  public openAppearanceIntegration(): void {
    const overlayRef = this.openAppearanceIntegrationDialog();
    const appearanceIntegration = overlayRef
      .attach(new ComponentPortal(PeMessageAppearanceComponent, null, this.createInjector()));

    appearanceIntegration.instance.onClose$
      .pipe(
        take(1),
        tap((data) => {
          data && this.cdr.detectChanges();
          overlayRef.dispose();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private createInjector(): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [{
        provide: PE_OVERLAY_DATA,
        useValue: this.peOverlayData,
      }],
    });
  }

  onToggleIntegration(event: any , openIntegration = true): void {
    // this.collapsed = !this.collapsed;
    const { _id, business, type } = this.peOverlayData;
    this.peMessageApiService.postConversationPermissions(business, _id, type, { live: this.chatPermissions.value.live })
      .pipe(
        tap(()=> {
          const url = event && openIntegration
            ? `business/${this.envService.businessId}/message/integration`
            : `business/${this.envService.businessId}/message`;
          this.router.navigate([url]);
        }),
        takeUntil(this.destroy$))
      .subscribe();
    this.cdr.detectChanges();
  }

  saveIntegration(): Observable<PeMessageChannelInfo>[] {
    const patchIntegrationChannels$ = [];
    this.config.data.channelList.forEach(item => {
      const ICList = this.peMessageIntegrationService.integrationChannelList;
      const isUsedInWidget = ICList.length === 0 || !!ICList.find(ICItem => ICItem.value === item._id);
      patchIntegrationChannels$.push(this.peMessageApiService.patchIntegrationChannel(
        this.envService.businessId,
        item._id,
        { usedInWidget: isUsedInWidget }
      ));
    });

    return patchIntegrationChannels$;
  }
}
