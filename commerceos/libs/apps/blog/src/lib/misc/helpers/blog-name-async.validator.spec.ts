import { Observable, of } from 'rxjs';

import { PebShopsApi } from '@pe/builder-api';

import { blogNameAsyncValidator } from './blog-name-async.validator';

describe('blogNameAsyncValidator', () => {

  const apiSpy = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', ['validateShopName']);

  const validatorFn = blogNameAsyncValidator(apiSpy, {} as any);

  it('should validate', () => {

    const controlMock = {
      dirty: false,
      value: 'new shop',
    };

    // control.dirty = FALSE
    expect(validatorFn(controlMock as any)).toBeNull();
    expect(apiSpy.validateShopName).not.toHaveBeenCalled();

    // control.dirty = TRUE
    // INVALID
    controlMock.dirty = true;
    apiSpy.validateShopName.and.returnValue(of(false));

    (validatorFn(controlMock as any) as Observable<any>)
      .subscribe((errors) => expect(errors).toEqual({ unique: true })).unsubscribe();
    expect(apiSpy.validateShopName).toHaveBeenCalledWith(controlMock.value);

    // VALID
    apiSpy.validateShopName.and.returnValue(of(true));

    (validatorFn(controlMock as any) as Observable<any>)
      .subscribe(errors => expect(errors).toBeNull()).unsubscribe();

  });

});
