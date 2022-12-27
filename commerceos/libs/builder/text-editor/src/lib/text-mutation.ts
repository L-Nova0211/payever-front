import { Observable } from 'rxjs';

export const observeTextMutation = (
  target: HTMLElement,
  config = { characterData: true, attributes: false, childList: true, subtree: false },
): Observable<MutationRecord[]> => {
  return new Observable((observer) => {
    const mutation = new MutationObserver((mutations) => {
      observer.next(mutations);
    });
    mutation.observe(target, config);

    return () => {
      mutation.disconnect();
    };
  });
};
