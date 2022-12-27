import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable()
export class DynamicFormServiceService {
  splitName(name: string): string[] {
    return name.split('.').filter(d => !!d);
  }
}
