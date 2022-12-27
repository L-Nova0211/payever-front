import { DomSanitizer } from '@angular/platform-browser';

import { SafeStylePipe } from './safe-style.pipe';

describe('SafeStylePipe', () => {

  let pipe: SafeStylePipe;
  let domSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {

    domSanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustStyle: 'sanitized',
    });

    pipe = new SafeStylePipe(domSanitizer);

  });

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    const style = 'transform: scale(1.5);';

    expect(pipe.transform(style)).toEqual('sanitized' as any);
    expect(domSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith(style);

  });

});
