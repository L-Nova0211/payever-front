import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { SaveProducts, ClearProducts } from './products.action';

const productsStateName = 'productsStateName';

export interface ProductsStateModel {
  products: any;
}

@State<ProductsStateModel>({
  name: productsStateName,
  defaults: {
    products: [],
  },
})
@Injectable()
export class ProductsState {
  @Selector()
  static products(state: ProductsStateModel): any {
    return state.products;
  }

  @Action(SaveProducts)
  saveProducts(
    ctx: StateContext<ProductsStateModel>,
    action: SaveProducts
  ) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      products: action.payload,
    });
  }

  @Action(ClearProducts)
  clearProducts(ctx: StateContext<ProductsStateModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      products: [],
    });
  }
}
