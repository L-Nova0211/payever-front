import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AppSetUpStatusEnum, MicroAppInterface } from '@pe/common';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';

import { TerminalInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'pos-widget',
  templateUrl: './pos-widget.component.html',
  styleUrls: ['./pos-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PosWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;

  terminal$: BehaviorSubject<TerminalInterface> = new BehaviorSubject(null);
  showEditButtonSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  terminals: TerminalInterface[] = [];

  readonly appName: string = 'pos';

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService: EditWidgetsService,
  ) {

    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_POS_TERMINAL_DATA);
  }

  ngOnInit(): void {

    // NOTE: this need to open selected terminal when click "Open" in widget
    this.editWidgetsService.defaultPosSubject$
      .pipe(
        takeUntil(this.destroyed$),
        tap((terminal) => {
          if (terminal) {
            this.widget = {
              ...this.widget,
              data: [
                {
                  title: terminal?.terminalName,
                  isButton: false,
                  imgSrc: terminal?.terminalLogo,
                },
                {
                  title: 'widgets.pos.actions.edit-terminal',
                  isButton: true,
                  onSelect: () => {
                    this.onTerminalEditClick();

                    return EMPTY;
                  },
                },
              ],
              openButtonFn: () => {
                this.onOpenButtonClick();

                return EMPTY;
              },
            };

            this.terminal$.next(terminal);

            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe((terminal: TerminalInterface) => {
        this.appUrlPath = `${this.appName}/${terminal?.terminalId}/dashboard`;
      });
  }

  onTerminalEditClick(): void {
    this.showEditButtonSpinner$.next(true);
    this.router.navigate(
      [
        'business',
        this.businessData._id,
        'pos',
        this.editWidgetsService.defaultPosSubject$.value?.terminalId,
        'settings',
      ],
      { queryParams: { isEdit: true } },
    );
  }

  onOpenButtonClick(): void {
    this.showButtonSpinner$.next(true);
    if (this.terminal$?.value) {
      this.router.navigate(['business', this.businessData._id, 'pos', this.editWidgetsService.defaultPosSubject$.value?.terminalId, 'dashboard']);

      return;
    }

    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(this.appName) as MicroAppInterface;
    if ((micro && micro.setupStatus === AppSetUpStatusEnum.Completed)) {
      this.appLauncherService.launchApp(this.appName, this.appUrlPath).subscribe(
        () => {
        },
        () => {
          this.showButtonSpinner$.next(false);
        },
      );
    } else {
      const url = `business/${this.businessData._id}/welcome/${this.appName}`;
      this.router.navigate([url]); // go to welcome-screen
    }
  }
}
