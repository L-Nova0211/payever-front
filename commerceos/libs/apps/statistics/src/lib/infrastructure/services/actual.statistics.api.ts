import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

export const PE_STATISTICS_API_PATH = new InjectionToken<string>('PE_STATISTICS_API_PATH');

@Injectable({ providedIn: 'root' })
export class ActualPeStatisticsApi {
  constructor(
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    @Inject(PE_STATISTICS_API_PATH) private statisticsApiPath: string,
    private http: HttpClient,
    private envService: EnvService,
    private authTokenService: PeAuthService,
  ) {
  }

  getMetrics() {
    return this.http.get(`${this.statisticsApiPath}/api/metric`);
  }

  getDimensions() {
    return this.http.get(`${this.statisticsApiPath}/api/dimension`);
  }

  getDashboards() {
    return this.http.get(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  getDashboardsById(dashboardId: string) {
    return this.http
      .get(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}`, {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      });
  }

  editDashboardName(dashboardId: string, payload) {
    return this.http.put(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      },
    );
  }

  deleteDashboardName(dashboardId: string) {
    return this.http.delete(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}`,
      {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      },
    );
  }

  createSingleDashboard(data: any) {
    return this.http.post(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard`, data, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  removeDashboard(dashboardId: string) {
    return this.http.delete(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}`
    );
  }

  getWidgets(dashboardId: string) {
    return this.http.get(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget`,
      {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      },
    );
  }

  getFolders() {
    return this.http.get(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/folders`,
      {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      },
    );
  }

  createSingleFolder(data) {
    return this.http.post(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/folders`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      },
    );
  }

  getWidgetsById(dashboardId: string, widgetId: string) {
    return this.http
      .get(
        `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget/${widgetId}`,
        {
          headers: {
            Authorization: `Bearer ${this.authTokenService.token}`,
          },
        },
      );
  }

  getWidgetTypes(dashboardId: string) {
    return this.http.get(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget/available-types`,
      {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      },
    );
  }

  removeWidget(dashboardId: string, widgetId: string) {
    return this.http.delete(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget/${widgetId}`,
      {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      },
    );
  }

  createSingleWidget(dashboardId: string, data: any) {
    return this.http.post(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      },
    );
  }

  editSingleWidget(dashboardId: string, widgetId: string, data: any) {
    return this.http
      .put(
        `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget/${widgetId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.authTokenService.token}`,
          },
        },
      );
  }

  getWidgetStatistics(widgetId: string) {
    return this.http.get(`${this.statisticsApiPath}/${widgetId}/statistics`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }

  getWidgetData(widgetType: string = 'transactions') {
    return this.http
      .get(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/widgetData/${widgetType}`, {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      });
  }

  getWidgetTypeData() {
    return this.http
      .get(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/widgetData/widget-types`, {
        headers: {
          Authorization: `Bearer ${this.authTokenService.token}`,
        },
      });
  }

  getBusinesses() {
    return this.http.get(`${this.statisticsApiPath}/api/business`, {
      headers: {
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });
  }
}
