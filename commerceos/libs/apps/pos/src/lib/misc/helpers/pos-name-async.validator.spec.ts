import { Observable, of } from 'rxjs';

import { PosApi } from '../../services/pos/abstract.pos.api';

import { terminalNameAsyncValidator } from './pos-name-async.validator';

describe('terminalNameAsyncValidator', () => {

  const apiSpy = jasmine.createSpyObj<PosApi>('PosApi', ['validatePosName']);

  const validatorFn = terminalNameAsyncValidator(apiSpy);

  it('should validate', () => {

    const controlMock = {
      dirty: false,
      value: 'new shop',
    };

    // control.dirty = FALSE
    expect(validatorFn(controlMock as any)).toBeNull();
    expect(apiSpy.validatePosName).not.toHaveBeenCalled();

    // control.dirty = TRUE
    // INVALID
    controlMock.dirty = true;
    apiSpy.validatePosName.and.returnValue(of(false));

    (validatorFn(controlMock as any) as Observable<any>)
      .subscribe(errors => expect(errors).toEqual({ unique: true })).unsubscribe();
    expect(apiSpy.validatePosName).toHaveBeenCalledWith(controlMock.value);

    // VALID
    apiSpy.validatePosName.and.returnValue(of(true));

    (validatorFn(controlMock as any) as Observable<any>)
      .subscribe(errors => expect(errors).toBeNull()).unsubscribe();

  });

});
