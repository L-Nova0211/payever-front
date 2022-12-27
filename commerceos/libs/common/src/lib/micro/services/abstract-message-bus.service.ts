import { Observable } from 'rxjs';

/*
Example of usage:

emit<string>('shop.created', shopId);
listen<string>('shop.created').pipe(tap(...)).subscribe();

*/

export abstract class MessageBus<T = any> {

  abstract emit(event: T, payload: any): void;

  abstract listen<P = any>(event: T): Observable<P>;
}

export interface AbstractBusInterface<T> {
  listen<P = any>(event: T): Observable<P>;
}
