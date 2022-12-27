import { Component, ViewEncapsulation } from '@angular/core';

/**
 *  Sole purpose of this component is to make sure that material styles
 *  are defined in general scope.
 *
 *  In would be better to get rid of this if/when commerceOS reliably will
 *  include material styles in it's entry point.
 */
@Component({
  selector: 'pe-statistics-material-styles',
  template: '',
  styleUrls: ['./material.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PeStatisticsMaterialComponent {}
