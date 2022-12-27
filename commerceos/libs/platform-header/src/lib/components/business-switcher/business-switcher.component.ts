import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Icons } from '../../root/icons';

@Component({
  selector: 'pe-business-switcher',
  templateUrl: './business-switcher.component.html',
  styleUrls: ['./business-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeBusinessSwitcherComponent {
  @Input() businessName: string;
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('switch-icon', sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${Icons['switch-icon']}`));
  }
}
