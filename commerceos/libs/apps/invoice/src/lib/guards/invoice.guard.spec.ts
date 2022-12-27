import { PeInvoiceApi } from '../services/abstract.invoice.api';

import { PebInvoiceGuard } from './invoice.guard';

describe('PebInvoiceGuard', () => {

  let guard: PebInvoiceGuard;
  let api: jasmine.SpyObj<PeInvoiceApi>;
  let envService: any;

  beforeEach(() => {

    api = jasmine.createSpyObj<PeInvoiceApi>('PeInvoiceApi', [
      'getInvoiceList',
      'getSingleInvoice',
      'createInvoice',
    ]);

    envService = {
      shopId: undefined,
      businessData: {
        name: 'Invoice',
      },
    };

    guard = new PebInvoiceGuard(api, envService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();
  });
});
