import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pe-search-list',
  template: '<div class="pe-search-list"><ng-content></ng-content></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSearchListComponent { }
