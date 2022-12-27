import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  flatMap,
  map,
  startWith,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { ApiService, SpotlightResp } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessInterface, BusinessState } from '@pe/business';
import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  EnvService,
  PeDestroyService,
  PE_ENV,
  SearchGroup,
  SearchGroupItems,
  SpotlightSearch,
} from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';

import { SearchBoxService } from '../../services/search-box.service';
import { SearchOverlayService } from '../../services/search-overlay.service';
const MESSAGE_1 = {
  title: 'Type name of item you want to search',
  subtitle: 'Or see suggested apps',
};

const MESSAGE_2 = {
  title: 'There were no results for your search',
  subtitle: 'Try again or see suggested apps',
};

@Component({
  selector: 'pe-search-overlay',
  templateUrl: 'search-overlay.component.html',
  styleUrls: ['./search-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchOverlayComponent implements OnInit, AfterViewInit {
  @ViewChild('input') input: ElementRef;

  isAdmin: boolean;
  isAdmin$: Observable<boolean> = this.authService.onChange$.pipe(
    startWith(null),
    map(() => this.authService.isAdmin()),
  );

  isByEmail: boolean;

  searchString$ = new Subject<string>();

  hasValue: boolean;
  emptySearch = true;
  _searchText = '';
  get searchText () {
    return this._searchText;
  }

  set searchText(input: string) {
    this._searchText = input;
    this.searchString$.next(input);
  }

  groups: SpotlightSearch[] = [];
  adminGroups: SearchGroup[] = [];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  firstLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoading = false;
  @Select(DockerState.dockerItems) apps$: Observable<DockerItemInterface[]>;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  theme: AppThemeEnum;
  installedApps$: Observable<DockerItemInterface[]>;
  navigationStarted: boolean;
  spinerStrokeWidth = 2;
  spinerDiameter = 18;

  message: {
    title: string;
    subtitle: string;
  } = MESSAGE_1;

  constructor(
    private authService: PeAuthService,
    protected apiService: ApiService,
    protected searchBoxService: SearchBoxService,
    private searchOverlayService: SearchOverlayService,
    private httpClient: HttpClient,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private destroyed$: PeDestroyService,
    private envService: EnvService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    this.router.events.pipe(
      tap((event: RouterEvent) => {
        if (event instanceof NavigationEnd && this.navigationStarted) {
          this.close();
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnInit(): void {
    combineLatest([
      this.isLoading$,
      this.firstLoading$,
    ]).pipe(
      tap(([isLoading, firstLoading]: boolean[]) => {
        this.isLoading = isLoading && firstLoading;
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.searchString$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((searchString: string) => {
          if (!searchString) {
            this.message = MESSAGE_1;
            this.emptySearch = true;
            this.hasValue = false;
            this.groups = [];
            this.adminGroups = [];
            this.isLoading$.next(false);

            return false;
          }

          return true;
        }),
        tap((searchString: string) => {
          this.emptySearch = false;
          this.isLoading$.next(true);
        }),
        flatMap((searchString: string) => {          
          if (this.isAdmin) {
            this.hasValue = !!searchString;
            this.isByEmail = this.isEmail(searchString);

            return this.apiService.getAdminSpotlightSearch(searchString);
          }
          const businessUuid: string = this.businessData._id;

          return this.apiService.getSpotlightSearch(searchString, this.searchBoxService.MaxResults, businessUuid);
        }),
        map((resp: SpotlightResp) => {
          if (this.isLoading$.value) {
            this.groups = this.searchBoxService.getGroups(
              resp.result,
              this.isAdmin ? this.envService.businessId : null,
            );
            if (!this.groups.length) {
              this.message = MESSAGE_2;
            }
            this.isLoading$.next(false);
            this.hasValue = !!this.groups.length;
          } else {
            this.groups = [];
          }
          if (this.firstLoading$.value && !!this.groups.length) {
            this.firstLoading$.next(false);
          }
          if (!this.groups.length && !this.firstLoading$.value) {
            this.firstLoading$.next(true);
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.searchText = this.searchOverlayService.searchText;
    this.installedApps$ = combineLatest([
      this.apps$,
      this.isAdmin$.pipe(
        take(1),
        tap((value: boolean) => {
          this.isAdmin = value;
        }),
      ),
    ]).pipe(
      map(
        ([apps, isAdmin]: any[]) => {
          return apps.filter((app: DockerItemInterface) => isAdmin || app.installed)
            .sort((app1: DockerItemInterface, app2: DockerItemInterface) => {
              return app1.title > app2.title ? 1 : -1;
            });
        },
      ),
    );
    this.theme = (this.businessData?.themeSettings?.theme) 
      ? AppThemeEnum[this.businessData?.themeSettings?.theme] 
      : AppThemeEnum.default;
    this.changeDetectorRef.detectChanges();
  }

  getBusinessesAsAdmin(ids: number[], query: string): Observable<BusinessInterface[]> {
    return this.apiService.getBusinessesListWithParams(ids, query).pipe(map(res => res));
  }

  isEmail(value: string): boolean {
    const regexp = /\S+@\S+\.\S+/;

    return regexp.test(value);
  }

  ngAfterViewInit() {
    this.input.nativeElement.focus();
  }

  close() {
    this.searchOverlayService.close()
  }

  openApp(app) {
    this.router.navigate(['business', this.businessData._id, app.code]).then(() => this.close())
  }

  async onClickResult(item: SearchGroupItems): Promise<void> {
    if (item?.url) {
      this.navigationStarted = true;
      (item as any).navigating = true;
      this.changeDetectorRef.detectChanges();
       await this.router.navigate(item.url);
    } else {
      console.error('Cant find URL in search item!', item);
    }
  }

  onClickResultAsAdmin(item: SearchGroupItems): void {
    if (!this.isAdmin) {
      this.onClickResult(item);
    }
    const envMedia: string = this.env.custom.storage;
    const url = `${this.env.backend.auth}/api/login-as-user`;

    if (item.email) { // email available only with admin params
      this.httpClient.post<void>(url, { email: item.email, id: item['userId'] }).subscribe((tokens: any) => {
        const params = {
          isByEmail: true, // this.isByEmail, should go directly to applications
          email: item.email,
          logo: item.imageIconSrc?.replace(`${envMedia}/images/`, ''),
          name: item.title,
          city: item && item.city,
          firstName: item.firstName,
          lastName: item.lastName,
          id: item._id,
          ...tokens,
        };
        this.router.navigate(['login/as-user'], { queryParams: params }).then(() => {
          this.searchOverlayService.close();
        });
      });
    } else {
      alert('Wrong email');
    }
  }
}