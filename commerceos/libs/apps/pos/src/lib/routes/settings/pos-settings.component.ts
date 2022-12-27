import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import isEmpty  from 'lodash/isEmpty';
import { BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import {
  PeSettingsCreateAppComponent,
  PeSettingsPayeverDomainComponent,
} from '../../components';
import { TerminalInterface } from '../../services/pos.types';
import { PosApi } from '../../services/pos/abstract.pos.api';
import { PosEnvService } from '../../services/pos/pos-env.service';

@Component({
  selector: 'peb-pos-settings',
  templateUrl: './pos-settings.component.html',
  styleUrls: ['./pos-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebPosSettingsComponent implements OnInit {
  openedTerminal: any;
  terminalList: any[] = [];
  isLive: boolean;
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default;

  onSavedSubject$ = new BehaviorSubject(null);

  components = {
    payeverDomain: {
      component: PeSettingsPayeverDomainComponent,
      header: 'pos-app.settings.payever_domain',
    },
    createApp: {
      component: PeSettingsCreateAppComponent,
      header: 'pos-app.settings.add_terminal',
    },
  };

  isOpenEdit = false;
  isOpenEditOnce = false;

  copyButtons: {
    businessUUID: string;
    terminalUUID: string;
  } = {
    businessUUID: 'pos-app.actions.copy',
    terminalUUID: 'pos-app.actions.copy',
  };

  get businessId(): string {
    return this.envService.businessId;
  }

  get posId(): string {
    return this.envService.posId;
  }

  constructor(
    private posApi: PosApi,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    @Inject(EnvService) private envService: PosEnvService,
    private translateService: TranslateService,
    private destroy$: PeDestroyService,
    private messageBus: MessageBus,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.getPosList().subscribe();
    this.onSavedSubject$.asObservable().pipe(
      tap((data: any) => {
        if (data?.updatePosList) {
          this.getPosList().subscribe();
        } else if (data?.openTerminal) {
          this.route.snapshot.parent.parent.data = {
            ...this.route.snapshot?.parent?.parent?.data,
            terminal: data.terminal,
          };
          this.messageBus.emit('pos.navigate.dashboard', data.terminal._id);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getPosList() {
    return this.posApi.getPosList().pipe(
      tap((terminals: TerminalInterface[]) => {
        this.terminalList = terminals;
          this.isOpenEdit = this.route.snapshot.queryParams?.isEdit;
        if (this.isOpenEdit && !this.isOpenEditOnce) {
          const defaultTerminal = terminals.find(terminal => terminal.active);
          this.openOverlay(this.components.createApp, defaultTerminal);
          this.isOpenEditOnce = true;
        }
        this.cdr.markForCheck();
      }),
      switchMap(() => {
        return this.posApi.getSinglePos(this.envService.posId).pipe(
          tap((terminal: TerminalInterface) => {
            this.openedTerminal = terminal;
            this.cdr.markForCheck();
          }),
        );
      }),
    );
  }

  onCopy(button: string) {
    const timeout = setTimeout(
      () => {
        this.copyButtons[button] = 'pos-app.actions.copy';
        this.cdr.markForCheck();
        clearTimeout(timeout);
      },
      2000,
    );
    this.copyButtons[button] = 'pos-app.actions.copied';
  }

  openOverlay(item, itemData?: any) {
    const overlayData = itemData ? itemData : this.openedTerminal;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: item.component,
      data: { ...overlayData, onSved$: this.onSavedSubject$ },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: this.translateService.translate(isEmpty(itemData) ? item.header : 'pos-app.settings.edit_terminal'),
        backBtnTitle: this.translateService.translate('pos-app.actions.cancel'),
        theme: this.theme,
        backBtnCallback: () => this.overlay.close(),
        cancelBtnTitle: '',
        cancelBtnCallback: () => { },
        doneBtnTitle: this.translateService.translate('pos-app.actions.done'),
        doneBtnCallback: () => this.overlay.close(),
      },
    };

    this.overlay.open(
      config,
    );
  }
}
