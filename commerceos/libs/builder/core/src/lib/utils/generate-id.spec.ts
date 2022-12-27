import * as uuid from 'uuid';

import { pebGenerateId } from './generate-id';

describe('Utils:Generate Id', () => {

  it('should generate id', () => {

    Object.defineProperty(uuid, 'v4', {
      value: uuid.v4,
      writable: true,
    });
    const uuidSpy = spyOn(uuid, 'v4').and.returnValue('uuid-001');

    expect(pebGenerateId()).toEqual('uuid-001');
    expect(uuidSpy).toHaveBeenCalled();

  });

});
