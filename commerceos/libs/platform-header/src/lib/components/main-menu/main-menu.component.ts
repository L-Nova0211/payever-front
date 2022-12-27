import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Icons } from '../../root/icons';

@Component({
  selector: 'pe-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMainMenuComponent {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('menu-icon', sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${Icons['menu-icon']}`));
  }
}
