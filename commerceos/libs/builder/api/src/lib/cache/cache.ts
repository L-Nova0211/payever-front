import { HttpRequest, HttpResponse } from '@angular/common/http';

export abstract class Cache {
  abstract get(req: HttpRequest<any>): HttpResponse<any> | null;
  abstract put(req: HttpRequest<any>, res: HttpResponse<any>): void;
}

export interface CacheEntry {
  url: string;
  response: HttpResponse<any>;
  entryTime: number;
}

export const MAX_CACHE_AGE = 20000; // in milliseconds
