import { pebCreateLogger } from './create-logger';

describe('Utils:Create Logger', () => {

  it('should create logger', () => {

    const logSpy = spyOn(console, 'log');
    let namespace = 'namespace';

    expect(pebCreateLogger(namespace)()).toBeUndefined();

    namespace = 'editor:actions';

    expect(pebCreateLogger(namespace)()).toBeUndefined();
    expect(logSpy).toHaveBeenCalled();

  });

});
