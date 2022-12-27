import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pe-profile-card-spinner',
  styleUrls: ['./profile-spinner.component.scss'],
  templateUrl: './profile-spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSpinnerComponent {
  spinnerDiameter = 26;
  spinnerStroke = 2;
}
