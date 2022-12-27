import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Cache, CacheEntry, MAX_CACHE_AGE } from './cache';

@Injectable()
export class PebCacheMapService implements Cache {
  cacheMap = new Map<string, CacheEntry>();
  get(req: HttpRequest<any>): HttpResponse<any> | null {
    const entry = this.cacheMap.get(req.urlWithParams);
    if (!entry) {
      return null;
    }
    const isExpired = (Date.now() - entry.entryTime) > MAX_CACHE_AGE;

    return isExpired ? null : entry.response;
  }

  put(req: HttpRequest<any>, res: HttpResponse<any>): void {
    const entry: CacheEntry = { url: req.urlWithParams, response: res, entryTime: Date.now() };
    this.cacheMap.set(req.urlWithParams, entry);
    this.deleteExpiredCache();
  }

  private deleteExpiredCache() {
    this.cacheMap.forEach((entry) => {
      if ((Date.now() - entry.entryTime) > MAX_CACHE_AGE) {
        this.cacheMap.delete(entry.url);
      }
    });
  }
}
