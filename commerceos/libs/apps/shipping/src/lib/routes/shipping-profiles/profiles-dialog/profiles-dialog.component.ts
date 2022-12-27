import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild, ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';
import { catchError, debounceTime, filter,
  skip, switchMap, take, takeUntil, tap , startWith, pluck, map } from 'rxjs/operators';

import { EnvService, PE_ENV, PeDestroyService } from '@pe/common';
import { PeGridItem, PeGridItemType } from '@pe/grid';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';
import {
  OverlayHeaderConfig,
  PeOverlayConfig,
  PeOverlayRef,
  PeOverlayWidgetService,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
} from '@pe/overlay-widget';
import { ProductsAppState } from '@pe/shared/products';
import { SnackbarService } from '@pe/snackbar';

import { FormProductItem, ProductItem } from '../../../interfaces/products/product.interface';
import { BaseComponent } from '../../../misc/base.component';
import { PebShippingOriginService } from '../../../services/shipping-origin.service';
import { PebShippingSettingsService } from '../../../services/shipping-settings.service';
import { PebShippingZoneService } from '../../../services/shipping-zone.service';
import { LibShippingEditLocationModalComponent }
  from '../../delivery-by-location/edit-location-modal/edit-location-modal.component';
import { PebShippingEditOptionsComponent } from '../../shipping-options/edit-options-modal/edit-options.component';
import { ConfirmDialogService } from '../browse-products/dialogs/dialog-data.service';
import { ProductsDialogService } from '../browse-products/products/products-dialog.service';
import { ProductsApiService } from '../browse-products/services/api.service';

