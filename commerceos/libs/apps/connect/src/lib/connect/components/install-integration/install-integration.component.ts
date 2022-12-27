import { Location } from '@angular/common';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import Swiper from 'swiper';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  IntegrationsStateService, IntegrationInfoWithStatusInterface,
  PaymentsStateService, NavigationService,
} from '../../../shared';

@Component({
  selector: 'install-integration',
  templateUrl: './install-integration.component.html',
  styleUrls: ['./install-integration.component.scss'],
})
export class InstallIntegrationComponent implements OnInit, OnDestroy, AfterViewInit {

  swiper: Swiper;
  name: string = this.overlayData.integrationName;
  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;
  installed: boolean;
  integration: IntegrationInfoWithStatusInterface;

  error = '';
  isDone = false;
  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isInstallingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  isInstalling$: Observable<boolean> = this.isInstallingSubject.asObservable();
  protected destroyed$: Subject<boolean> = new Subject();

  constructor(
    private _location: Location,
    private activatedRoute: ActivatedRoute,
    private integrationsStateService: IntegrationsStateService,
    private paymentsStateService: PaymentsStateService,
    private navigationService: NavigationService,
    private translateService: TranslateService,
    private router: Router,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {}

  ngOnInit(): void {
    this.isLoadingSubject.next(true);
    this.integrationsStateService.getIntegration(this.name)
      .pipe(takeUntil(this.destroyed$), filter(d => !!d), finalize(() => this.onDataLoad.next(1)))
      .subscribe((integration) => {
      this.integration = integration;
      this.installed = integration._status ? integration._status.installed : false;
      this.isLoadingSubject.next(false);
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit(): void {
    if (!!this.integration && this.integration.installationOptions.links.length > 1) {
      setTimeout(() => {
        this.swiper = new Swiper('.swiper-container', {
          scrollbar: {
            el: '.swiper-scrollbar',
            hide: false,
          },
          slidesPerView: 1,
          spaceBetween: 22,
          breakpoints: {
            // when window width is <= 960px
            767: {
              slidesPerView: 1,
            },
          },
        });
      }, 300);
    }
  }

  handleClose(): void {
    this.navigationService.returnBack();
  }

  handleOpen(): void {
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([
      `business/${businessId}/connect/${this.integration.category}/configure/${this.integration.name}`]);
  }

  toggleInstalled(): void {
    this.error = null;
    if (!this.isInstallingSubject.getValue()) {
      this.isInstallingSubject.next(true);
      this.integrationsStateService.installIntegration(
      this.name, !this.installed).subscribe((integration) => {
      this.isDone = true;
      this.installed = integration.installed;
      this.isInstallingSubject.next(false);
    }, (error) => {
        console.error('Cant install/uninstall', error);
        this.error = this.translateService.translate(error.message || 'errors.unknown_error');
        this.isInstallingSubject.next(false);
      });
    }
  }
}
