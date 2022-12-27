import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { WidgetInfoInterface } from '../interfaces/interfaces';

@Injectable()
export class EditWidgetsApiService {
  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
  ) {}


  installWidget(businessId: string, widgetId: string): Observable<WidgetInfoInterface[]> {
    const url = `${this.env.backend.widgets}/api/business/${businessId}/widget/${widgetId}/install`;

    return this.http.patch<WidgetInfoInterface[]>(url, {});
  }

  uninstallWidget(businessId: string, widgetId: string): Observable<WidgetInfoInterface[]> {
    const url = `${this.env.backend.widgets}/api/business/${businessId}/widget/${widgetId}/uninstall`;

    return this.http.patch<WidgetInfoInterface[]>(url, {});
  }

  watchedTutorialWidget(businessId: string, widgetId: string): Observable<WidgetInfoInterface[]> {
    const url = `${this.env.backend.widgets}/api/business/${businessId}/widget-tutorial/${widgetId}/watched`;

    return this.http.patch<WidgetInfoInterface[]>(url, {});
  }
}
