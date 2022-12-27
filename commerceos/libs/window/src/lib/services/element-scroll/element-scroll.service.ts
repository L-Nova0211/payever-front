import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type Target = Document | Element;

@Injectable({
  providedIn: 'root',
})
export class ElementScrollPercentage {
  public getScroll(node: Target = document): number {
    return this.getCurrentScroll(node);
  }

  public getScrollAsStream(node: Target = document): Observable<number> {
    let stream: Observable<any>;
    if (node instanceof Document) {
      // When we watch the DOCUMENT, we need to pull the scroll event from the
      // WINDOW, but then check the scroll offsets of the DOCUMENT.
      stream = fromEvent(window, 'scroll').pipe(
        map((event: UIEvent): number => {
          return this.getScroll(node);
        }),
      );
    } else {
      // When we watch an ELEMENT node, we can pull the scroll event and the scroll
      // offsets from the same ELEMENT node (unlike the Document version).
      stream = fromEvent(node, 'scroll').pipe(
        map((event: UIEvent): number => {
          return this.getScroll(node);
        }),
      );
    }

    return stream;
  }

  // maximum scroll offset (in pixels) of the given DOM node.
  public getMaxScroll(node: Target): number {
    if (node instanceof Document) {
      const scrollHeight: number = Math.max(
        node.body.scrollHeight,
        node.body.offsetHeight,
        node.body.clientHeight,
        node.documentElement.scrollHeight,
        node.documentElement.offsetHeight,
        node.documentElement.clientHeight,
      );
      const clientHeight: number = node.documentElement.clientHeight;

      return scrollHeight - clientHeight;
    }

    return node.scrollHeight - node.clientHeight;
  }

  private getCurrentScroll(node: Target): number {
    if (node instanceof Document) {
      return window.pageYOffset;
    }

    return node.scrollTop;
  }
}
