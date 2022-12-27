export const mockProductDetails = {
  state: 'ready',
  data: {
    title: '',
    price: '',
    images: [
      '/assets/showcase-images/products/6.png',
    ],
    currency: 'EUR',
    variants: [
      {
        id: 'variant_1',
        title: 'Product Title',
        description: 'Product Description',
        price: 100.00,
        options: [
          {
            id: 'option_1',
            name: 'Variant',
            value: 'First',
          },
        ],
      },
      {
        id: 'variant_2',
        title: 'Product Title',
        description: 'Product Description',
        price: 100.00,
        options: [
          {
            id: 'option_1',
            name: 'Variant',
            value: 'Second',
          },
        ],
      },
    ],
    description: '',
  },
};
