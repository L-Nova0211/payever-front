import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-progress-button-content',
  templateUrl: './progress-button-content.component.html',
  styleUrls: ['./progress-button-content.component.scss'],
})
export class ProgressButtonContentComponent {

  @Input() loading = false;
  @Input() spinnerStrokeWidth = 2;
  @Input() spinnerDiameter = 26;
  @Input() spinnerColor: string;

}
