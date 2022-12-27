import { HttpClient } from '@angular/common/http';
import { Component, Inject, Injector, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessInterface } from '@pe/business';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { SearchBoxService } from '../../../services/search-box.service';
import { SearchGroupItems } from '../../search-results/search-items.interface';
import { SearchBoxAbstractComponent } from '../search-box-abstract.component';

@Component({
  selector: 'search-box-admin',
  templateUrl: './search-box-admin.component.html',
  styleUrls: ['./search-box-admin.component.scss'],
})
export class SearchBoxAdminComponent extends SearchBoxAbstractComponent implements OnInit {
  @Input() searchString: string;

  isByEmail: boolean;
  isLoading$: Subject<boolean> = new Subject();
  searchTerm$ = new Subject<string>();

  constructor(
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected apiService: ApiService,
    protected authService: PeAuthService,
    protected router: Router,
    protected searchBoxService: SearchBoxService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private httpClient: HttpClient,
  ) {
    super(activatedRoute, router, searchBoxService);
  }

  get search$(): Observable<BusinessInterface[]> {
    let query = '';

    return this.searchTerm$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value: string) => {
        query = value;

        return this.apiService.getUsersByFilters({ email: value, roles: ['merchant'] }, 8);
      }),
      switchMap(users =>
        this.getBusinessesAsAdmin(
          users.map(user => user.id),
          query,
        ),
      ),
    );
  }

  _onSearch(value: string): void {
    this.isLoading$.next(true);
    this.onSearch(value);
  }

  ngOnInit() {
    this.searchBoxService.reset();
    this.search$.subscribe((businesses) => {
      this.isLoading$.next(false);
      this.searchBoxService.reset();
      this.searchBoxService.businesses = businesses;
      this.groups = this.searchBoxService.getGroups();
    });

    if (this.searchString) {
      this.onSearch(this.searchString);
    }
  }

  getBusinessesAsAdmin(ids: number[], query: string): Observable<BusinessInterface[]> {
    return this.apiService.getBusinessesListWithParams(ids, query).pipe(map(res => res));
  }

  onClickResultAsAdmin(item: SearchGroupItems): void {
    const env = this.env.backend;
    const envMedia: string = this.env.custom.storage;
    const url = `${env.auth}/api/login-as-user`;

    if (item.email) {
      // email available only with admin params
      this.httpClient
        .post<void>(url, { email: item.email, id: item['userId'] })
        .subscribe((tokens: any) => {
          const params = {
            isByEmail: true, // this.isByEmail, should go directly to applications
            email: item.email,
            logo: item.imageIconSrc.replace(`${envMedia}/images/`, ''),
            name: item.title,
            city: item && item.city,
            firstName: item.firstName,
            lastName: item.lastName,
            id: item.id,
            ...tokens,
          };
          this.router.navigate(['login/as-user'], { queryParams: params });
        });
    } else {
      // TODO:
      //alert('Wrong email');
    }
  }

  isEmail(value: string): boolean {
    const regexp = /\S+@\S+\.\S+/;

    return regexp.test(value);
  }

  protected onSearch(value: string): void {
    this.hasValue = !!value;
    this.searchTerm$.next(value);
    this.isByEmail = this.isEmail(value);
  }
}
