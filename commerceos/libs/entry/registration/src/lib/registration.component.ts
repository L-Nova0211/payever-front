import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isUndefined, keys } from 'lodash-es';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { RegistrationService } from '@pe/shared/registration';

import { FrontendAppsEnum } from './enums';


@Component({
  selector: 'entry-registration',
  template: `
    <entry-personal-registration [entryLogo]="entryLogo" *ngIf="step !== 2"></entry-personal-registration>
    <entry-business-registration *ngIf="type === 'business' && step === 2" [entryLogo]="entryLogo" ></entry-business-registration>
  `,
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent implements OnInit, OnDestroy {

  step: number;
  type = this.activatedRoute.snapshot.data.type;

  entryLogo: any;

  private readonly frontendAppsNotAllowed: string[] = [
    'Builder',
    'CheckoutWrapper',
    'Commerceos',
    'PosClient',
    'ShopsClient',
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private registrationService: RegistrationService,
    private router: Router,
    private destroyed$: PeDestroyService,
  ) {
  }

  ngOnInit() {
    localStorage.setItem('redirect_uri', '');
    this.activatedRoute.data.pipe(
      filter(response => !!response.partner),
      tap((response) => {
        this.entryLogo = {
          height: 30,
          icon: response.partner.logo,
          width: 320,
        };
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.activatedRoute.params.pipe(
      tap((params) => {
        if (!isUndefined(params.app)) {
          let appNameIsValid = false;

          keys(FrontendAppsEnum)
            .filter(key => this.frontendAppsNotAllowed.indexOf(key) === -1)
            .map((key) => {
              if (!appNameIsValid && FrontendAppsEnum[key] === params.app) {
                appNameIsValid = true;
              }
            });

          if (!appNameIsValid) {
            this.router.navigate(['/registration/business']);
          }
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      if (!isUndefined(params.redirect_uri)) {
        localStorage.setItem('redirect_uri', JSON.stringify(params.redirect_uri));
      }
    });

    this.registrationService.registrationStep$.pipe(
      tap((step) => {
        this.step = step;

        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.registrationService.registrationStep$.next(1);
  }
}
