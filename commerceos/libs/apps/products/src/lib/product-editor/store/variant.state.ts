import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { ProductTypes } from '../../shared/enums/product.enum';
import { VariantsSection } from '../../shared/interfaces/section.interface';
import { SectionsService } from '../services';

import * as VariantActions from './variant.actions';

const variantStateName = 'variant';

export interface IVariantState {
  loaded: boolean;
  variant: VariantsSection;
}

export const initialState: IVariantState = {
  loaded: false,
  variant: {
    id: null,
    images: [],
    options: [],
    description: '',
    available: false,
    price: 0,
    salePrice: 0,
    onSales: false,
    productType: ProductTypes.Digital,
    sku: '',
    barcode: '',
    inventory: 0,
    lowInventory: 0,
    emailLowStock: false,
    inventoryTrackingEnabled: false,
  },
};

@State<IVariantState>({
  name: variantStateName,
  defaults: initialState,
})
@Injectable()
export class VariantState {
  @Selector()
  static getLoaded({ loaded }: IVariantState): boolean {
    return loaded;
  }

  @Selector()
  static getVariant({ variant }: IVariantState): any {
    return variant;
  }


  constructor(private sectionsService: SectionsService) { }

  @Action(VariantActions.loadVariant)
  loadVariant({ dispatch }: StateContext<IVariantState>, { variantId, isCreated }: VariantActions.loadVariant) {
    return this.sectionsService.getVariantAsync(variantId, isCreated).pipe(
      tap((data: VariantsSection) => {
        dispatch(new VariantActions.variantLoaded(data))
      }),
    );
  }

  @Action(VariantActions.variantLoaded)
  variantLoaded({ patchState }: StateContext<IVariantState>, { variant }: VariantActions.variantLoaded) {
    patchState({
      loaded: true,
      variant,
    });
  }

  @Action(VariantActions.updateVariant)
  variantUpdated({ patchState }: StateContext<IVariantState>, { variant }: VariantActions.updateVariant) {
    patchState({
      loaded: true,
      variant: variant as VariantsSection,
    });
  }

  @Action(VariantActions.cleanVariant)
  variantClear({ setState }: StateContext<IVariantState>) {
    setState(initialState);
  }
}
