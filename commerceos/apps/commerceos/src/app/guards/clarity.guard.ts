import { Inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Injectable()
export class ClarityGuard implements CanActivate {
  readonly GTM = 'GTM-MBL7K5';
  readonly elemId = 'pe-clarity';

  constructor(@Inject(PE_ENV) private env: EnvironmentConfigInterface) {}

  canActivate(): boolean {
    if (!document.getElementById(this.elemId)) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = this.elemId;
      script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${(this.env.config as any)
        .clarityId || '44u5ips3u9'}");`; // remove "as any" once EnvironmentConfigInterface is updated
      document.getElementsByTagName('head')[0].appendChild(script);
    }

    return true;
  }
}
