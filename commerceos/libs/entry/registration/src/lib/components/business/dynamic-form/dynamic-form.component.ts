import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { BusinessDataInterface, FormFieldInterface } from '@pe/shared/business-form';

import { BaseBusinessFormComponent } from '../base-business-form.component';

@Component({
  selector: 'entry-dynamic-business-registration',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicBusinessRegistrationComponent extends BaseBusinessFormComponent implements OnInit {
  @Input() businessForm: FormFieldInterface[];

  prepareBusinessData(): BusinessDataInterface {
    return {
      id: this.businessId,
      ...this.businessData,
    };
  }

}
