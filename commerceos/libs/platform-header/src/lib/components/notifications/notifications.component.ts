import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Icons } from '../../root/icons';

@Component({
  selector: 'pe-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeNotificationsComponent {
  @Input() hasItems: boolean = false;

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('notification-icon', sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${Icons['notification-icon']}`));
    iconRegistry.addSvgIcon('notification-circle-icon', sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${Icons['notification-circle-icon']}`));
  }
}
