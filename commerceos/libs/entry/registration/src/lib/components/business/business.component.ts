import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take, tap } from 'rxjs/operators';

import { BusinessRegistrationData } from '@pe/api';
import { entryLogo } from '@pe/base';
import { PeDestroyService } from '@pe/common';
import { FormFieldInterface } from '@pe/shared/business-form';
import { RegistrationService } from '@pe/shared/registration';

@Component({
  selector: 'entry-business-registration',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss'],
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessRegistrationComponent implements OnInit {
  @Input() entryLogo = entryLogo;

  messageData: string;
  businessRegistrationData: BusinessRegistrationData;
  industryIcon = entryLogo;

  businessForm: FormFieldInterface[] = [];

  constructor(
    private registrationService: RegistrationService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.data.pipe(
      take(1),
      tap((response: any) => {
        this.businessRegistrationData = response.businessRegistrationData;
        this.businessForm = response?.partner?.form ?? [];
      })
    ).subscribe();

    this.industryIcon = this.registrationService.loadIndustryIcon(this.route.snapshot?.params.industry, entryLogo);
  }

}
