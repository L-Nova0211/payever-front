import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class RegistrationService {
  justRegistered = false;
  registrationStep$ = new BehaviorSubject<number>(1);

  loadIndustryIcon(industry, entryLogo) {
    const icon = `#icon-industries-${industry}`;
    if (industry) {
      (window as any).PayeverStatic.IconLoader.loadIcons(['industries']);
    }

    return industry ? { icon, height: 30 } : entryLogo;
  }
}
