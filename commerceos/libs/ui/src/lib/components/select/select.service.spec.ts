import { SelectService } from './select.service';

describe('SelectService', () => {

  let service: SelectService;

  beforeEach(() => {

    service = new SelectService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should register & get select', () => {

    const selectIn = { test: true } as any;

    service.register(selectIn);
    expect(service.getSelect()).toEqual(selectIn);

  });

});
