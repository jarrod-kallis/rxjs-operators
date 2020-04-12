import { Component, OnInit } from '@angular/core';
import { interval, Observable, of, timer, throwError } from 'rxjs';
import { catchError, delayWhen, map, retryWhen, shareReplay, tap, filter, finalize, delay } from 'rxjs/operators';

import { Course } from '../model/course';
import { createHttpObservable } from '../common/util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;

  constructor() {

  }

  ngOnInit() {

    const courses$: Observable<Course[]> = createHttpObservable('/api/courses')
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
        tap(() => console.log('This will be logged once')),
        // Everything above in the chain will be shared.
        // This prevents 2 subscriptions to the same stream from making separate http calls
        // IOW they will share the result
        shareReplay(),
        tap(() => console.log('This will be logged twice'))
      );

    this.beginnerCourses$ = courses$
      .pipe(
        map((courses: Course[]) => this.filterCourseByCategory(courses, 'BEGINNER'))
      );

    this.advancedCourses$ = courses$
      .pipe(
        map((courses: Course[]) => this.filterCourseByCategory(courses, 'ADVANCED'))
      );
  }

  filterCourseByCategory(courses: Course[], filterCategory: string): Course[] {
    return courses?.filter(course => course.category === filterCategory);
  }
}
