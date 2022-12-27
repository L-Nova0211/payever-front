import { DomSanitizer } from '@angular/platform-browser';

import { SafeUrlPipe } from './safe-url.pipe';

describe('SafeUrlPipe', () => {

  let pipe: SafeUrlPipe;
  let domSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {

    domSanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustUrl: 'sanitized',
    });

    pipe = new SafeUrlPipe(domSanitizer);

  });

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    const url = 'https://payever.de';

    expect(pipe.transform(url)).toEqual('sanitized' as any);
    expect(domSanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(url);

  });

});
