import { Observable } from 'rxjs';

/*
Example of usage:

emit<string>('shop.created', shopId);
listen<string>('shop.created').pipe(tap(...)).subscribe();

*/

export abstract class MessageBus {

  abstract emit<T>(event: string, payload: T): void;

  abstract listen<T>(event: string): Observable<T>;
}
