import { random } from 'lodash';
import { from, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

// export function ImitateHttp(
//   target: object,
//   propertyName: string,
//   propertyDescriptor: PropertyDescriptor,
// ): PropertyDescriptor {
//   const method = propertyDescriptor.value;

//   propertyDescriptor.value = function (...args: any[]) {
//     return from(method.apply(this, args)).pipe(
//       delay(random(300, 500)),
//     );
//   };
//   return propertyDescriptor;
// }

export function ImitateHttp() {
  let originalFunc: Function;

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    originalFunc = descriptor.value;

    descriptor.value = function (...args: any[]): Observable<any> {

      return from(originalFunc.apply(this, args)).pipe(
        delay(random(300, 500)),
      );

    };
  };
}
