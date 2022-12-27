import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SelectOptionInterface } from '@pe/forms';

import { BaseControlComponent } from '../base-control.component';

@Component({
  selector: 'pe-select-business-status',
  templateUrl: './select-business-status.component.html',
  styleUrls: ['../control-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBusinessStatusComponent extends BaseControlComponent implements OnInit {
  private businessStatusOptionsSubject$ = new BehaviorSubject<SelectOptionInterface[]>(null);
  businessStatusOptions$ = this.businessStatusOptionsSubject$.asObservable();

  ngOnInit(): void {
    this.setBusinessStatusOptions(this.businessRegistrationData.businessStatuses);
  }

  private setBusinessStatusOptions(businessStatuses: string[]): void {
    const statuses = businessStatuses.map((businessStatus: string) => {
      return {
        value: businessStatus,
        label: this.translateService.translate(`assets.business_status.${businessStatus}`),
      };
    });
    this.businessStatusOptionsSubject$.next(statuses);
    this.control.setValue(businessStatuses[0]);
  }
}
