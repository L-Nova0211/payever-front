import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AppSetUpService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeSimpleStepperService } from '@pe/stepper';

import { TimestampEvent } from '../../../components/timestamp-event';
import { CheckoutInterface, IntegrationInfoInterface, WelcomeStepEnum } from '../../../interfaces';
import { HeaderService, StorageService } from '../../../services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'welcome-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class WelcomeDetailsComponent implements OnInit {

  onLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  onInvalidSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  submit$: BehaviorSubject<TimestampEvent> = new BehaviorSubject<TimestampEvent>(null);
  loading: boolean;

  integration: IntegrationInfoInterface;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appSetUpService: AppSetUpService,
    private peStepperService: PeSimpleStepperService,
    private storageService: StorageService,
    private headerService: HeaderService,
    private translateService: TranslateService,
    private router: Router
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit(): void {
    this.appSetUpService.setStep(this.storageService.businessUuid, 'checkout', WelcomeStepEnum.Details).subscribe();
    this.peStepperService.show('stepper.details.title', [
      {
        title: 'actions.continue',
        isLoading$: this.onLoadingSubject.asObservable(),
        isDisabled$: this.onInvalidSubject.asObservable(),
        onClick: (event: MouseEvent) => {
          this.onSubmit();
        },
      },
    ]);
    // this.platformService.microAppReady = 'checkout';
    this.headerService.hideHeader();
  }

  onSubmit(): void {
    this.submit$.next(new TimestampEvent());
  }

  onSuccess(checkout: CheckoutInterface = null): void {
    this.onLoadingSubject.next(true);
    const base = this.storageService.getHomeUrl(checkout ? checkout._id : this.checkoutUuid);
    this.router.navigate([`${base}/welcome/payments`]);
  }
}
