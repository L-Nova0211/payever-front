import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  filter,
  map,
  pairwise,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs/operators';

import { PartnerService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessInterface, BusinessState, LoadBusinesses, ResetBusinessState } from '@pe/business';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';
import { PeUser, UserState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';

import { PeProfileCardInterface, ProfileCardType } from '../interfaces/profile-card.interface';

@Component({
  selector: 'pe-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeSwitcherComponent implements OnInit, AfterViewInit, OnDestroy {
  @Select(UserState.user) user$: Observable<PeUser>;
  @Select(BusinessState.businesses) businesses$: Observable<{ businesses: BusinessInterface[]; total: number }>;
  @Select(BusinessState.loading) isloading$: Observable<boolean>;
  @ViewChild(CdkVirtualScrollViewport) scroller: CdkVirtualScrollViewport;

  profileCardType: typeof ProfileCardType = ProfileCardType;

  isLoading = false;
  isListLoading = false;
  reloadedBusinesses = false;
  showBusinessLoader$: Subject<boolean> = new Subject();
  showPersonalLoader = false;
  businessWithLoader: string;
  destroyed$: Subject<void> = new Subject();
  backgroundUrl = '';
  total = 0;
  currentLength = 0;
  maxBusinessPageSize = 500;

  businessesInfo$: Observable<{ businesses: BusinessInterface[]; total: number }>;
  searchStringSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  profileCardConfig$: Observable<PeProfileCardInterface>;

  constructor(
    private authService: PeAuthService,
    private mediaUrlPipe: MediaUrlPipe,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private wallpaperService: WallpaperService,
    private ref: ChangeDetectorRef,
    private store: Store,
    private zone: NgZone,
    private partnerService: PartnerService,
  ) {
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;

    this.wallpaperService.backgroundImage = this.wallpaperService.defaultBlurredBackgroundImage;

    this.isloading$
      .pipe(
        tap(data => (this.isListLoading = data)),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.businessesInfo$ = combineLatest([
      combineLatest([this.businesses$, this.searchStringSubject$]).pipe(
        filter(([data, searchStringData]) => !!data.businesses.length),
        map(([data, searchString]) => {
          this.total = Math.max(this.total, data.total);

          return {
            businesses: data.businesses.slice(1).filter((business: BusinessInterface) =>
              (!searchString || business.name.toLowerCase().includes(searchString.toLowerCase()))
              && business._id !== this.authService.refreshLoginData.activeBusiness._id),
            total: data.total,
          };
        }),
        filter(Boolean),
      ),
      this.user$.pipe(filter(Boolean)),
    ]).pipe(
      map(([businessInfo, userData]: [{ businesses: BusinessInterface[]; total: number }, PeUser]) => {
        if (userData.hasUnfinishedBusinessRegistration && !businessInfo.total) {
          this.router.navigate([`/registration`], queryParams);

          return null;
        }
        if (businessInfo.total === 1) {
          const business = JSON.parse(localStorage.getItem('pe_active_business'));

          if (invitationRedirectUrl) {
            this.router.navigate([invitationRedirectUrl, businessInfo?.businesses[0]._id]);
          } else {
            this.router.navigate([`business/${business._id}/info/overview`]);
          }

          return null;
        }
        if (businessInfo?.businesses?.length) {
          const businesses = businessInfo.businesses.map<BusinessInterface>((business: BusinessInterface) => {
            return {
              ...business,
              name: business.name,
              _id: business._id,
              logo: business.logo ? this.mediaUrlPipe.transform(business.logo, 'images') : null,
              uuid: business._id, // it is need for profile switcher
            };
          });

          return {
            businesses,
            total: businessInfo.total - 1,
          };
        }
      }),
      takeUntil(this.destroyed$),
      catchError((err) => {
        return this.router.navigate(['/login'], queryParams);
      }),
    ) as Observable<{ businesses: BusinessInterface[]; total: number }>;

    this.profileCardConfig$ = this.businessesInfo$.pipe(
      takeUntil(this.destroyed$),
      filter((businessInfo: any) => ((businessInfo && businessInfo.total) || this.reloadedBusinesses)),
      map((businessInfo) => {
        let activeBusiness: BusinessInterface = this.authService.refreshLoginData.activeBusiness;
        activeBusiness = activeBusiness ? activeBusiness : businessInfo.businesses[0];
        this.authService.refreshLoginData = { activeBusiness };

        // if business count == 1 we have to pass only one image in array
        const images: string[] =
          [activeBusiness.logo ? this.mediaUrlPipe.transform(activeBusiness.logo, 'images') : ''];

        return {
          ...activeBusiness,
          type: ProfileCardType.Business,
          cardTitle: this.translateService.translate('switcher.business_type').toLocaleUpperCase(),
          placeholderTitle: activeBusiness.name,
          cardButtonText:
            this.total > 1
              ? `${this.translateService.translate('switcher.all')} ${this.total}`
              : activeBusiness.name,
          images: images,
        };
      }),
    );
  }

  get isMobile(): boolean {
    return window.innerWidth <= 520;
  }

  ngAfterViewInit() {
    if (this.scroller) {
      this.scroller
      .elementScrolled()
      .pipe(
        map(() => this.scroller.measureScrollOffset('bottom')),
        pairwise(),
        filter(([y1, y2]) => y2 < y1 && y2 < 140),
        throttleTime(200),
      )
      .subscribe(() => {
        this.zone.run(() => {
          this.onLoadBusineses();
        });
      });
    }
  }

  ngOnInit(): void {
    let lastBg = this.wallpaperService.defaultBlurredBackgroundImage;

    if (!lastBg || !lastBg.length) {
      lastBg = localStorage.getItem('lastBusinessWallpaper');
    }

    this.backgroundUrl = `url(${lastBg})`;

    this.authService.getUserData();
    this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  onProfileCardClick(): void {
    this.profileCardConfig$.pipe(take(1), switchMap((activeBusiness) => {
      const re = /:businessId/g;
      this.partnerService.partnerAfterActions.next({ id: activeBusiness?._id, re });
      this.showBusinessLoader$.next(true);
      this.authService.refreshLoginData = {
        activeBusiness: activeBusiness,
      };

      const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
      if (invitationRedirectUrl) {
        this.router.navigate([invitationRedirectUrl, activeBusiness._id]);
      } else {
        this.router.navigate(['/business', activeBusiness._id]);
      }

      return of([]);
    })).subscribe();
  }

  openPersonalProfile(): void {
    this.showPersonalLoader = true;
    this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);
  }

  onProfileFromListClick(business: BusinessInterface): void {
    this.businessWithLoader = business._id;
    const re = /:businessId/g;
    this.partnerService.partnerAfterActions.next({ id: business._id, re });
    this.authService.refreshLoginData = {
      activeBusiness: business,
    };

    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    if (invitationRedirectUrl) {
      this.router.navigate([invitationRedirectUrl, business._id]);
    } else {
      this.router.navigate(['/business', business._id]);
    }
  }

  onLoadBusineses() {
    if (this.isListLoading) {return;}
    this.currentLength += 20;
    if (this.currentLength >= this.total) {return;}
    const currentPaage = Math.trunc(this.currentLength / 20);
    const nextPage = currentPaage + 1;
    this.store.dispatch(new LoadBusinesses('false', nextPage.toString(), '20'));
  }

  filterBusiness(event) {
    if (this.reloadedBusinesses === false) {
      this.store.dispatch(new ResetBusinessState());
      this.store.dispatch(new LoadBusinesses(
        'false',
        '1',
        Math.min(this.total, this.maxBusinessPageSize).toString()));
      this.reloadedBusinesses = true;
    }
    this.searchStringSubject$.next(event);
  }

}
