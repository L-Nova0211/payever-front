/**
 * Inner component of integration-full-page, displays the app name, icon, price and author
 */


import { Component, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { get } from 'lodash-es';

import { IntegrationInfoWithStatusInterface } from '../../../shared';

@Component({
  selector: 'connect-integration-title',
  templateUrl: './integration-title.component.html',
  styleUrls: ['./integration-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationTitleComponent implements OnChanges {

  @Input() integration: IntegrationInfoWithStatusInterface;
  displayRating = true;

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * If current integration is installed
   */
  get installed(): boolean {
    return get(this.integration, '_status.installed');
  }

  /**
   * Reset rating component
   */
  ngOnChanges() {
    this.displayRating = false;
    this.cdr.detectChanges();
    this.displayRating = true;
    this.cdr.detectChanges();
  }
}
