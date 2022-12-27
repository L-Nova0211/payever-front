import { ChangeDetectionStrategy, Component } from '@angular/core';


@Component({
  selector: 'pe-message-loader',
  templateUrl: './message-loader.component.html',
  styleUrls: ['./message-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageLoaderComponent {}
