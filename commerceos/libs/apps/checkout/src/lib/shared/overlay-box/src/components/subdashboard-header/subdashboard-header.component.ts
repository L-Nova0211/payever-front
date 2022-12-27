import { Component, Input, ElementRef, AfterContentInit } from '@angular/core';

import {
  SubdashboardHeaderButtonInterface,
  SubdashboardHeaderDropdownItemInterface,
} from '../../interfaces';

@Component({
  selector: 'pe-subdashboard-header',
  templateUrl: './subdashboard-header.component.html',
  styleUrls: ['./subdashboard-header.component.scss'],
})
export class SubdashboardHeaderComponent implements AfterContentInit {
  @Input() height: string | boolean = false;

  @Input() translationScope: string;
  @Input() title: string;
  @Input() withLogo = true;
  @Input() logoSrc: string;
  @Input() subtitleAction: SubdashboardHeaderButtonInterface;
  @Input() buttons: SubdashboardHeaderButtonInterface[];
  @Input() dropdownItems: SubdashboardHeaderDropdownItemInterface[];
  @Input() isLoading: boolean;

  constructor(
    private el: ElementRef,
  ) {}

  ngAfterContentInit(): void {
    this.checkParentElement();
  }

  menuOpened(): void {
    // set this padding here because Material creates menu element but it overlaps button.
    // to do it by css is impossible, because element with '.pe-subdashboard-backdrop' destroyed to quickly and
    // menu overlaps button for one moment again.
    (document.querySelector('.pe-subdashboard-backdrop + .cdk-overlay-connected-position-bounding-box') as HTMLElement)
      .style.paddingTop = `5px`;
  }

  private checkParentElement(): void {
    const parentElement: HTMLElement = (this.el.nativeElement as HTMLElement).parentElement;
    if (parentElement && parentElement.nodeName.toLowerCase() !== 'mat-accordion') {
      // tslint:disable-next-line no-console
      console.warn('SubdashboardHeaderComponent will have bad styles because parent element is not `mat-accordion`');
    }
  }
}
