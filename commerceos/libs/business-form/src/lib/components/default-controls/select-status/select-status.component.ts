import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SelectOptionInterface } from '@pe/forms';

import { BaseControlComponent } from '../base-control.component';

@Component({
  selector: 'pe-select-status',
  templateUrl: './select-status.component.html',
  styleUrls: ['../control-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectStatusComponent extends BaseControlComponent implements OnInit {

  private statusOptionsSubject$ = new BehaviorSubject<SelectOptionInterface[]>(null);
  statusOptions$ = this.statusOptionsSubject$.asObservable();

  ngOnInit(): void {
    this.setStatusOptions(this.businessRegistrationData.statuses);
  }

  private setStatusOptions(statuses: string[]): void {
    this.statusOptionsSubject$.next(
      statuses.map((status: string) => {
        return {
          value: status,
          label: this.translateService.translate(`assets.status.${status}`),
        };
      }),
    );
    this.control.setValue(statuses[0]);
  }
}
