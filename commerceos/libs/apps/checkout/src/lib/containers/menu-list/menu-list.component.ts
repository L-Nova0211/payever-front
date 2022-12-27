import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MenuListComponent {

  @Output() clickedButton = new EventEmitter();
  @Output() changedToggle = new EventEmitter();
  @Input() menuList;
  @Input() titleHeader: string;
  @Input() titleForEmptyField: string;

}
