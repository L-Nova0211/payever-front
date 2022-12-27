
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
export type AfterLoginActionType = () => void;

@Injectable()
export class LoginFormService {

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private http: HttpClient
  ) {
  }

  private afterLoginActions: AfterLoginActionType[] = [];

  public addAfterLoginActions(afterLoginAction: AfterLoginActionType): void {
    this.afterLoginActions.push(afterLoginAction);
  }

  public executeAfterLoginActions(): void {
    // setTimeout - wait for cookies will be installed
    this.afterLoginActions.forEach((action: AfterLoginActionType) => setTimeout(action));
    this.afterLoginActions = [];
  }

  getUserBusiness(): Observable<any> {
    return this.http.get<any>(`${this.env.backend.users}/api/business`);
  }
}
