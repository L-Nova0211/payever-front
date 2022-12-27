import { Component, Input } from '@angular/core';

@Component({
  selector: 'active-business',
  templateUrl: './active-business.component.html',
  styleUrls: ['./active-business.component.scss'],
})
export class ActiveBusinessComponent {

  @Input() logo: string;
  @Input() name: string;
  @Input() email: string;
  @Input() city: string;
  @Input() firstName: string;
  @Input() lastName: string;

  @Input() noMargin: boolean;
  @Input() size: number = 76;
}
