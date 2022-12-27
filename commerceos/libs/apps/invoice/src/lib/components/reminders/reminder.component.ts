import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeInvoiceApi } from '../../services/abstract.invoice.api';

@Component({
  selector: 'pe-invoice-reminders',
  templateUrl: './reminder.component.html',
  styleUrls: ['./reminder.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeInvoiceSettingsRemindersComponent implements OnInit {
  reminder;
  hasReminder: boolean;
  frequency = '1';

  constructor(
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private destroyed$: PeDestroyService,
    private api: PeInvoiceApi,
  ) {
    config.doneBtnCallback = this.saveSettings;
  }

  ngOnInit() {
    this.api.getReminder().pipe(
      takeUntil(this.destroyed$),
    ).subscribe((data) => {
      this.hasReminder = !!data.frequencyDay;
      this.reminder = !!data.frequencyDay;
      this.frequency=data.frequencyDay?.toString()|| '1';
      this.cdr.detectChanges();
    })
  }

  saveSettings = () => {
    if (!this.reminder && !this.hasReminder) {
      this.overlay.close()

      return
    }
    if (!this.hasReminder) {
      this.api.deleteReminder().pipe(
        takeUntil(this.destroyed$),
      ).subscribe(() => this.overlay.close())
    } else {
      this.api.setReminder(+this.frequency).pipe(
        takeUntil(this.destroyed$),
      ).subscribe(() => this.overlay.close())
    }
  }

}
