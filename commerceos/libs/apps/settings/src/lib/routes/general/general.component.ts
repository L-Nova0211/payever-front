import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { merge, Observable, throwError } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { getLangList, TranslateService, TranslationLoaderService } from '@pe/i18n-core';
import { UserAccountInterface } from '@pe/shared/user';
import { SnackbarService } from '@pe/snackbar';
import { LoadUser, UserState } from '@pe/user';

import { AbstractComponent } from '../../components/abstract';
import { EditLanguageComponent } from '../../components/edit-language/edit-language.component';
import { EditOwnerComponent } from '../../components/edit-owner/edit-owner.component';
import { EditPasswordComponent } from '../../components/edit-password/edit-password.component';
import { EditPersonalInfoComponent } from '../../components/edit-personal-info/edit-personal-info.component';
import { EditShippingComponent } from '../../components/edit-shipping/edit-shipping.component';
import { EditStyleComponent } from '../../components/edit-style/edit-style.component';
import { openLanguageEdit, openPersonalEdit } from '../../misc/constants';
import { BusinessInterface } from '../../misc/interfaces';
import { ApiService, BusinessEnvService, PlatformService } from '../../services';
import { InfoBoxService } from '../../services/info-box.service';

@Component({
  selector: 'peb-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralComponent extends AbstractComponent implements OnInit {
  @Select(UserState.user) user$: Observable<UserAccountInterface>;

  personalInformation: UserAccountInterface;

  tfa: boolean;
  business: BusinessInterface;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  generalsList = [{
    logo: '#icon-settings-general-language',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.language.title'),
    action: () => this.router.navigate(['language'], { relativeTo: this.activatedRoute }),
  }, {
    logo: '#icon-settings-general-styles',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.color_and_style.title'),
    action: (e, detail) => {
      this.infoBoxService.openModal(
        this.infoBoxService.getObjectForModal(
          detail,
          EditStyleComponent,
          { themeSettings: this.business?.themeSettings },
        ), this.theme, this.onColorAndStyleChange,
      );
    },
  }, {
    logo: '#icon-settings-general-personal',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.personal_information.title'),
    action: () => this.router.navigate(['personal'], { relativeTo: this.activatedRoute }),
  }, {
    logo: '#icon-settings-general-shipping',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.shipping_address.title'),
    action: (e, detail) => {
      this.infoBoxService.openModal(
        this.infoBoxService.getObjectForModal(
          detail,
          EditShippingComponent,
          {
            user: this.personalInformation,
          },
        ), this.theme, this.onShippingInfoChange,
      );
    },
  }, {
    logo: '#icon-settings-general-password',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.password.title'),
    action: (e, detail) => {
      this.apiService.getTwoFactorSettings().pipe(takeUntil(this.destroyed$))
        .subscribe((tfa) => {
          this.tfa = tfa;
          this.infoBoxService.openModal(
            this.infoBoxService.getObjectForModal(
              detail,
              EditPasswordComponent,
              { tfa },
            ), this.theme, this.onPasswordChange,
          );
        });
    },
  }, ...(this.isShowTransferOwnership ? [{
    logo: '#icon-settings-wallpaper',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.ownership.title'),
    action: (e, detail) => {
      this.infoBoxService.openModal(
        this.infoBoxService.getObjectForModal(
          detail,
          EditOwnerComponent,
          {},
        ), this.theme, this.onChangeOwner,
      );
    },
  }] : []),
  ];

  get isShowTransferOwnership() {
    return !this.cosEnvService.isPersonalMode;
  }

  constructor(
    private translateService: TranslateService,
    private infoBoxService: InfoBoxService,
    private apiService: ApiService,
    @Inject(EnvService) private envService: BusinessEnvService,
    private cosEnvService: CosEnvService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private platformService: PlatformService,
    private translationLoaderService: TranslationLoaderService,
    private messageBus: MessageBus,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.infoBoxService.theme = this.theme;
    this.business = this.envService.businessData;

    const routeParams$ = this.activatedRoute.params.pipe(
      tap((res) => {
        switch (res.modal) {
          case openPersonalEdit: {
            this.apiService.getUserAccount().pipe(takeUntil(this.destroyed$))
              .subscribe((result) => {
                this.infoBoxService.openModal(
                  this.infoBoxService.getObjectForModal(
                    { name:
                      this.translateService.translate('info_boxes.panels.general.menu_list.personal_information.title'),
                    },
                    EditPersonalInfoComponent,
                    {
                      user: result,
                    },
                  ),
                  this.theme,
                  this.onPersonalInfoChange,
                  () => this.router.navigate(['..'], { relativeTo: this.activatedRoute }),
                );
              });
            break;
          }
          case openLanguageEdit: {
            this.apiService.getUserAccount().pipe(takeUntil(this.destroyed$))
              .subscribe((result) => {
                this.infoBoxService.openModal(
                  this.infoBoxService.getObjectForModal(
                    { name: this.translateService.translate('info_boxes.panels.general.menu_list.language.title') },
                    EditLanguageComponent,
                    {
                      languages: this.getLanguages(),
                      language: result.language,
                    },
                  ),
                  this.theme,
                  this.onLanguageChange,
                  () => this.router.navigate(['..'], { relativeTo: this.activatedRoute }),
                );
              });
            break;
          }
        }
      }),
    );

    merge(
      this.user$.pipe(tap(user => this.personalInformation = user)),
      routeParams$,
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  getUserData() {
    this.store.dispatch(new LoadUser());
  }

  private getLanguages(): any {
    const languages = getLangList();

    return Object.keys(languages).map((language) => {
      return {
        value: language,
        label: languages[language].name,
      };
    });
  }

  onLanguageChange = (language) => {
    const newData = {
      language,
    };
    this.apiService.updateUserAccount(newData).pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        if (this.business?._id) {
          this.apiService.updateBusinessData(this.business._id, { defaultLanguage: newData.language })
            .pipe(takeUntil(this.destroyed$))
            .subscribe();
        }
        const businessId = this.envService.businessId || this.envService.businessData._id;

        return this.translationLoaderService.reloadTranslations(newData.language).subscribe(() => {
          const redirectUrl =
          [`business/${businessId}/settings/general`];
          const shouldReuseRoute = this.router.routeReuseStrategy.shouldReuseRoute;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate(redirectUrl).then((res) => {
            this.router.routeReuseStrategy.shouldReuseRoute = shouldReuseRoute;
            this.router.onSameUrlNavigation = 'ignore';
          });
          this.infoBoxService.closeSettings(this.infoBoxService.isCloseSettings);
        }, (error) => {
        });
      }, () => {
      });
  }

  onColorAndStyleChange = (data) => {
    const newData: any = {
      _id: data.style.id,
      primaryColor: data.style.primaryColor,
      secondaryColor: data.style.secondaryColor,
    };

    this.apiService.updateBusinessData(
      this.envService.businessUuid,
      { themeSettings: newData }
    ).pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
     this.business = res;
      });
  }

  onPasswordChange = (data) => {
    if (data.tfa !== this.tfa) {
      this.apiService.setTwoFactorSettings(data.tfa).pipe(takeUntil(this.destroyed$))
        .subscribe((res: any) => {
        this.tfa = res.secondFactorRequired;
        });
    }
  }

  onPersonalInfoChange = () => {
      this.getUserData();
      this.infoBoxService.closeSettings(this.infoBoxService.isCloseSettings);
  }

  onShippingInfoChange = (data) => {
    this.apiService.updateUserAccount({ shippingAddresses: data.data }).pipe(
      tap(() => this.getUserData()),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onChangeOwner = (data) => {
    this.apiService.sendOwnershipInvite(this.business._id, data).pipe(
      tap(() => {
        this.snackbarService.toggle(true, {
          content: this.translateService.translate('info_boxes.panels.general.menu_list.ownership.success'),
          duration: 2500,
          iconId: 'icon-commerceos-success',
          iconSize: 24,
        });
      }),
      catchError((error) => {
        this.snackbarService.toggle(true, {
          content: error.error.errors,
          duration: 2500,
          iconId: 'icon-alert-24',
          iconSize: 24,
        });

        return throwError(error);
      }),
      takeUntil(this.destroyed$),
      ).subscribe();
  }
}
