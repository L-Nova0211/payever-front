import { defer, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { PebElementType } from '@pe/builder-core';
import { PebAbstractElement } from '@pe/builder-renderer';


export const getMinElementsDimensions = (elm: PebAbstractElement) => {
  switch (elm.element.type) {
    case PebElementType.Text:
      return {
        width: 1,
        height: 1,
      };
    case PebElementType.Shape:
      return {
        width: 1,
        height: 1,
      };
    case PebElementType.Grid:
      return {
        width: 10,
        height: 10,
      };
    default:
      return {
        width: 20,
        height: 20,
      };
  }
}
export const round = (number: number, precision = 15) => {
  return Math.round(number * precision) / precision;
}

export function finalizeWithValue<T>(callback: (value: T) => void) {
  return (source: Observable<T>) => defer(() => {
    let lastValue: T;

    return source.pipe(
      tap(value => {
        lastValue = value
      }),
      finalize(() => {
        if (lastValue) {
          callback(lastValue)
        }
      }),
    );
  });
}
