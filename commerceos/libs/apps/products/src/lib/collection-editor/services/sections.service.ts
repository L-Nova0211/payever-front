// tslint:disable:max-file-line-count
import { Injectable } from '@angular/core';
import { cloneDeep, get } from 'lodash-es';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, skip } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { DataGridService } from '../../products-list/services/data-grid/data-grid.service';
import { RecurringBillingFormInterface, RecurringBillingInterface } from '../../shared/interfaces/billing.interface';
import { CollectionModel } from '../../shared/interfaces/collection-model';
import { Product } from '../../shared/interfaces/product.interface';
import { ProductsApiService } from '../../shared/services/api.service';
import { CollectionEditorSections, ConditionsType } from '../enums';
import { ContentSection, MainSection, ProductsSection } from '../interfaces';

@Injectable()
export class CollectionSectionsService {
  resetState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  isUpdating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  saveClicked$: Subject<CollectionEditorSections | string> = new Subject<CollectionEditorSections | string>();
  saveClickedSuccess$: Subject<boolean> = new Subject<boolean>();
  mainSectionChange$: Subject<MainSection> = new BehaviorSubject<MainSection>(null);
  productsChange$: Subject<Product[]> = new BehaviorSubject<Product[]>(null);
  recurringBillingChange$: Subject<RecurringBillingFormInterface> = new BehaviorSubject<RecurringBillingFormInterface>(
    null,
  );

  isSubmitted = false;
  isEdit: boolean;

  sectionKeys: CollectionEditorSections[] = Object.keys(CollectionEditorSections).map(
    (key: string) => CollectionEditorSections[key],
  );

  activeSection: CollectionEditorSections = CollectionEditorSections.Main;
  activeSection$: Subject<CollectionEditorSections> = new Subject<CollectionEditorSections>();
  sectionsWithErrors: string[] = [];
  model: CollectionModel = cloneDeep(ProductsApiService.collectionModel);
  recurringBillingLoading$ = new BehaviorSubject(false);
  recurringBillingInitial: RecurringBillingInterface = {};
  recurringBilling: RecurringBillingInterface = {};
  private conditionsTypeBackingField$: BehaviorSubject<ConditionsType> = new BehaviorSubject<ConditionsType>(null);
  private maxImagesCount = 3;

  constructor(
    private api: ProductsApiService,
    private dataGridService: DataGridService,
    private envService: EnvService,
  ) {
    this.resetState$.pipe(skip(1), filter(Boolean)).subscribe(() => {
      this.resetState();
    });
  }

  get conditionsType(): ConditionsType {
    return get(this.model, 'conditions.type', ConditionsType.NoCondition);
  }

  get conditionsType$(): Subject<ConditionsType> {
    return this.conditionsTypeBackingField$;
  }

  get mainSection(): MainSection {
    const images: string[] = [];
    get(this.model, 'products', ProductsApiService.collectionModel.products).forEach((product) => {
      if (product?.images.length > 0 && images?.length < this.maxImagesCount) {
        images.push(product.images[0]);
      }
    });

    return {
      images,
      image: get(this.model, 'image', ProductsApiService.collectionModel.image),
      name: get(this.model, 'name', ProductsApiService.collectionModel.name),
      conditions: {
        type: get(this.model, 'conditions.type', ProductsApiService.collectionModel.conditions.type),
        filters: get(this.model, 'conditions.filters', ProductsApiService.collectionModel.conditions.filters),
      },
    };
  }

  get contentSection(): ContentSection {
    return {
      description: get(this.model, 'description', ProductsApiService.collectionModel.description),
    };
  }

  get productsSection(): ProductsSection {
    return {
      products: get(this.model, 'products', ProductsApiService.collectionModel.products),
    };
  }

  onChangeConditionsType(type: ConditionsType): void {
    this.conditionsTypeBackingField$.next(type);
    this.model.conditions.type = type;
  }

  onChangeMainSection(mainSection: MainSection): void {
    this.model.image = mainSection.image;
    this.model.name = mainSection.name;
    this.model.conditions.filters = mainSection.conditions.filters;
    this.model.conditions.type = mainSection.conditions.type;
    // this.onChangeConditionsType(mainSection.conditionsType);
    this.mainSectionChange$.next(mainSection);
  }

  onChangeContentSection(contentSection: ContentSection): void {
    this.model.description = contentSection.description;
  }

  removeProduct(id: string): void {
    this.model.products = this.model.products.filter((product: Product) => product.id !== id);
    this.mainSectionChange$.next(this.model);
  }

  onNextStepMove(): void {
    this.activeSection = this.sectionKeys[this.sectionKeys.indexOf(this.activeSection) + 1];
  }

  save(): Observable<boolean> {
    this.saveClicked$.next(this.activeSection);
    const businessUuid: string = this.envService.businessId;
    const _id: string = get(this.model, '_id', null);

    this.isSubmitted = true;
    if (_id === null) {
      this.saveClicked$.next(this.activeSection);
    }
    if (this.sectionsWithErrors.length === 0) {
      this.saveClickedSuccess$.next(true);

      return this.api
        .createOrUpdateCollection(
          {
            _id,
            image: this.model.image,
            images: this.model.images,
            conditions: this.model.conditions,
            products: this.model.products,
            name: this.model.name,
            parent: this.dataGridService.selectedFolder ?? this.model.parent,
            description: this.getNormalizedDescription(),
            initialProducts: this.model.initialProducts,
          } as CollectionModel,
          businessUuid,
        )
        .pipe(map((response) => {
          // this.dataGridService.updateGrid(response);
          return true;
        }));
    } else {
      return of(false);
    }
  }

  haveErrors(section: CollectionEditorSections): boolean {
    return this.sectionsWithErrors.indexOf(section) !== -1;
  }

  onFindError(haveErrors: boolean, section: CollectionEditorSections): void {
    if (haveErrors) {
      if (!this.haveErrors(section)) {
        this.sectionsWithErrors.push(section);
      }
    } else {
      if (this.haveErrors(section)) {
        this.sectionsWithErrors.splice(this.sectionsWithErrors.indexOf(section), 1);
      }
    }
  }

  setCollection(collection: CollectionModel): void {
    this.model = Object.assign({}, this.model, collection);
  }

  getCollection(): CollectionModel {
    return this.model;
  }

  getProducts(): Product[] {
    return this.model.products;
  }

  setProducts(products: Product[]): void {
    this.model.products = products;
    this.productsChange$.next(this.model.products);
  }

  private getNormalizedDescription(): string {
    return this.model.description
      ? this.model.description.replace(/(\n)/g, '\\n').replace(/"/g, '\\"')
      : this.model.description;
  }

  private resetFields(): void {
    this.model = cloneDeep(ProductsApiService.collectionModel);
    this.productsChange$.next(this.model.products);
  }

  private resetActiveSection(): void {
    this.activeSection = CollectionEditorSections.Main;
  }

  private resetErrors(): void {
    this.sectionsWithErrors = [];
  }

  private resetState(): void {
    this.resetFields();
    this.resetActiveSection();
    this.resetErrors();
  }

  private resetSectionErrors(resetSection: CollectionEditorSections): void {
    this.sectionsWithErrors = this.sectionsWithErrors.filter(
      (section: CollectionEditorSections) => section !== resetSection,
    );
  }
}
