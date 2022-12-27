import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';
import { tap, take, catchError } from 'rxjs/operators';

import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { UIActionInterface } from '../../../shared/interfaces/action.interface';

@Injectable()
export class ActionsContainerService {
  private closedSubject$ = new Subject<void>();
  closed$ = this.closedSubject$.asObservable();

  private loading$: BehaviorSubject<boolean>;

  constructor(
    private httpClient: HttpClient,
    private confirmScreenService: ConfirmScreenService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) { }

  showConfirm(action: UIActionInterface) {
    this.loading$ = new BehaviorSubject<boolean>(false);
    const headings: Headings = {
      ...action.confirmHeadings,
      confirmLoading$: this.loading$,
    }
    this.confirmScreenService.show(headings, true).pipe(
      tap((confirm) => {
        if (!confirm) {
          return;
        }

        this.downloadByLink(action.href, action?.errorMessage, action.onClick);
      }),
    ).subscribe();
  }

  downloadByLink(href: string, errorMessage: string, callback: (event?: Event) => void) {
    this.httpClient
    .get(href, {
      responseType: 'blob',
      observe: 'response',
    })
    .pipe(
      take(1),
      tap((resp) => {
        if (resp.body.type === 'application/json') {
          this.closedSubject$.next();
          this.showError(errorMessage);
          this.loading$.next(false);

          return;
        }
        const contentDisposition: string = resp.headers.get('content-disposition');
        let fileName: string;

        if (contentDisposition) {
          fileName = contentDisposition.substring(contentDisposition.indexOf('=') + 1);
        } else {
          fileName = 'test.contract.pdf';
        }

        const el: HTMLAnchorElement = document.createElement('a');
        document.body.appendChild(el);
        el.href = window.URL.createObjectURL(resp.body);
        el.download = fileName;
        el.onclick = (e: Event) => {
          this.loading$.next(false);
          callback(e)
        };
        el.click();
        el.remove();

        this.closedSubject$.next();
      }),
      catchError(() => {
        this.showError(errorMessage);
        this.loading$.next(false);

        return of(EMPTY);
      })
    )
    .subscribe();
  }

  private showError(message: string): void {
    this.snackbarService.toggle(true, {
      content: message || this.translateService.translate('transactions.errors.unknown'),
    });
  }
}
