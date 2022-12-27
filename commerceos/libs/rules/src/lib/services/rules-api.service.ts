import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService } from '@pe/common';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { RuleValues } from '@pe/rules';

@Injectable()
export class PeRulesApiService {
  constructor(
    private httpClient: HttpClient,

    private envService: EnvService,
    @Inject(PE_FOLDERS_API_PATH) private peFoldersApiPath: string,
  ) { }

  private get rulesPath(): string {
    return `${this.peFoldersApiPath}/rules`;
  }

  private get businessRules(): string {
    return `${this.rulesPath}/business/${this.envService.businessId}`;
  }

  public getRulesValues(): Observable<RuleValues> {
    return this.httpClient.get<RuleValues>(`${this.rulesPath}/values`);
  }

  public getRules(): Observable<any> {
    return this.httpClient.get(this.businessRules);
  }

  public createRule(rule): Observable<any> {
    return this.httpClient.post(this.businessRules, rule);
  }

  public updateRule(rule, ruleId: string): Observable<any> {
    return this.httpClient.patch(`${this.businessRules}/rule/${ruleId}`, rule);
  }

  public deleteRule(ruleId: string): Observable<any> {
    return this.httpClient.delete(`${this.businessRules}/rule/${ruleId}`);
  }

  public getRuleDetails(ruleId: string): Observable<any> {
    return this.httpClient.get(`${this.businessRules}/rule/${ruleId}`);
  }
}
