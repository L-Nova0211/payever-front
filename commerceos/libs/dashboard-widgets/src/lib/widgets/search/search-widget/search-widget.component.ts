import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { SearchOverlayComponent, SearchOverlayService } from '@pe/search-dashboard';

@Component({
  selector: 'search-widget',
  templateUrl: './search-widget.component.html',
  styleUrls: ['./search-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchWidgetComponent {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  theme = 'default';

  searchText: string;
  showSearchSpinner = false;

  constructor(private searchOverlay: SearchOverlayService) {
    this.theme = this.businessData?.themeSettings?.theme || 'dark';
  }

  clearSearch() {
    this.searchText = '';
  }

  goToSearch() {
    if (this.searchText) {
      this.showSearchSpinner = true;
      this.searchOverlay.open(SearchOverlayComponent, this.searchText);
    }
  }
}
