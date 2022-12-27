import { HttpClient } from '@angular/common/http';
import { EventEmitter, Inject, Injectable, OnDestroy } from '@angular/core';
import { concat, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, exhaustMap, filter, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ActionDTO, OnboardingDTO, OnboardingRequestDTO } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class PartnerService implements OnDestroy {
  public partnerAfterActions: EventEmitter<any> = new EventEmitter();
  public actionController = new Subject();
  public partnerData: OnboardingDTO;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: PeAuthService,
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private http: HttpClient,
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPartnerData({ industry = '', country = undefined, app = undefined, fragment = undefined }) {
    let url = `${this.envConfig.backend.commerceos}/api/onboarding/cached`;
    const body = new OnboardingRequestDTO(industry, country, app, fragment);

    return this.http.post<OnboardingDTO>(url, body);
  }

  getPartnerFromLocalStorage(): OnboardingDTO {
    const partnerData = localStorage.getItem('pe-partners-data');

    return partnerData ? JSON.parse(partnerData) : null;
  }

  runAfterActions(actionsArray, id, partnerName, re): Observable<unknown> {
    const actions = actionsArray.sort((a, b) => {
      return a.orderId - b.orderId;
    });

    const reqsDict = actions.reduce((acc, curr) => {
      curr.url = curr.url.replace(re, id);
      const key = curr.priority ?? 0;
      acc[key]
        ? acc[key].push(this.partnerAfterActionApi(curr))
        : acc[key] = [this.partnerAfterActionApi(curr)];

      return acc;
    }, {});

    const reqsByPriority$ = Object.values(reqsDict).map(priority =>
      forkJoin(Array.isArray(priority) ? priority : [priority]));

    if (!reqsByPriority$?.length) {
      return of(null);
    }

    return forkJoin([
      concat(...reqsByPriority$),
    ]).pipe(
      tap(() => this.actionController.next()),
      tap(([res]) => {
        if (res?.some(r => !!r)) {
          this.sendRedirectUrl(id, partnerName, res.find((val: any) => val.status !== 200))?.pipe(
            filter(d => !!d),
            take(1),
            takeUntil(this.destroy$),
            tap((res: any) => window.location.href = res.redirectUrl),
          ).subscribe();
        }
      }),
    );
  }

  public partnerAfterActionApi(requestData: ActionDTO): Observable<any> {
    const url: string = requestData.url;
    const data = requestData.method === 'POST' || requestData.method === 'PATCH' ? requestData.payload ?? {} : {};
    const headers = {
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify(data);

    return this.http.request(
      requestData.method,
      url,
      {
        body,
        headers,
      },
    ).pipe(
      catchError(() => of(null)),
      exhaustMap((res: any) => requestData.name === 'refresh-token'
        ? this.authService.setToken(res.accessToken)
        : of(res)
      ),
    );
  }

  public sendRedirectUrl(businessId, integration, isError) {
    const redirectUriItem = localStorage.getItem('redirect_uri');
    const redirectUrl = redirectUriItem ? JSON.parse(redirectUriItem) : null;
    if (redirectUrl && !isError) {
      const url = `${this.envConfig.backend.commerceos}/api/onboarding/redirect-to-partner/business/${businessId}/integration/${integration}`;
      localStorage.setItem('redirect_uri', '');

      return this.http.get(url, {
        params: {
          redirectUrl: redirectUrl,
        },
      });
    }

    return of(null);
  }
}
