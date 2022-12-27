import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';

import { MailScheduleData } from '../modules/editor';

export const PE_MARKETING_API_PATH = new InjectionToken<string>('PE_MARKETING_API_PATH');

@Injectable()
export class PeMarketingApiService {

  private businessId = this.envService.businessId;

  constructor(
    private http: HttpClient,
    private envService: PebEnvService,
    @Inject(PE_MARKETING_API_PATH) private peMarketingApiPath: string,
  ) { }

  getMail(): Observable<any> {
    return this.http.get(`${this.peMarketingApiPath}/api/business/${this.envService.businessId}/mail`);
  }

  createMail(name: string): Observable<any> {
    return this.http.post(`${this.peMarketingApiPath}/api/business/${this.envService.businessId}/mail`, { name });
  }

  postMailSchedule(input: { data: MailScheduleData, operationName: string }): Observable<any> {

    const payload = {
      query: `mutation createCampaign(
        $businessId: String!,
        $data: CreateCampaignInput!,
      ) {
        createCampaign(
          businessId: $businessId,
          data: $data,
        ) {
          id
          themeId
          business
          name
          from
          categories {
            id
            name
            description
          }
          schedules {
            id
            date
            type
            interval {
              number
              type
            }
            recurring {
              target
              fulfill
            }
          }
          createdAt
          updatedAt
        }
      }`,
      variables: {
        businessId: this.businessId,
        data: input.data,
      },
      operationName: input.operationName,
    };

    return this.http.post<any>(`${this.peMarketingApiPath}/graphql`, payload);
  }
}
