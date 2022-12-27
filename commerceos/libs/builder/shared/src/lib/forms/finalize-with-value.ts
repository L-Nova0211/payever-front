import { defer, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

export function finalizeWithValue<T>(callback: (value: T) => void) {
  return (source: Observable<T>) => defer(() => {
    let lastValue: T;

    return source.pipe(
      tap(value => {
        lastValue = value
      }),
      finalize(() => {
        if (lastValue !== undefined) {
          callback(lastValue)
        }
      }),
    );
  });
}
