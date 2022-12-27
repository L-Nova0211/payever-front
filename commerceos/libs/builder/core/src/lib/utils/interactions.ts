import { PebIntegrationFilter, PebOrderDirection, PebProduct } from '../models/api';
import { PebLanguage, PebPageVariant } from '../models/client';
import { PebLink } from '../models/element';

export enum PebInteractionType {
  NavigateInternal = 'navigate.internal-page',
  NavigateInternalSpecial = 'navigate.internal-special-page',
  NavigateExternal = 'navigate.external-page',
  NavigateEmail = 'navigate.email',
  NavigateApplicationLink = 'navigate.application-link',

  NavigationToggleMobileMenu = 'navigation.toggle-mobile-menu',
  NavigationHideMobileMenu = 'navigation.hide-mobile-menu',
  NavigationShowDropdown = 'navigation.show-dropdown',

  OverlayOpenPage = 'overlay.open.page',
  OverlayClose = 'overlay.close',

  SnackbarShowMessage = 'snackbar.show-message',

  CartClick = 'cart.click',

  CategoryToggleFilters = 'category.toggle-filters',
  CategoryToggleVariantFilter = 'category.toggle-variant-filter',
  CategoryToggleCategoryFilter = 'category.toggle-category-filter',
  CategorySort = 'category.sort',
  CategoryResetFilters = 'category.reset-filters',
  CategoryToggleProductsDisplay = 'category.change-products-display',
  CategorySearchProducts = 'category.search-products',

  ProductAddToCart = 'product.add-to-cart',
  ProductMultiAddToCart = 'product.multi-add-to-cart',

  CheckoutOpenAmount = 'checkout.open-amount',
  CheckoutOpenQr = 'checkout.open-qr',

  PosCatalogToggleFilters = 'pos-catalog.toggle-filters',
  PosCatalogToggleFilter = 'pos-catalog.toggle-filter',
  PosCatalogSort = 'pos-catalog.sort',
  PosCatalogResetFilters = 'pos-catalog.reset-filters',
  PosCatalogToggleProductsDisplay = 'pos-catalog.change-products-display',
  PosCatalogSearchProducts = 'pos-catalog.search-products',
  PosCatalogShowProductDetails = 'pos-catalog.show-product-details',

  ChangeLanguage = 'change-language',

  GridProductsFilterSelect = 'grid-products-filter-select',
  GridProductsSortSelect = 'grid-products-sort-select',
  GridCategoryClick = 'grid-category-click',

  IntegrationLinkPropertyContextUpdate = 'integration.link-property-context-update',
  IntegrationSubmitForm = 'integration.submit-form',

  SetPagePassword = 'set.page.password',
}

export interface PebInteraction {
  type: PebInteractionType;
}

export interface PebInteractionWithPayload<P = any> extends PebInteraction {
  payload: P;
  context?: any;
}

function createInteraction(type: PebInteractionType): PebInteraction;
function createInteraction<P>(type: PebInteractionType, payload: P): PebInteractionWithPayload<P>;
function createInteraction<P>(type: PebInteractionType, payload?: P) {
  return payload === undefined ? { type } : { type, payload };
}

export const pebInteractionCreator = {
  grid: {
    category: {
      click: (slug: string) =>
        createInteraction(PebInteractionType.GridCategoryClick, slug),
    },
    products: {
      filterSelect: (filter: PebIntegrationFilter, values: any[]) =>
        createInteraction(PebInteractionType.GridProductsFilterSelect, { filter, values }),
      sortSelect: (sort, values) =>
        createInteraction(PebInteractionType.GridProductsSortSelect, { sort, values }),
    },
  },
  language: {
    change: (language: PebLanguage) => createInteraction(PebInteractionType.ChangeLanguage, language),
  },
  navigate: {
    internal: (id: string) => createInteraction(PebInteractionType.NavigateInternal, id),
    internalSpecial: (variant: PebPageVariant, value: string, inOverlay = false) =>
      createInteraction(PebInteractionType.NavigateInternalSpecial, { variant, value, inOverlay }),
    external: <T = PebLink | string>(interaction: T) =>
      createInteraction<T>(PebInteractionType.NavigateExternal, interaction),
    mail: (payload: { to: string, subject: string }) =>
      createInteraction(PebInteractionType.NavigateEmail, payload),
    overlay: (id: string) => createInteraction(PebInteractionType.OverlayOpenPage, id),
  },
  navigation: {
    toggleMobileMenu: () => createInteraction(PebInteractionType.NavigationToggleMobileMenu),
    hideMobileMenu: () => createInteraction(PebInteractionType.NavigationHideMobileMenu),
    showDropdown: () => createInteraction(PebInteractionType.NavigationShowDropdown),
  },
  cart: {
    click: () => createInteraction(PebInteractionType.CartClick),
  },
  category: {
    toggleFilters: () => createInteraction(PebInteractionType.CategoryToggleFilters),
    toggleVariantFilter: (variant: string) =>
      createInteraction(PebInteractionType.CategoryToggleVariantFilter, variant),
    toggleCategoryFilter: (category: string) =>
      createInteraction(PebInteractionType.CategoryToggleCategoryFilter, category),
    sort: (value: PebOrderDirection) => createInteraction(PebInteractionType.CategorySort, value),
    resetFilters: () => createInteraction(PebInteractionType.CategoryResetFilters),
    toggleProductsDisplay: () => createInteraction(PebInteractionType.CategoryToggleProductsDisplay),
    searchProducts: (value: string) => createInteraction(PebInteractionType.CategorySearchProducts, value),
  },
  product: {
    addToCart: (product: PebProduct) => createInteraction(PebInteractionType.ProductAddToCart, product),
    multiAddToCart: (product: PebProduct[]) => createInteraction(PebInteractionType.ProductMultiAddToCart, product),
  },
  checkout: {
    openAmount: () => createInteraction(PebInteractionType.CheckoutOpenAmount),
    openQr: () => createInteraction(PebInteractionType.CheckoutOpenQr),
  },
  pos: {
    catalog: {
      toggleFilters: () => createInteraction(PebInteractionType.PosCatalogToggleFilters),
      toggleFilter: (filter: Partial<PebProduct>) =>
        createInteraction(PebInteractionType.PosCatalogToggleFilter, filter),
      sort: (value: PebOrderDirection) => createInteraction(PebInteractionType.PosCatalogSort, value),
      resetFilters: () => createInteraction(PebInteractionType.PosCatalogResetFilters),
      toggleProductsDisplay: () => createInteraction(PebInteractionType.PosCatalogToggleProductsDisplay),
      searchProducts: (value: string) => createInteraction(PebInteractionType.PosCatalogSearchProducts, value),
    },
    product: {
      showDetails: (id: string) => createInteraction(PebInteractionType.PosCatalogShowProductDetails, id),
    },
  },
};
