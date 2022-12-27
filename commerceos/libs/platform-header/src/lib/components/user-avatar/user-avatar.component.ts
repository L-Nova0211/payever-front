import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'pe-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeUserAvatarComponent {
  @Input() avatar: string;
  @Input() name: string;
}