@Component({
  selector: 'peb-profiles-dialog-form',
  templateUrl: './profiles-dialog.component.html',
  styleUrls: ['./profiles-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [MediaUrlPipe],
})
export class PebShippingProfileFormComponent extends BaseComponent implements OnInit, AfterViewInit {
  @SelectSnapshot(ProductsAppState.products) products: PeGridItem[];

  @ViewChild('picker') zonesPicker: any;
  @ViewChild('productPibker') productPibker: any;

  edit = false;
  countries;
  zoneRef: PeOverlayRef;
  originRef: PeOverlayRef;
  origin;
  currency;
  countryNames;
  theme;
  settings: any;
  isLastDefault = false;
  zones: any;

  defaultProductImg = `${this.env.custom.cdn}/icons/app-icon-products.svg`;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  productsData$ = new BehaviorSubject<any[]>([]);
  filterProduct$ = new Subject<string>();


  profilesForm: FormGroup = this.formBuilder.group({
    name: [''],
    products: [[]],
    productsData: [],
    origins: [],
    originData: [],
    zones: [],
    zonesData: [],
    isDefault: false,
  });

  zonesAutocomplete = [];

  get businessId(): string {
    return this.envService.businessId;
  }

  constructor(
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private mediaUrlPipe: MediaUrlPipe,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    @Inject(PE_ENV) private env,
    private cdr: ChangeDetectorRef,
    private overlayService: PeOverlayWidgetService,
    private localConstantsService: LocaleConstantsService,
    private shippingZoneService: PebShippingZoneService,
    private shippingSettingsService: PebShippingSettingsService,
    private shippingOriginService: PebShippingOriginService,
    private envService: EnvService,
    private productsDialogService: ProductsDialogService,
    private productApiService:ProductsApiService ,
    private router: Router,
    private store: Store,
    private snackBarService: SnackbarService,
    private route: ActivatedRoute,
    protected translateService: TranslateService,
    private confirmDialog: ConfirmDialogService,
    private apmService: ApmService,
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.getCountries();
    this.theme = this.overlayConfig.theme;
    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => {
        this.onCheckValidity();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.filterProduct$.pipe(
      debounceTime(500),
      startWith(''),
      switchMap(filter => this.getFilterProducts(filter)),
      tap(products => this.productsData$.next(products)),
      takeUntil(this.destroyed$)
    ).subscribe()
  }


  getFilterProducts(filter:string){
    if(!filter){
      return of([]);
    }

   return  this.productApiService.getProducts([] , this.businessId , [],filter ).pipe(
         pluck('data', 'getProducts', 'products'),
         map(res => res.map((item) => {
              const image = this.getMediaUrlFromImage(item.images[0]);

              return { image, id: item.id, name: item.title, sku: item.sku };
            })
         )
       )
  }

  putValuesToCoreFields(coreFieldsInput) {
    if (coreFieldsInput.get('products').value?.length > 0) {
      const ids = coreFieldsInput.get('products').value.map(val => val.productId);
      this.overlayData.productsService.getProductListByListOfId(ids)
        .pipe(
          take(1),
          tap((products: any) => {
            const selectedProductsData = this.normalizeProductsData(products);
            this.productsDialogService.selectedProducts =
              products.map(product => this.productsFolderToItemMapper(product));
            this.profilesForm.patchValue({ ...coreFieldsInput, ...{ products: selectedProductsData } });

            this.cdr.detectChanges();
          }),
        )
        .subscribe();
    }
  }

  ngAfterViewInit() {
    this.currency = this.overlayData.currency;
    const origins = this.overlayData.settings?.origins;
    let country;
    if (origins?.countryCode) {
      country = this.countries.find(item => item.value === origins.countryCode).label;
    }
    if (origins) {
      this.profilesForm.get('originData').setValue(origins._id);
      this.origin = origins;
      this.profilesForm
        .get('origins')
        .patchValue(`${origins.streetName} ${origins.streetNumber}, ${origins.zipCode} ${origins.city}, ${country}`);
    }
    if (this.overlayData?.settings) {
      this.zones = this.overlayData?.settings?.zones;
      this.setZonesAutocomplete();
    }

    if (this.overlayData?.data) {
      if (this.overlayData.hasOwnProperty('isLastDefault')) {
        this.isLastDefault = this.overlayData.isLastDefault;
      }

      country = this.countries.find(item => item.value === this.overlayData?.data?.origins[0]?.countryCode)?.label;
      this.profilesForm.get('name').patchValue(this.overlayData.data.name);
      this.profilesForm.get('isDefault').patchValue(this.overlayData.data.isDefault);

      if (this.overlayData.data.products) {
        const products = [];
        this.overlayData.data.products.forEach((product) => {
          product.image = product.imageUrl;
          products.push({
            productId: product.hasOwnProperty('productId') ? product.productId : product._id ,
            name: product.name,
            sku: product.sku,
            image: product?.image,
            imageUrl: product?.image,
          });
        });

        this.profilesForm.get('products').patchValue(products);

        this.productPibker.emitChanges();
        this.cdr.detectChanges();
      }

      if (this.overlayData.data?.zones[0]?._id) {
        this.profilesForm.get('zones').patchValue(this.overlayData.data?.zones.map((item) => {

          const image = `#icon-flag-${item.countryCodes[0]?.toLowerCase()}`;
          const pickerObj = { image, label: item.name + `(${this.getCountryName(item)})`, value: item._id };
          this.zonesPicker.onAddItem(pickerObj);

          return pickerObj;
        }));
        this.profilesForm.get('zonesData').patchValue(this.overlayData.data?.zones.map(item => item._id));
        this.countryNames = this.overlayData.data?.zones[0]?.countryCodes;
      }
      if (this.overlayData.data?.origins[0]?._id) {
        this.profilesForm.get('originData').setValue(this.overlayData.data?.origins[0]?._id);
        this.origin = this.overlayData.data?.origins[0];
        this.profilesForm
          .get('origins')
          .patchValue(
            `${this.overlayData.data?.origins[0]?.streetName} ${this.overlayData.data?.origins[0]?.streetNumber || ''}, ${
              this.overlayData.data?.origins[0]?.zipCode
            } ${this.overlayData.data?.origins[0]?.city}, ${country}`,
          );
      }
      this.putValuesToCoreFields(this.profilesForm);
      this.edit = true;
    }
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    this.countries.push({
      value: 'All',
      label: 'All Countries',
    });

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }

  openProductDialog = () => {
    const mode = this.overlayData?.mode || 'adding';
    this.router.navigate([`business/${this.businessId}/shipping/profiles/profile/${mode}/product`]);
    this.productDialogListener();
  }

  productDialogListener() {
    this.productsDialogService.currentStatus.pipe(
      filter((isSave: boolean | null) => {
        return isSave !== null;
      }),
      tap((isSave: boolean) => {
        if (isSave) {
          const products = this.normalizeProductsData(this.products);
          this.profilesForm.patchValue({
            products: products,
          });

          this.cdr.detectChanges();
        }
      }),
      take(1),
    ).subscribe();
  }

  onChangeProduct(e) {
    if (e) {
      const products = [];
      this.profilesForm.get('products').setValue([]);
      e.forEach((element) => {
        products.push({
          productId: element.hasOwnProperty('id') ? element.id : element.productId ,
          name: element.name,
          sku: element.sku,
          image: element?.image,
          imageUrl: element?.image,
        });
      });
      this.profilesForm.get('products').patchValue(products);
      this.cdr.detectChanges();
    }
  }

  getProductsData(products): ProductItem[] {
    return products.map((item) => {
      return { id: item.productId, name: item.name, image: item.image, sku: item.sku };
    });
  }

  normalizeProductsData(products): FormProductItem[] {
    return products.map((element) => {
      const image = element.image ? element.image
        : ( element.images && element.images[0]
            ? this.mediaUrlPipe.transform(element.images[0], MediaContainerType.Products, 'grid-thumbnail' as any)
            : null
        );

      return {
        image: image ?? this.defaultProductImg,
        label: element.title,
        id: element._id ?? element.id,
        name: element.title,
        productId: element._id ?? element.id,
      };
    });
  }

  openCreateZoneDialog = () => {
    const config: PeOverlayConfig = {
      data: { currency: this.currency, items: this.zones, connections: this.overlayData?.connections },
      headerConfig: {
        title: this.translateService.translate('shipping-app.forms.profiles_dialog.create_zone'),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('zone', 'adding'), this.zoneRef);
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.zoneRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('zone', 'adding'), this.zoneRef);
      },
      component: PebShippingEditOptionsComponent,
      panelClass: 'zone-dialog',
    };
    this.zoneRef = this.overlayService.open(config);
    this.zoneRef.afterClosed
      .pipe(
        take(1),
        filter(data => !!data),
        switchMap((data) => {
            return this.shippingZoneService
              .addShippingZone(data)
              .pipe(
                tap((response: any) => {
                  this.zones.push(response);
                  const obj = this.getZonesAutocompleteObject(response);
                  this.zonesAutocomplete.push(obj);
                  let zonesData = [response._id];
                  let zones = [obj];
                  if (this.profilesForm.get('zonesData').value?.length > 0) {
                    zonesData = this.profilesForm.get('zonesData').value;
                    zones = this.profilesForm.get('zones').value;
                    zonesData.push(response._id);
                    zones.push(obj);
                  }
                  this.profilesForm.get('zonesData').patchValue(zonesData);
                  this.countryNames = response.countryCodes;
                  this.profilesForm.get('zones').patchValue(zones);
                  this.zonesPicker.emitChanges();
                  this.cdr.detectChanges();
                }),
                catchError((err) => {
                  this.apmService.apm.captureError(
                    `Cant add shipping zone ERROR ms:\n ${JSON.stringify(err)}`
                  );

                  return of(true);
                }),
              )
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  openEditOriginDialog = () => {
    const config: PeOverlayConfig = {
      data: {
        data: this.origin || null,
        isProfile: this.origin,
      },
      headerConfig: {
        title: this.translateService.translate('shipping-app.forms.profiles_dialog.edit_origin'),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('location', 'editing'), this.originRef);
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.originRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('location', 'editing'), this.originRef);
      },
      component: LibShippingEditLocationModalComponent,
      panelClass: 'origin-dialog',
    };
    this.originRef = this.overlayService.open(config);
    this.originRef.afterClosed
      .pipe(
        take(1),
        filter(data => !!data),
        switchMap((data) => {
            const country = this.countries.find(item => item.value === data.data.countryCode).label;
            this.profilesForm
              .get('origins')
              .patchValue(`${data.data.streetName} ${data.data.streetNumber || ''}, ${data.data.zipCode} ${data.data.city}, ${country}`);

            return this.shippingOriginService
              .postOrigin(data.data)
              .pipe(
                tap((origin: any) => {
                  this.profilesForm.get('originData').setValue(origin._id);
                  this.origin.city = origin.city;
                  this.origin.streetNumber = origin.streetNumber;
                  this.origin.streetName = origin.streetName;
                  this.origin.countryCode = origin.countryCode;
                  this.origin.name = origin.name;
                  this.origin.phone = origin.phone.split(' ')[1] ?? origin.phone;
                  this.origin.zipCode = origin.zipCode;
                  this.cdr.detectChanges();
                }),
                catchError((err) => {
                  this.apmService.apm.captureError(
                    `Cant post shipping origin ms:\n ${JSON.stringify(err)}`
                  );

                  return of(true);
                }),
              )
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  onCheckValidity() {
    const control = this.profilesForm.controls;

    control.name.setValidators([Validators.required]);
    control.name.updateValueAndValidity();

    control.origins.setValidators([Validators.required]);
    control.origins.updateValueAndValidity();

    control.products.setValidators([Validators.required]);
    control.products.updateValueAndValidity();

    control.zones.setValidators([Validators.required]);
    control.zones.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.isLastDefault && this.overlayData.data.isDefault && !this.profilesForm.get('isDefault').value) {
      this.snackBarService.toggle(
        true,
        {
          content: this.translateService.translate('shipping-app.snackbar.default_last_change'),
          duration: 5000,
          iconId: 'icon-alert-24',
          iconSize: 24,
        });
    } else {
      this.onSave();
    }
  }

  onSave() {
    if (this.profilesForm.valid) {
      this.overlayConfig.doneBtnTitle = 'Saving...';
      const control = this.getProfileSaveObject(this.profilesForm.controls);
      let request;
      if (control.id) {
        request = this.shippingSettingsService.editProfile(control.id, control, this.envService.businessId);
      } else {
        request = this.shippingSettingsService.addProfile(control, this.envService.businessId);
      }
      this.cdr.detectChanges();
      this.shippingSettingsService.profilesHelpData = [];
      this.router.navigate([`business/${this.envService.businessId}/shipping/profiles`]);
      this.shippingSettingsService.saveProfile(null);

      request.pipe(
        tap((_) => {
          this.peOverlayRef.close(control);
        }),
        takeUntil(this.destroyed$),
        catchError((err) => {
          this.apmService.apm.captureError(
            `Cant edit profile ERROR ms:\n ${JSON.stringify(err)}`
          );

          this.peOverlayRef.close(null);

          return EMPTY;
        })
      ).subscribe();
    }
  }

  getProfileSaveObject(control) {
    return {
      isDefault: control.isDefault.value,
      name: control.name.value,
      business: this.envService.businessId,
      products: control.products.value,
      zones: control.zonesData.value,
      origins: [control.originData.value],
      id: this.overlayData?.data?._id || null,
    }
  }

  onRemoveZone() {
    this.profilesForm.get('zonesData').reset();
    this.profilesForm.get('zones').patchValue('');
  }

  onEditZone = (e) => {
    this.shippingZoneService.getShippingZoneById(this.profilesForm.get('zonesData').value[e])
      .pipe(
        take(1),
        switchMap((response: any) => {
          const config: PeOverlayConfig = {
            data: {
              data: response,
              currency: this.currency,
              items: this.zones,
              connections: this.overlayData?.connections,
            },
            headerConfig: {
              title: response.name,
              backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
              backBtnCallback: () => {
                this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'), this.zoneRef);
              },
              doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
              doneBtnCallback: () => {
                this.onSaveSubject$.next(this.zoneRef);
              },
              onSaveSubject$: this.onSaveSubject$,
              onSave$: this.onSave$,
              theme: this.theme,
            },
            backdropClick: () => {
              this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'), this.zoneRef);
            },
            component: PebShippingEditOptionsComponent,
          };
          this.zoneRef = this.overlayService.open(config);

          return this.zoneRef.afterClosed
            .pipe(
              take(1),
              filter(data => !!data),
              switchMap((data) => {
                return this.shippingZoneService
                    .editShippingZone(data.id, data.data)
                    .pipe(
                      tap((zone: any) => {
                        this.zones.splice(this.zones.indexOf(this.zones.find(item => item._id === data.id)), 1);
                        this.zones.push({ _id: data.id, ...data.data });
                        const newItem = this.getZonesAutocompleteObject(this.zones[this.zones.length - 1]);
                        const itemToRemov = this.zonesAutocomplete.find(item => item.value === newItem.value);
                        this.zonesAutocomplete.splice(this.zonesAutocomplete.indexOf(itemToRemov), 1);
                        this.zonesAutocomplete.push(newItem);
                        this.zonesPicker.changeEditedItem(newItem);
                        this.countryNames = data.data.countryCodes;
                        this.profilesForm.get('zones').patchValue(this.zonesPicker.pickedItems);
                        this.profilesForm.get('zonesData').patchValue(this.zonesPicker.pickedItems.map(item => item.value));
                        this.cdr.detectChanges();
                      }),
                      catchError((err) => {
                        this.apmService.apm.captureError(
                          `Cant delete shipping profile ERROR ms:\n ${JSON.stringify(err)}`
                        );

                        return of(true);
                      })
                    )
                }
              )
            );
        })
      ).subscribe();
  }

  zoneChanged(e) {
    if (e) {
      this.profilesForm.get('zones').patchValue(e);
      this.profilesForm.get('zonesData').patchValue(e.map(item => item.value));
      this.cdr.detectChanges();
    }
  }

  setZonesAutocomplete() {
    if (this.zones && this.zones.length > 0) {
      this.zonesAutocomplete = this.zones.map((zone: any) => {
        return this.getZonesAutocompleteObject(zone);
      });
    }
  }

  getCountryName(zone) {
    return this.countries.find(item => item.value === zone?.countryCodes[0])?.label;
  }

  getZonesAutocompleteObject(zone) {
    const label = zone.name + `(${this.getCountryName(zone)})`;
    const image = `#icon-flag-${zone?.countryCodes[0]?.toLowerCase()}`;

    // tslint:disable-next-line:object-shorthand-properties-first
    return { label, image, value: zone._id };
  }

  getMediaUrlFromImage(image) {
    return this.mediaUrlPipe.transform(image, MediaContainerType.Products, 'grid-thumbnail' as any);
  }

  showConfirmationWindow(dialogContent, dialogRef) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
      tap(() => {
        dialogRef.close();
      }),
    ).subscribe();
  }

  productsFolderToItemMapper(folder): PeGridItem {
    const imageURL = folder.isFolder
      ? folder.image
      : this.mediaUrlPipe.transform(folder?.images?.[0], MediaContainerType.Products, 'grid-thumbnail' as any)
      ?? './assets/icons/folder-grid.png';

    return {
      id: folder._id,
      type: PeGridItemType.Folder,
      image: imageURL,
      title: folder.name,
      data: {
        isFolder: true,
        position: folder.position,
        description: folder.description,
      },
      action: {
        label: this.translateService.translate('open').toLowerCase(),
        color: null,
        backgroundColor: null,
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
    };
  }
}
