import { Observable, Observer } from 'rxjs';

export function createHttpObservable(url: string): Observable<any> {
  return Observable.create((observer: Observer<any>) => {
    const abortController = new AbortController();
    // If the signal emits a value of true the fecth operation will be cancelled by the browser
    const abortSignal: AbortSignal = abortController.signal;

    fetch(url, { signal: abortSignal })
      .then(response => response.json())
      .then(body => {
        observer.next(body);
        observer.complete();
      })
      .catch(error => observer.error(error));

    // The method returned by the created observable is the unsubscribe function
    return () => abortController.abort();
  });
}
