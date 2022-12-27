import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { LanguageInterface } from '../../shared/interfaces/editor.interface';
import { LanguageService } from '../services/language.service';

@Injectable()
export class LanguagesResolver implements Resolve<LanguageInterface[]> {

  constructor(
    private languageService: LanguageService
  ) {}

  resolve(): Observable<LanguageInterface[]> {
    return of(this.languageService.getLanguages());
  }
}
