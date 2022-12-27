import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AppointmentsInterface } from '@pe/dashboard-widgets';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';

import { AbstractWidgetComponent } from '../../abstract-widget.component';



@Component({
  selector: 'appointments-widget',
  templateUrl: './appointments-widget.component.html',
  styleUrls: ['./appointments-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'appointments';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,

  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_APPOINTMENT_DATA);
  }

  ngOnInit(): void {

    this.editWidgetsService.defaultAppointmentsSubject$.pipe(
      takeUntil(this.destroyed$),
      tap((data : AppointmentsInterface[]) => {
        this.widget = {
          ...this.widget,
          data: data,
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
        this.cdr.detectChanges();
      }),

    ).subscribe();
  }
}
