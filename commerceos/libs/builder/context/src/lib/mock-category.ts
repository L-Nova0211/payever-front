import { PebElementContextState } from '@pe/builder-core';

export const mockShopCategory = {
  data: {
    sortBy: 'abc',
    shownFilters: false,
    activatedFilters: [],
    disabledFilters: [],
    title: 'Category Title',
    image: '',
    filters: [
      {
        name: 'Product Type A',
        active: true,
        disabled: false,
        children: [
          {
            name: 'Product A',
            active: true,
            disabled: false,
          },
          {
            name: 'Product B',
            active: false,
            disabled: false,
          },
          {
            name: 'Product C',
            active: false,
            disabled: false,
          },
          {
            name: 'Product D',
            active: false,
            disabled: false,
          },
          {
            name: 'Product E',
            active: false,
            disabled: false,
          },
        ],
      },
      {
        name: 'Product Type B',
        active: true,
        disabled: false,
        children: [
          {
            name: 'Product A',
            active: true,
            disabled: false,
          },
          {
            name: 'Product B',
            active: false,
            disabled: true,
          },
          {
            name: 'Product C',
            active: false,
            disabled: true,
          },
        ],
      },
    ],
    products: [
      {
        data: {
          title: 'Product A',
          price: '39.00',
          image: null,
          currency: 'EUR',
        },
        state: PebElementContextState.Ready,
      },
      {
        data: {
          title: 'Product B',
          price: '39.00',
          image: null,
          currency: 'EUR',
        },
        state: PebElementContextState.Ready,
      },
      {
        data: {
          title: 'Product C',
          price: '39.00',
          image: null,
          currency: 'EUR',
        },
        state: PebElementContextState.Ready,
      },
      {
        data: {
          title: 'Product D',
          price: '39.00',
          image: null,
          currency: 'EUR',
        },
        state: PebElementContextState.Ready,
      },
      {
        data: {
          title: 'Product E',
          price: '39.00',
          image: null,
          currency: 'EUR',
        },
        state: PebElementContextState.Ready,
      },
      {
        data: {
          title: 'Product F',
          price: '39.00',
          image: null,
          currency: 'EUR',
        },
        state: PebElementContextState.Ready,
      },
    ],
  },
  state: PebElementContextState.Ready,
};
