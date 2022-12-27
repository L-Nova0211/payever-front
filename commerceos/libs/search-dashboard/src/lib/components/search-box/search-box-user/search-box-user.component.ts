import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Subscription, of, Subject } from 'rxjs';
import { flatMap, delay } from 'rxjs/operators';

import { ApiService, TransactionInterface } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessState } from '@pe/business';

import { SearchBoxService } from '../../../services/search-box.service';
import { SearchBoxAbstractComponent } from '../search-box-abstract.component';

@Component({
  selector: 'search-box-user',
  templateUrl: './search-box-user.component.html',
  styleUrls: ['./search-box-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxUserComponent extends SearchBoxAbstractComponent implements OnInit {

  @SelectSnapshot(BusinessState.businessUuid) businessId:string;
  @Input() searchString: string;

  hasValue: boolean;
  emptySearch = true;
  isLoading$: Subject<boolean> = new Subject();
  private searchSubsribtion: Subscription;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected apiService: ApiService,
    protected authService: PeAuthService,
    protected router: Router,
    protected searchBoxService: SearchBoxService,
  ) {
    super(activatedRoute, router, searchBoxService);
  }

  ngOnInit(): void {
    this.searchBoxService.reset();
    this.loadBusinesses();

    if (this.searchString) {
      this.onSearch(this.searchString);
      this.emptySearch = false;
      this.hasValue = true;
    }
  }

  loadBusinesses(): void {
    // this.apiService.getBusinessesList().subscribe((businesses:{businesses:BusinessInterface[]; total:number}) => {
    //   this.searchBoxService.businesses = businesses.businesses;
    // });
  }

  onClickResult(item: any): void {
    this.router.navigate([item.url]);
  }

  _onSearch(value: string): void {
    this.onSearch(value.replace(/\s\s+/g, ' '));
  }

  protected onSearch(value: string): void {
    const businessUuid: string = this.businessId;
    if (this.searchSubsribtion) {
      this.searchSubsribtion.unsubscribe();
      this.searchSubsribtion = null;
    }

    if (!!value) {
      this.searchSubsribtion = of(null)
        .pipe(
          delay(500),
          flatMap(() => {
            this.isLoading$.next(true);
            this.emptySearch = false;

            return this.apiService.getSpotlightSearch(value, this.searchBoxService.MaxResults, businessUuid);
          }),
        )
        .subscribe((data: TransactionInterface[]) => {
          this.searchBoxService.filterBusinesses(value);
          this.searchBoxService.updateTransactionsGroup(businessUuid, data);
          this.searchBoxService.rebalanceGroups();
          this.groups = this.searchBoxService.getGroups();

          this.isLoading$.next(false);
          this.hasValue = !!this.groups.length;
        });
    } else {
      this.emptySearch = true;
      this.hasValue = false;
      this.searchBoxService.reset();
      this.groups = this.searchBoxService.getGroups();
      this.isLoading$.next(false);
    }
  }
}
