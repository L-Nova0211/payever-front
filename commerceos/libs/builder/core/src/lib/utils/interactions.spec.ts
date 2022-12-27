import { PebIntegrationFilterType } from '../models/api';
import { PebLanguage, PebPageVariant } from '../models/client';

import { pebInteractionCreator, PebInteractionType } from './interactions';

describe('Utils:Interactions', () => {

  const interactionCreator = pebInteractionCreator;

  it('should call the correct function with correct argument', () => {

    const id = '000';
    const value = 'value';
    const product = {
      id: '000',
      title: 'product-001',
    };
    let interaction: any;

    // GridCategoryClick
    interaction = {
      type: PebInteractionType.GridCategoryClick,
      payload: 'slug',
    };

    expect(interactionCreator.grid.category.click('slug')).toEqual(interaction);

    // GridProductsFilterSelect
    interaction = {
      type: PebInteractionType.GridProductsFilterSelect,
      payload: {
        filter: {
          field: 'id',
          type: PebIntegrationFilterType.Select,
          title: 'Select filter',
        },
        values: ['test'],
      },
    };

    expect(interactionCreator.grid.products.filterSelect(interaction.payload.filter, interaction.payload.values))
      .toEqual(interaction);

    // GridProductsSortSelect
    interaction = {
      type: PebInteractionType.GridProductsSortSelect,
      payload: {
        sort: 'id',
        values: [value],
      },
    };

    expect(interactionCreator.grid.products.sortSelect('id', [value])).toEqual(interaction);

    // ChangeLanguage
    interaction = {
      type: PebInteractionType.ChangeLanguage,
      payload: PebLanguage.Chinese,
    };

    expect(interactionCreator.language.change(PebLanguage.Chinese)).toEqual(interaction);

    // NavigateInternal
    interaction = {
      type: PebInteractionType.NavigateInternal,
      payload: id,
    };

    expect(interactionCreator.navigate.internal(id)).toEqual(interaction);

    // NavigateInternalSpecial
    interaction = {
      type: PebInteractionType.NavigateInternalSpecial,
      payload: {
        value,
        variant: PebPageVariant.Default,
        inOverlay: false,
      },
    };

    expect(interactionCreator.navigate.internalSpecial(PebPageVariant.Default, value)).toEqual(interaction);

    // NavigateExternal
    interaction = {
      type: PebInteractionType.NavigateExternal,
      payload: value,
    };

    expect(interactionCreator.navigate.external(value)).toEqual(interaction);

    // NavigationToggleMobileMenu
    interaction = {
      type: PebInteractionType.NavigationToggleMobileMenu,
    };

    expect(interactionCreator.navigation.toggleMobileMenu()).toEqual(interaction);

    // NavigationHideMobileMenu
    interaction = {
      type: PebInteractionType.NavigationHideMobileMenu,
    };

    expect(interactionCreator.navigation.hideMobileMenu()).toEqual(interaction);

    // NavigationShowDropdown
    interaction = {
      type: PebInteractionType.NavigationShowDropdown,
    };

    expect(interactionCreator.navigation.showDropdown()).toEqual(interaction);

    // CartClick
    interaction = {
      type: PebInteractionType.CartClick,
    };

    expect(interactionCreator.cart.click()).toEqual(interaction);

    // CategoryToggleFilters
    interaction = {
      type: PebInteractionType.CategoryToggleFilters,
    };

    expect(interactionCreator.category.toggleFilters()).toEqual(interaction);

    // CategoryToggleVariantFilter
    interaction = {
      type: PebInteractionType.CategoryToggleVariantFilter,
      payload: value,
    };

    expect(interactionCreator.category.toggleVariantFilter(value)).toEqual(interaction);

    // CategoryToggleCategoryFilter
    interaction = {
      type: PebInteractionType.CategoryToggleCategoryFilter,
      payload: value,
    };

    expect(interactionCreator.category.toggleCategoryFilter(value)).toEqual(interaction);

    // CategorySort
    interaction = {
      type: PebInteractionType.CategorySort,
      payload: value,
    };

    expect(interactionCreator.category.sort(value)).toEqual(interaction);

    // CategoryResetFilters
    interaction = {
      type: PebInteractionType.CategoryResetFilters,
    };

    expect(interactionCreator.category.resetFilters()).toEqual(interaction);

    // CategoryToggleProductsDisplay
    interaction = {
      type: PebInteractionType.CategoryToggleProductsDisplay,
    };

    expect(interactionCreator.category.toggleProductsDisplay()).toEqual(interaction);

    // CategorySearchProducts
    interaction = {
      type: PebInteractionType.CategorySearchProducts,
      payload: value,
    };

    expect(interactionCreator.category.searchProducts(value)).toEqual(interaction);

    // ProductAddToCart
    interaction = {
      type: PebInteractionType.ProductAddToCart,
      payload: product,
    };

    expect(interactionCreator.product.addToCart(product as any)).toEqual(interaction);

    // ProductMultiAddToCart
    interaction = {
      type: PebInteractionType.ProductMultiAddToCart,
      payload: [product],
    };

    expect(interactionCreator.product.multiAddToCart([product] as any)).toEqual(interaction);

    // CheckoutOpenAmount
    interaction = {
      type: PebInteractionType.CheckoutOpenAmount,
    };

    expect(interactionCreator.checkout.openAmount()).toEqual(interaction);

    // CheckoutOpenQr
    interaction = {
      type: PebInteractionType.CheckoutOpenQr,
    };

    expect(interactionCreator.checkout.openQr()).toEqual(interaction);

    // PosCatalogToggleFilters
    interaction = {
      type: PebInteractionType.PosCatalogToggleFilters,
    };

    expect(interactionCreator.pos.catalog.toggleFilters()).toEqual(interaction);

    // PosCatalogToggleFilter
    interaction = {
      type: PebInteractionType.PosCatalogToggleFilter,
      payload: value,
    };

    expect(interactionCreator.pos.catalog.toggleFilter(value as any)).toEqual(interaction);

    // PosCatalogSort
    interaction = {
      type: PebInteractionType.PosCatalogSort,
      payload: value,
    };

    expect(interactionCreator.pos.catalog.sort(value)).toEqual(interaction);

    // PosCatalogResetFilters
    interaction = {
      type: PebInteractionType.PosCatalogResetFilters,
    };

    expect(interactionCreator.pos.catalog.resetFilters()).toEqual(interaction);

    // PosCatalogToggleProductsDisplay
    interaction = {
      type: PebInteractionType.PosCatalogToggleProductsDisplay,
    };

    expect(interactionCreator.pos.catalog.toggleProductsDisplay()).toEqual(interaction);

    // PosCatalogSearchProducts
    interaction = {
      type: PebInteractionType.PosCatalogSearchProducts,
      payload: value,
    };

    expect(interactionCreator.pos.catalog.searchProducts(value)).toEqual(interaction);

    // PosCatalogShowProductDetails
    interaction = {
      type: PebInteractionType.PosCatalogShowProductDetails,
      payload: id,
    };

    expect(interactionCreator.pos.product.showDetails(id)).toEqual(interaction);

  });

});
