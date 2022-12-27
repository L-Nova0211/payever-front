import * as utils from '../../utils';
import { PebRendererTranslatePipe } from './renderer-translate.pipe';

describe('PebRendererTranslatePipe', () => {

  const translateService: any = { test: 'translate.service' };
  const pipe = new PebRendererTranslatePipe(translateService);

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    Object.defineProperty(utils, 'rendererTranslate', {
      value: utils.rendererTranslate,
      writable: true,
    });

    const spy = spyOn(utils, 'rendererTranslate').and.returnValue('translated');
    const options: any = { test: 'options' };

    expect(pipe.transform('test', options)).toEqual('translated');
    expect(spy).toHaveBeenCalledWith('test', options, translateService);

  });

});
