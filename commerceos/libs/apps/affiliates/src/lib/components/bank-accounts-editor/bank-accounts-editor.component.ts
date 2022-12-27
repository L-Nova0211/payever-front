import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, OverlayHeaderConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';
import { SnackbarService } from '@pe/snackbar';
import { PeListSectionButtonTypesEnum, PeListSectionIntegrationInterface } from '@pe/ui';

import { PeAffiliatesApiService, PeAffiliatesGridService } from '../../services';

@Component({
  selector: 'pe-bank-accounts-editor',
  templateUrl: './bank-accounts-editor.component.html',
  styleUrls: ['../form-preloader.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeAffiliatesBankAccountsEditorComponent implements OnInit {
  
  private accounts: any[] = [];
  
  private readonly backBtn = this.translateService.translate('affiliates-app.actions.back');
  private readonly cancelBtn = this.translateService.translate('affiliates-app.actions.cancel');
  private readonly deleteBtn = this.translateService.translate('affiliates-app.actions.delete');
  private readonly doneBtn = this.translateService.translate('affiliates-app.actions.done');
  private readonly loadingBtn = this.translateService.translate('affiliates-app.actions.loading');
  private readonly saveBtn = this.translateService.translate('affiliates-app.actions.save');

  public accountsList: PeListSectionIntegrationInterface[] = [];
  public edit = false;
  public loading = false;

  public readonly cities = [
    { label: 'gamburg', value: 'ham' },
    { label: 'krasnoyarsk', value: 'kja' },
  ];
  
  public readonly countries = this.getCountries();
  public accountForm: FormGroup = this.formBuilder.group({
    _id: [],
    accountHolder: [],
    accountNumber: [],
    bankName: [],
    city: [],
    country: [],
  });
  
  public readonly actionButtonType = PeListSectionButtonTypesEnum.Arrow;
  public readonly theme = this.peOverlayConfig.theme;

  private readonly refreshAccounts$ = new BehaviorSubject<boolean>(true);
  public readonly getListOfAccounts$ = this.refreshAccounts$
    .pipe(
      tap((refresh) => {
        if (refresh) {
          this.loading = true;
          this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
          this.peOverlayConfig.isLoading = true;
          this.cdr.detectChanges();
        }
      }),
      switchMap((refresh) => {
        return refresh
          ? this.peAffiliatesApiService.getBankAccounts()
          : of(null);
      }),
      map((accounts) => {
        this.accounts = accounts ?? this.accounts;
        this.accountForm.reset();
        const closeEditor = () => {
          this.peOverlayWidgetService.close();
        };
        this.peAffiliatesGridService.backdropClick = closeEditor;
        this.peOverlayConfig.backBtnCallback = closeEditor;
        this.peOverlayConfig.backBtnTitle = this.cancelBtn;
        this.peOverlayConfig.doneBtnCallback = closeEditor;
        this.peOverlayConfig.doneBtnTitle = this.doneBtn;
        this.peOverlayConfig.isLoading = false;
        this.peOverlayConfig.title = this.translateService.translate('affiliates-app.bank_account_editor.title.list');
        this.cdr.markForCheck();

        return this.accounts.map((account): PeListSectionIntegrationInterface => {
          return {
            _id: account._id,
            icon: 'business',
            title: account.accountHolder,
          };
        });
      }),
      tap((accounts) => {
        this.accountsList = accounts;
        this.edit = false;
        this.loading = false;
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,

    private localeConstantsService: LocaleConstantsService,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peAffiliatesApiService: PeAffiliatesApiService,
    private peAffiliatesGridService: PeAffiliatesGridService,
  ) {
    this.peOverlayConfig.title = this.translateService.translate('affiliates-app.bank_account_editor.title.list');
    this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
    this.peOverlayConfig.isLoading = true;
  }

  ngOnInit(): void {
    this.getListOfAccounts$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  public editAccount(accountData: PeListSectionIntegrationInterface): void {
    if (accountData) {
      const existingAccount = this.accounts.find(account => accountData._id === account._id);
      this.accountForm.patchValue(existingAccount);
    } else {
      const controls = this.accountForm.controls;
      controls.accountHolder.clearValidators();
      controls.accountNumber.clearValidators();
      controls.bankName.clearValidators();
      controls.city.patchValue(this.cities[0].value);
      controls.country.patchValue(this.countries[0].value);
    }
    this.edit = true;

    setTimeout(() => {
      this.accountForm.markAsPristine();
    }, 100);

    const backToAccountsList = () => {
      if (this.accountForm.dirty) {
        this.peAffiliatesGridService.confirmation$
          .pipe(
            take(1),
            filter(Boolean),
            tap(() => {
              this.refreshAccounts$.next(false);
            }),
            takeUntil(this.destroy$))
          .subscribe();
  
        const headingTitle = accountData
          ? 'affiliates-app.confirm_dialog.cancel.bank_account_editor.editing.title'
          : 'affiliates-app.confirm_dialog.cancel.bank_account_editor.creating.title';
        const headingSubtitle = accountData
          ? 'affiliates-app.confirm_dialog.cancel.bank_account_editor.editing.subtitle'
          : 'affiliates-app.confirm_dialog.cancel.bank_account_editor.creating.subtitle';
        const config: Headings = {
          title: this.translateService.translate(headingTitle),
          subtitle: this.translateService.translate(headingSubtitle),
          confirmBtnText: this.backBtn,
          declineBtnText: this.cancelBtn,
        };
        this.peAffiliatesGridService.openConfirmDialog(config);
      } else {
        this.refreshAccounts$.next(false);
      }
    };

    const formConfig = this.peOverlayConfig;
    const formTitle = accountData
      ? 'affiliates-app.bank_account_editor.title.edit'
      : 'affiliates-app.bank_account_editor.title.create';
    formConfig.backBtnCallback = backToAccountsList;
    formConfig.backBtnTitle = this.backBtn;
    formConfig.doneBtnCallback = () => {
      !this.loading && this.save();
    };
    formConfig.doneBtnTitle = this.saveBtn;
    formConfig.title = this.translateService.translate(formTitle);
    this.peAffiliatesGridService.backdropClick = backToAccountsList;
  }

  public removeAccount(accountId: string): void {
    this.peAffiliatesGridService.confirmation$
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => {
          this.loading = true;
          this.cdr.detectChanges();

          return this.peAffiliatesApiService
            .deleteBankAccount(accountId);
        }),
        tap(() => {
          const intro = this.translateService.translate('affiliates-app.notify.account_of');
          const condition = this.translateService.translate('affiliates-app.notify.successfuly_deleted');
          const notify = `${intro} "${this.accountForm.controls.accountHolder.value}" ${condition}`;
          this.showSnackbar(notify);
          this.refreshAccounts$.next(true);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    const headingTitle = 'affiliates-app.confirm_dialog.delete.account.title';
    const headingSubtitle = 'affiliates-app.confirm_dialog.delete.account.subtitle';
    const config: Headings = {
      title: this.translateService.translate(headingTitle),
      subtitle: this.translateService.translate(headingSubtitle),
      confirmBtnText: this.deleteBtn,
      declineBtnText: this.cancelBtn,
    };
    this.peAffiliatesGridService.openConfirmDialog(config);
  }

  private save(): void {
    const controls = this.accountForm.controls;
    controls.accountHolder.setValidators([Validators.required]);
    controls.bankName.setValidators([Validators.required]);
    controls.accountNumber.setValidators([Validators.required, PeCustomValidators.PositiveInteger(0)]);
    controls.accountHolder.updateValueAndValidity();
    controls.bankName.updateValueAndValidity();
    controls.accountNumber.updateValueAndValidity();
    const { dirty, invalid, valid } = this.accountForm;

    if (dirty && valid) {
      const account = this.accountForm.value;
      of(account._id)
        .pipe(
          switchMap((accountId) => {
            delete account._id;
            this.loading = true;
            this.peOverlayConfig.isLoading = true;
            this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
            this.cdr.markForCheck();

            return accountId
              ? this.peAffiliatesApiService.updateBankAccount(accountId, account)
              : this.peAffiliatesApiService.createBankAccount(account);
          }),
          tap(({ accountHolder, createdAt, updatedAt }) => {
            const intro = this.translateService.translate('affiliates-app.notify.account_of');
            const condition = this.translateService.translate(
              createdAt === updatedAt
                ? 'affiliates-app.notify.successfuly_created'
                : 'affiliates-app.notify.successfuly_updated',
            );
            const notify = `${intro} "${accountHolder}" ${condition}`;
            this.showSnackbar(notify);
            this.refreshAccounts$.next(true);
          }),
          catchError((error) => {
            this.loading = false;
            this.peOverlayConfig.isLoading = false;
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.cdr.markForCheck();

            return of(error);
          }))
        .subscribe();
    } else if (dirty || invalid) {
      this.cdr.detectChanges();
    } else {
      this.refreshAccounts$.next(false);
    }
  }

  public getCountries(): { label: string; value: string }[] {
    const countryList = this.localeConstantsService.getCountryList();

    return Object.keys(countryList).map((countryKey) => {
      return {
        value: countryKey,
        label: Array.isArray(countryList[countryKey])
          ? countryList[countryKey][0]
          : countryList[countryKey],
      };
    });
  }

  private showSnackbar(notify: string): void {
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 2500,
      iconColor: '#00B640',
      iconId: 'icon-commerceos-success',
      iconSize: 24,
    });
  }
}
