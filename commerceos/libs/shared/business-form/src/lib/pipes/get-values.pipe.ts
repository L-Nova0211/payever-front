import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { ActionInterface, FormFieldInterface, FormFieldValueInterface } from '../interfaces';

@Pipe({
  name: 'getValues',
  pure: false,
})
export class GetValuesPipe implements OnDestroy, PipeTransform {
  private values: FormFieldValueInterface[] = [];
  private actionData: ActionInterface;

  constructor(
    private cdr: ChangeDetectorRef,
    private apmService: ApmService,
    private http: HttpClient
  ) { }

  transform(field: FormFieldInterface): FormFieldValueInterface[] {
    if (field?.values?.length) {
      return field.values;
    }

    if (field?.getValues !== this.actionData) {
      this.makeRequest(field);
    }

    return this.values;
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  private makeRequest(field: FormFieldInterface): void {
    this.actionData = field.getValues;
    const { method, url, payload = {} } = field.getValues;

    this.http.request(method, url, {
      body: payload,
    }).pipe(
      tap((values: FormFieldValueInterface[]) => {
        this.values = values;
        this.cdr.markForCheck();
      }),
      catchError((error) => {
        this.apmService.apm.captureError(
          `Cannot load data for ${url}, method ${method} / ERROR ms:\n ${JSON.stringify(error)}`,
        );

        return throwError(error)
      })
    ).subscribe();
  }

  private dispose(): void {
    this.values = [];
    this.actionData = null;
  }
}
