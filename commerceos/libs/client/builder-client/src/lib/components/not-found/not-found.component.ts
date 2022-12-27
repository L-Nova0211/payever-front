import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'peb-client-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebClientNotFoundComponent {

  @Input() subject = 'Page';
  @Input() showBack = true;

  constructor(
    private location: Location,
  ) { }

  goBack(): void {
    this.location.back();
  }

}
