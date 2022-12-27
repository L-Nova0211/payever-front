
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

export type AfterLoginActionType = () => void;

@Injectable()
export class RegistrationFormService {

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private http: HttpClient
  ) {
  }

  getUserBusiness(): Observable<any> {
    return this.http.get<any>(`${this.env.backend.users}/api/business`);
  }
}
