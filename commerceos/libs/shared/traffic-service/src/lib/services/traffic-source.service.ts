import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { TrafficSourceInterface } from '@pe/api';

@Injectable({ providedIn:'root' })
export class TrafficSourceService {
  private routeSub: Subscription;
  private readonly storageKey: string = 'trafficSource';

  constructor(
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
  ) {
  }

  saveSource() {
    // subs to route query params
    this.routeSub = this.route.queryParams.subscribe((params) => {
      const source: string = this.domSanitizer.sanitize(SecurityContext.URL, params.source);
      const medium: string = this.domSanitizer.sanitize(SecurityContext.URL, params.medium);
      const campaign: string = this.domSanitizer.sanitize(SecurityContext.URL, params.campaign);
      const content: string = this.domSanitizer.sanitize(SecurityContext.URL, params.content);

      const trafficSource: TrafficSourceInterface = {
        source: source || '',
        medium: medium || '',
        campaign: campaign || '',
        content: content || '',
      };
      if (this.isSourceValid(trafficSource)) {
        sessionStorage.setItem(this.storageKey, JSON.stringify(trafficSource));
      }
    });
  }

  // returns source if valid, if not null
  getSource(): TrafficSourceInterface {
    const sourceStorage: string = sessionStorage.getItem(this.storageKey);

    // if no data saved return
    if (!sourceStorage) {
      return null;
    }

    const source = JSON.parse(sourceStorage);

    if (this.isSourceValid(source)) {
      return source as TrafficSourceInterface;
    }

    return null;
  }

  removeSource(): void {
    sessionStorage.removeItem(this.storageKey);
  }

  private isSourceValid(source: TrafficSourceInterface): boolean {
    return (source.source !== '' || source.medium !== '' || source.campaign !== '' || source.content !== '');
  }
}
