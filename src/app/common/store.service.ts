import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';

import { Course } from '../model/course';
import { createHttpObservable } from './util';
import { catchError, finalize, map, retryWhen, delayWhen, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private _courses$: Observable<Course[]> = this.coursesSubject.asObservable();

  constructor() { }

  public get courses$(): Observable<Course[]> {
    return this._courses$;
  }

  public init() {
    createHttpObservable('/api/courses')
      .pipe(
        // NB!! If catchError & finalize are after shareReplay in the observable chain, then they will be executed twice,
        //      because everything above shareReplay in the chain is shared and only invoked once
        // Must return a new observable, which will replace the errored observable, or rethrow the error
        catchError(error => {
          console.log(error.message);
          // return of([]);
          return throwError(error);
        }),
        // Called after observable completes or errors out
        finalize(() => {
          console.log('Finalised...');
        }),
        map(payload => {
          console.log('Map payload');
          return payload['payload'];
        }),
        // Retry the http request whenever there is an error

        // Returning the errors observable immediately will cause the request to be retried immediately
        // retryWhen(errors => errors),

        // Delay the next http request by 2 seconds
        retryWhen(errors => errors.pipe(
          // Still don't understand the fundamental difference between delay & delayWhen
          delayWhen(() => timer(2000))
          // delay(2000)
        )),
        // tap(() => console.log('This will be logged once')),
        // Everything above in the chain will be shared.
        // This prevents 2 subscriptions to the same stream from making separate http calls
        // IOW they will share the result
        // shareReplay(),
        // tap(() => console.log('This will be logged twice'))
      )
      .subscribe(courses => this.coursesSubject.next(courses));
  }

  public selectBeginnerCourses(): Observable<Course[]> {
    return this.filterCourseByCategory('BEGINNER');
  }

  public selectAdvancedCourses(): Observable<Course[]> {
    return this.filterCourseByCategory('ADVANCED');
  }

  private filterCourseByCategory(filterCategory: string): Observable<Course[]> {
    return this._courses$
      .pipe(
        map(courses => courses?.filter(course => course.category === filterCategory))
      );
  }
}
