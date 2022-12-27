import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { get, isEqual } from 'lodash-es';
import { Subject } from 'rxjs';
import { filter, skip, take, takeUntil } from 'rxjs/operators';

import { PeDestroyService, EnvService } from '@pe/common';
import { TranslatePipe, TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';
import { PeStepperService, PeWelcomeStepperAction } from '@pe/stepper';

import { DialogService } from '../../../products-list/services/dialog-data.service';
import { DEFAULT_SNACK_BAR_DURATION, STATUS_FORBIDDEN } from '../../../shared/constants';
import { Business } from '../../../shared/interfaces/business.interface';
import { CollectionModel } from '../../../shared/interfaces/collection-model';
import { LinkControlInterface, TextControlInterface } from '../../../shared/interfaces/editor.interface';
import { Product } from '../../../shared/interfaces/product.interface';
import { CollectionsDataService } from '../../../shared/services/collections-data.service';
import { CollectionEditorSections } from '../../enums';
import { ExternalError } from '../../interfaces';
import { CollectionSectionsService } from '../../services';

import { NavbarControlPosition, NavbarControlType } from './../../../shared/enums/editor.enum';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pf-collections-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TranslatePipe,
    PeDestroyService,
  ],
})
export class CollectionEditorComponent implements OnInit {
  isEdit: boolean;
  sectionKeys: CollectionEditorSections[];
  business: Business;
  channelSetId: number;
  externalError$: Subject<ExternalError> = new Subject<ExternalError>();

  titleControlConfig: TextControlInterface = {
    position: NavbarControlPosition.Center,
    type: NavbarControlType.Text,
    text: this.translateService.translate('title'),
  };

  linkControlConfig: LinkControlInterface = {
    position: NavbarControlPosition.Right,
    type: NavbarControlType.Link,
    text: this.translateService.translate('save'),
    classes: 'mat-button-fit-content',
    queryParams: this.route.snapshot.queryParams, // to prevent removing of get params
    onClick: () => {
      this.sectionsService
        .save()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          () => this.handleSave(),
          (error: any) => this.handleError(error),
        );
    },
  };

  modalHeaderControls: Array<TextControlInterface | LinkControlInterface> = [
    this.titleControlConfig,
    this.linkControlConfig,
  ];

  private model: CollectionModel;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    private sectionsService: CollectionSectionsService,
    private collectionsDataService: CollectionsDataService,
    private peStepperService: PeStepperService,
    private cdr: ChangeDetectorRef,
    public confirmDialog: DialogService,
    private destroyed$: PeDestroyService
  ) {

  }

  get activeSection(): CollectionEditorSections {
    return this.sectionsService.activeSection;
  }

  close() {
    if (isEqual(this.model, this.sectionsService.model)) {
      this.navigateToList();
    } else {
      this.confirmDialog.open({
        title: this.isEdit
          ? this.translateService.translate('collection_dialog_leave.heading_editing')
          : this.translateService.translate('collection_dialog_leave.heading_adding'),
        subtitle: this.isEdit
          ? this.translateService.translate('collection_dialog_leave.description_editing')
          : this.translateService.translate('collection_dialog_leave.description_adding'),
        confirmBtnText: this.translateService.translate('collection_dialog_leave.yes'),
        declineBtnText: this.translateService.translate('collection_dialog_leave.no'),
      });

      this.confirmDialog.confirmation$.pipe(
        skip(1),
        take(2),
      ).subscribe(() => {
        this.navigateToList();
      });
    }
  }

  navigateToList() {
    this.sectionsService.resetState$.next(true);
    this.collectionsDataService.isAddingProductsToCollectionProcess$.next(false);
    const prevPath: string = this.route.snapshot.queryParams.prevProductsPath || 'list';
    const url: string[] = ['business', this.envService.businessId, 'products', prevPath];
    this.router.navigate([
      ...url,
      { outlets: { editor: null } },
    ], { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }

  save() {
    this.sectionsService.save().pipe(
      filter((valid: boolean) => !!valid),
      takeUntil(this.destroyed$),
    ).subscribe(
      () => this.handleSave(),
      (error: any) => this.handleError(error),
    );
  }

  ngOnInit(): void {
    this.channelSetId = this.route.snapshot.params.channelId;

    const isEdit: boolean = this.route.snapshot.data.isCollectionEdit;
    this.isEdit = isEdit;
    this.sectionsService.isEdit = isEdit;

    const collection: CollectionModel = get(this.route.snapshot, ['data', 'collection'], null);
    const collectionProducts: Product[] = get(this.route.snapshot, ['data', 'collectionProducts'], []);

    const needToSetLoadedCollection: boolean = isEdit && this.sectionsService.resetState$.value;
    if (needToSetLoadedCollection) {
      collection.initialProducts = collectionProducts;
      this.sectionsService.setCollection(collection);
      this.sectionsService.setProducts(collectionProducts);
    }

    this.sectionKeys = Object.values(CollectionEditorSections).filter(
      section => isEdit || section !== CollectionEditorSections.Products,
    );

    this.sectionsService.isUpdating$.subscribe((isUpdating) => {
      this.modalHeaderControls = [
        this.titleControlConfig,
        {
          ...this.linkControlConfig,
          loading: isUpdating,
        },
      ];
      this.cdr.markForCheck();
    });

    this.peStepperService.dispatch(PeWelcomeStepperAction.ShowGoBack, true);

    this.model = { ...this.sectionsService.model };
    this.model.description = this.model.description ?? null;
  }

  haveErrors(section: CollectionEditorSections): boolean {
    return this.sectionsService.haveErrors(section);
  }

  setStep(step: CollectionEditorSections): void {
    this.sectionsService.activeSection = step;
    this.sectionsService.activeSection$.next(step);
  }

  removeStep(section: CollectionEditorSections): void {
    if (this.sectionsService.activeSection === section) {
      this.sectionsService.activeSection = null;
      this.sectionsService.activeSection$.next(null);
    }
  }

  handleError(err: any): void {
    if (!err.graphQLErrors) {
      return;
    }
    const error = err.graphQLErrors[0];
    const message: string = error.message || String(error);
    if (message === 'This value is already used') {
      // TODO Rework to automatic get section from error
      this.externalError$.next({
        section: CollectionEditorSections.Main,
        field: 'title',
        errorText: 'This value is already used',
      });
    } else {
      this.snackBarService.toggle(
        true,
        {
          content: error?.statusCode === STATUS_FORBIDDEN ?
            this.translateService.translate('errors.forbidden') : message,
          duration: DEFAULT_SNACK_BAR_DURATION,
          iconId: 'icon-x-rounded-16',
          iconSize: 20,
        },
      );
    }
  }

  handleSave(): void {
    this.peStepperService.dispatch(PeWelcomeStepperAction.ShowGoBack, false);

    this.snackBarService.toggle(
      true,
      {
        content: this.sectionsService.model._id
          ? this.translateService.translate('collections.edited')
          : this.translateService.translate('collections.saved'),
        duration: DEFAULT_SNACK_BAR_DURATION,
        iconId: 'icon-check-rounded-16',
        iconSize: 24,
      },
    );
    const isProductNotForChannel: boolean = this.route.snapshot.queryParams.prevProductsPath === 'select-products';
    this.sectionsService.resetState$.next(true);
    this.collectionsDataService.isAddingProductsToCollectionProcess$.next(false);
    if (isProductNotForChannel) {
      const url: string[] = ['business', this.envService.businessId, 'products', 'select-products'];
      this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
    } else {
      const url: string[] = ['business', this.envService.businessId, 'products', 'list'];
      this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
    }
  }
}
