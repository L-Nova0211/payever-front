import { DomSanitizer } from '@angular/platform-browser';

import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {

  const sanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
    bypassSecurityTrustHtml: 'bypassed',
  });
  const pipe = new SafeHtmlPipe(sanitizer);

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    expect(pipe.transform('test')).toEqual('bypassed');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('test');

  });

});
