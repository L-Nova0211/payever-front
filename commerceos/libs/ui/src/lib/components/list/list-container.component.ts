import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PeListContainerComponent {

  @Input() public title: string;
  @Input() public hideTitleInMobile = false;
}
