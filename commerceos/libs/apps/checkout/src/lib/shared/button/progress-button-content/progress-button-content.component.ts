import { Component, Input } from '@angular/core';

@Component({
  selector: 'pe-progress-button-content',
  templateUrl: './progress-button-content.component.html',
  styleUrls: ['./progress-button-content.component.scss'],
})
export class ProgressButtonContentComponent {

  @Input() loading = false;
  // @TODO when we will have more cases we can define these spinner parameters
  // according to mat-button variations
  @Input() spinnerStrokeWidth = 2;
  @Input() spinnerDiameter = 26;
  @Input() spinnerColor: string;
  @Input() spinnerLight: boolean;

}
