import { Observable, Observer } from 'rxjs';

export function createHttpObservable(url: string): Observable<any> {
  return Observable.create((observer: Observer<any>) => {
    const abortController = new AbortController();
    // If the signal emits a value of true the fecth operation will be cancelled by the browser
    const abortSignal: AbortSignal = abortController.signal;

    fetch(url, { signal: abortSignal })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          console.log(response);
          throw new Error(`Unable to perform request: Code: ${response.status} Msg: ${response.statusText}`);
        }
      })
      .then(body => {
        observer.next(body);
        observer.complete();
      })
      // This error block is only triggered in the case of a fatal error, ie. network failure,
      // Something that the browser cannot recover from
      .catch(error => {
        // console.error('FETCH ERROR:', error);
        observer.error(error);
      });

    // The method returned by the created observable is the unsubscribe function
    return () => abortController.abort();
  });
}
