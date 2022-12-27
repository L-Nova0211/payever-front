import { Component, Input } from '@angular/core';

@Component({
  selector: 'pe-message-webcomponent',
  templateUrl: './app.component.html',
})
export class AppComponent {
  @Input() business: string;
  @Input() channels: string;
}
