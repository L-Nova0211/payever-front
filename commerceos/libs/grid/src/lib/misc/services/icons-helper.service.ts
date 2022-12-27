import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { PeGridIcons } from '../interfaces/icons.interface';

@Injectable({
  providedIn: 'root',
})

export class IconsHelperService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {
  }

  registerIconsSet(url: string) {
    this.matIconRegistry.addSvgIconSet(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  registerIcons(icons: PeGridIcons[]): void {
    icons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(
        icon.name,
        this.sanitizer.bypassSecurityTrustResourceUrl(icon.path),
      );
    });
  }
}
