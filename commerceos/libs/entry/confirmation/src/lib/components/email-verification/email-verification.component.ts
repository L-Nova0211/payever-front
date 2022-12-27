import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, filter, mergeMap, take, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { TranslationLoaderService } from '@pe/i18n-core';
import { WindowService } from '@pe/window';

@Component({
  selector: 'entry-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  errors: any;
  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(
    take(1),
    filter(isMobile => !!isMobile),
  );

  translationsReady$ = new BehaviorSubject<boolean>(false);

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private windowService: WindowService,
    private authService: PeAuthService,
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
  ) {}

  ngOnInit(): void {
    this.initTranslations();

    this.translationsReady$
      .pipe(
        filter(ready => !!ready),
        take(1),
        tap(() => {
          this.getToken();
        }),
      )
      .subscribe();
  }

  initTranslations(): void {
    this.translationLoaderService
      .loadTranslations(['commerceos-app'])
      .pipe(
        take(1),
        catchError((error) => {
          console.warn('Cant load translations for domains', ['commerceos-app'], error);

          return of(true);
        }),
      )
      .subscribe(() => {
        this.translationsReady$.next(true);
      });
  }

  getToken(): void {
    this.activatedRoute.params
      .pipe(
        take(1),
        mergeMap((params: Params) => {
          return this.apiService.verifyEmail(params['token']);
        }),
      )
      .subscribe(
        () => {
          this.isLoading = false;
        },
        (errors: any) => {
          this.isLoading = false;
          this.errors = errors;
        },
      );
  }

  navigateToLogin(): void {
    this.router.navigate(['/']);
  }
}
