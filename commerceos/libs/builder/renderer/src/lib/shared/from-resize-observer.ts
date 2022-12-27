import resizeObserverPolyfill from 'resize-observer-polyfill';
import { Observable } from 'rxjs';


export function fromResizeObserver(element: HTMLElement): Observable<Partial<DOMRectReadOnly>> {
  return new Observable((observer) => {
    const resizeObserver = new resizeObserverPolyfill((entry) => {
      observer.next(entry[0].contentRect);
      try { // try catch for ssr
        window.requestAnimationFrame(() => {
          resizeObserver.observe(element);
        });
      } catch (e) {
        resizeObserver.observe(element);
      }
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  });
}
