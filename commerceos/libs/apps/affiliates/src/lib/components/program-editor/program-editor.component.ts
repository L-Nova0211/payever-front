import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import moment from 'moment';
import { BehaviorSubject, forkJoin, merge, Observable, of, OperatorFunction, Subject, timer } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { IdToDataMapper, PeDestroyService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';

import {
  PeAffiliatesProgramAppliesToEnum,
  PeAffiliatesProgramArrayNamesEnum,
  PeAffiliatesProgramCommissionTypesEnum,
  PeAffiliatesProgramStatusesEnum,
} from '../../enums';
import { PeAffiliatesProgramInterface } from '../../interfaces';
import { PeAffiliatesApiService, PeAffiliatesGridService } from '../../services';
import { PeDatepickerComponent } from '../datepicker';

@Component({
  selector: 'pe-affiliates-program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['../form-preloader.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeAffiliatesProgramEditorComponent implements OnInit {
  
  private readonly cancelBtn = this.translateService.translate('affiliates-app.actions.cancel');
  private readonly closeBtn = this.translateService.translate('affiliates-app.actions.close');
  private readonly loadingBtn = this.translateService.translate('affiliates-app.actions.loading');
  private readonly saveBtn = this.translateService.translate('affiliates-app.actions.save');

  public loading = false;
  public dateMask = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
  public readonly arrayNames = PeAffiliatesProgramArrayNamesEnum;
  public readonly programAppliesTo = PeAffiliatesProgramAppliesToEnum;

  public readonly appliesTo = [
    { label: 'all_products', value: PeAffiliatesProgramAppliesToEnum.AllProducts },
    { label: 'specific_products', value: PeAffiliatesProgramAppliesToEnum.SpecificProducts },
    { label: 'specific_categories', value: PeAffiliatesProgramAppliesToEnum.SpecificCategories },
  ];
  
  public readonly commissionTypes = [
    { label: 'amount', value: PeAffiliatesProgramCommissionTypesEnum.Amount },
    { label: 'percentage', value: PeAffiliatesProgramCommissionTypesEnum.Percentage },
  ];

  public readonly currencies = [
    { label: 'EUR - €', value: 'eur' },
    { label: 'GBP - £', value: 'gbp' },
    { label: 'USD - $', value: 'usd' },
  ];

  public readonly theme = this.peOverlayConfig.theme;

  public programForm: FormGroup = this.formBuilder.group({
    _id: [],
    appliesTo: [PeAffiliatesProgramAppliesToEnum.AllProducts],
    assets: [],
    categories: [[]],
    commission: [],
    commissionType: [PeAffiliatesProgramCommissionTypesEnum.Percentage],
    cookie: [],
    currency: ['usd'],
    defaultCommission: [],
    inviteLink: [],
    levels: this.formBuilder.array([]),
    name: [],
    products: [[]],
    programApi: [],
    startedAt: [],
    status: [PeAffiliatesProgramStatusesEnum.Active],
    url: [],
  });
  
  private readonly changeArraysLengthListener$ = new BehaviorSubject<void>(null);
  private readonly initChangeCommissionTypesListener$ = new Subject<void>();
  private readonly changeCommissionTypesListener$ = this.initChangeCommissionTypesListener$
    .pipe(
      switchMap(() => this.changeArraysLengthListener$),
      switchMap(() => {
        const levelsCommissionsTypes = this.levels.controls
          .map((level: FormGroup) => level.controls.commissionType.valueChanges);
        const totalCommissionType = this.programForm.controls.commissionType.valueChanges;

        return merge(
          ...levelsCommissionsTypes,
          totalCommissionType,
          of(null),
        );
      }),
      tap(() => {
        const getMaxValue = (commissionType: PeAffiliatesProgramCommissionTypesEnum): number => {
          return commissionType === PeAffiliatesProgramCommissionTypesEnum.Percentage
            ? 100
            : null;
        };

        const { controls } = this.programForm;
        const maxDefaultCommission = getMaxValue(controls.commissionType.value);
        controls.defaultCommission.setValidators([
          Validators.required,
          PeCustomValidators.PositiveNumber(0),
          Validators.max(maxDefaultCommission),
        ]);
        controls.defaultCommission.updateValueAndValidity();

        this.levels.controls.forEach(({ controls }: FormGroup) => {
          controls.title.setValidators([Validators.required]);
          const maxValue = getMaxValue(controls.commissionType.value);
          controls.commission.setValidators([
            Validators.required,
            PeCustomValidators.PositiveNumber(0),
            Validators.max(maxValue),
          ]);
          controls.title.updateValueAndValidity();
          controls.commission.updateValueAndValidity();
        });
      }));

  public readonly loading$ = new BehaviorSubject<boolean>(false);
  private readonly filterItems$ = new BehaviorSubject<any[]>([]);
  private readonly setFilter$ = new Subject<{ arrayName: string, filter: string }>();
  private readonly getFilteredData$ = this.setFilter$
    .pipe(
      filter(({ filter }) => {
        const filterValid = filter && typeof filter === 'string' && filter !== '' && filter[0] !== ' ';
        !filterValid && this.filterItems$.next([]);
        this.loading$.next(filterValid);

        return filterValid;
      }),
      debounceTime(400),
      switchMap(({ arrayName, filter }) => {
        switch (arrayName) {
          case PeAffiliatesProgramArrayNamesEnum.Categories:
            return this.getCategories(filter);
          case PeAffiliatesProgramArrayNamesEnum.Products:
            return this.getProducts(filter);
          default:
            return of([]);
        }
      }),
      tap(arrayToFilter => {
        this.loading$.value && this.filterItems$.next(arrayToFilter);
        this.loading$.next(false);
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private matDialog: MatDialog,
    
    private pebEnvService: PebEnvService,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peAffiliatesApiService: PeAffiliatesApiService,
    private peAffiliatesGridService: PeAffiliatesGridService,
  ) {
    this.loading = true;
    this.peAffiliatesGridService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.loading && this.save();
    };
    this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
    this.peOverlayConfig.isLoading = true;
  }

  private get level(): FormGroup {
    return this.formBuilder.group({
      commission: [],
      commissionType: [PeAffiliatesProgramCommissionTypesEnum.Percentage],
      title: [],
    });
  }

  public get levels(): FormArray {
    return this.programForm.controls.levels as FormArray;
  }

  ngOnInit(): void {
    const programId = this.peOverlayData?.id;
    const getProgram$ = programId
      ? this.getProgram(programId)
      : timer(0);
    const initProgramForm$ = getProgram$
      .pipe(
        tap(() => {
          this.loading = false;
          this.peOverlayConfig.doneBtnTitle = this.saveBtn;
          this.peOverlayConfig.isLoading = false;
          this.cdr.markForCheck();
          this.programForm.markAsPristine();
        }));

    merge(
      initProgramForm$,
      this.changeCommissionTypesListener$,
      this.getFilteredData$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private errorHandler(): OperatorFunction<any, any> {
    return catchError(() => of([]));
  }

  private closeEditor = () => {
    if (this.programForm.dirty && !this.loading) {
      this.peAffiliatesGridService.confirmation$
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peOverlayWidgetService.close();
          }),
          takeUntil(this.destroy$))
        .subscribe();

      const programId = this.peOverlayData?._id;
      const headingTitle = programId
        ? 'affiliates-app.confirm_dialog.cancel.program_editor.editing.title'
        : 'affiliates-app.confirm_dialog.cancel.program_editor.creating.title';
      const headingSubtitle = programId
        ? 'affiliates-app.confirm_dialog.cancel.program_editor.editing.subtitle'
        : 'affiliates-app.confirm_dialog.cancel.program_editor.creating.subtitle';
      const config: Headings = {
        title: this.translateService.translate(headingTitle),
        subtitle: this.translateService.translate(headingSubtitle),
        confirmBtnText: this.closeBtn,
        declineBtnText: this.cancelBtn,
      };

      this.peAffiliatesGridService.openConfirmDialog(config);
    } else if (!this.loading) {
      this.peOverlayWidgetService.close();
    }
  }

  public filteredItems(control: AbstractControl) { 
    return this.filterItems$
      .pipe(
        map(arrayToFilter => arrayToFilter
          .filter(item => {
            const itemId = item?._id ?? item?.id;

            return !control.value
              .some(controlItem => controlItem?._id === itemId || controlItem?.id === itemId);
          })));
  }

  private getCategories(filter: string = ''): Observable<any> {
    return this.peAffiliatesApiService
      .getCategories(filter)
      .pipe(this.errorHandler());
  }

  private getProducts(filter: string = ''): Observable<any> {
    return this.peAffiliatesApiService
      .getProducts(filter)
      .pipe(this.errorHandler());
  }

  private getProgram(programId: string): Observable<any> {
    return this.peAffiliatesApiService
      .getProgram(programId)
      .pipe(
        switchMap((program: PeAffiliatesProgramInterface) => {
          const { categories, products } = program;

          return forkJoin([
            of(program),
            categories && categories.length
              ? this.peAffiliatesApiService.getCategories()
              : of(null),
            products && products.length
              ? this.peAffiliatesApiService.getProducts()
              : of(null),
          ]);
        }),
        tap(([program, categories, products]) => {
          if (categories) {
            program.categories = IdToDataMapper(program.categories, categories);
          }

          if (products) {
            program.products = IdToDataMapper(program.products, products);
          }
          
          program.startedAt = moment(program.startedAt).format('DD.MM.YYYY');
          program.commission.forEach(level => {
            this.levels.push(this.formBuilder.group(level));
          });

          this.programForm.patchValue(program);
        }));
  }

  private save(): void {
    this.initChangeCommissionTypesListener$.next();
    const { controls } = this.programForm;
    controls.name.setValidators([Validators.required]);
    controls.assets.setValidators([Validators.required, PeCustomValidators.PositiveInteger(1)]);
    controls.cookie.setValidators([Validators.required, PeCustomValidators.PositiveInteger(1)]);
    controls.inviteLink.setValidators([Validators.required]);
    controls.programApi.setValidators([Validators.required]);
    controls.startedAt.setValidators([Validators.required]);
    controls.url.setValidators([Validators.required]);

    switch (controls.appliesTo.value) {
      case PeAffiliatesProgramAppliesToEnum.AllProducts:
        controls.categories.disable();
        controls.products.disable();
        break;
      case PeAffiliatesProgramAppliesToEnum.SpecificCategories:
        controls.categories.enable();
        controls.categories.setValidators([Validators.required, PeCustomValidators.MinArrayLength(1)]);
        controls.products.disable();
        break;
      case PeAffiliatesProgramAppliesToEnum.SpecificProducts:
        controls.products.enable();
        controls.products.setValidators([Validators.required, PeCustomValidators.MinArrayLength(1)]);
        controls.categories.disable();
        break;
    }

    controls.name.updateValueAndValidity();
    controls.assets.updateValueAndValidity();
    controls.categories.updateValueAndValidity();
    controls.cookie.updateValueAndValidity();
    controls.inviteLink.updateValueAndValidity();
    controls.products.updateValueAndValidity();
    controls.programApi.updateValueAndValidity();
    controls.startedAt.updateValueAndValidity();
    controls.url.updateValueAndValidity();
    const { dirty, invalid, valid } = this.programForm;
    
    if (dirty && valid) {
      const commission = controls.levels.value.map(level => {
        level.commission = Number(level.commission);

        return level;
      });
      const program = {
        affiliateBranding: this.pebEnvService.applicationId,
        appliesTo: controls.appliesTo.value,
        assets: Number(controls.assets.value),
        categories: controls.appliesTo.value === PeAffiliatesProgramAppliesToEnum.SpecificCategories
          ? controls.categories.value
          : [],
        commission: commission,
        commissionType: controls.commissionType.value,
        cookie: Number(controls.cookie.value),
        currency: controls.currency.value,
        defaultCommission: Number(controls.defaultCommission.value),
        inviteLink: controls.inviteLink.value,
        name: controls.name.value,
        products: controls.appliesTo.value === PeAffiliatesProgramAppliesToEnum.SpecificProducts
          ? controls.products.value
          : [],
        programApi: controls.programApi.value,
        startedAt: moment(controls.startedAt.value, 'DD.MM.YYYY').toDate(),
        status: controls.status.value,
        parentFolderId: this.peOverlayData.parentFolderId,
        url: controls.url.value,
      }
      
      of(controls._id.value)
        .pipe(
          switchMap(programId => {
            this.loading = true;
            this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
            this.peOverlayConfig.isLoading = true;
            this.cdr.detectChanges();
            programId && delete program.parentFolderId;

            return programId
              ? this.peAffiliatesApiService.updateProgram(programId, program)
              : this.peAffiliatesApiService.createProgram(program);
          }),
          map(program => this.peOverlayData.applicationScopeElasticId
            ? {
                ...program,
                applicationScopeElasticId: this.peOverlayData.applicationScopeElasticId,
              }
            : program),
          tap(program => {
            this.peOverlayConfig.onSaveSubject$.next(program);
          }),
          catchError(() => {
            this.loading = false;
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.peOverlayConfig.isLoading = false;
            this.cdr.detectChanges();

            return of(true);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else if (dirty || invalid) {
      this.cdr.detectChanges();
    } else {
      this.peOverlayWidgetService.close();
    }
  }

  public addToArray(element: any, control: AbstractControl): void {
    const elementId = element?.id ?? element?._id;
    !control.value.some(el => el?.id === elementId || el?._id === elementId) && control.value.push(element);
    control.updateValueAndValidity();
    control.markAsDirty();
  }

  public removeFromArray(control: AbstractControl, index: number): void {
    control.value.splice(index, 1);
    control.updateValueAndValidity();
    control.markAsDirty();
  }

  public setFilter(filter: string, arrayName: string): void {
    this.setFilter$.next({ arrayName, filter });
  }

  public trackItem(index: number, item: any): any {
    return item?.id ?? item?._id;
  }

  public maskRule(currentMask: any[]): any {
    return {
      guide: false,
      mask: currentMask,
      showMask: false,
    }
  }

  public openDatepicker(dateControl: AbstractControl): void {
    const dateFormat = 'DD.MM.YYYY';
    const currentDate = dateControl.value;
    const setDate = moment(currentDate, dateFormat);
    const validDate = setDate.isValid() ? setDate.toDate() : null;
    const config: MatDialogConfig = {
      panelClass: ['datepicker', this.theme],
      data: validDate,
    };

    this.matDialog
      .open(PeDatepickerComponent, config)
      .afterClosed()
      .pipe(
        take(1),
        tap(value => {
          if (value) {
            const date = moment(value).format(dateFormat);
            dateControl.patchValue(date);
            dateControl.markAsDirty();
            this.cdr.markForCheck();
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public addLevel(): void {
    this.levels.push(this.level);
    this.changeArraysLengthListener$.next();
  }

  public removeLevel(index): void {
    this.levels.removeAt(index);
    this.programForm.markAsDirty();
  }
}
