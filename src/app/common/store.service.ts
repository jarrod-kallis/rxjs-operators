import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, timer, from } from 'rxjs';

import { Course } from '../model/course';
import { createHttpObservable } from './util';
import { catchError, finalize, map, retryWhen, delayWhen, shareReplay, tap, exhaustMap } from 'rxjs/operators';
import { debug, LogLevel } from './debugOperator';
import { Lesson } from '../model/lesson';

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

  public selectCourseById(id: number): Observable<Course> {
    return this._courses$
      .pipe(
        map(courses => courses?.find(course => course.id === id))
      );
  }

  private filterCourseByCategory(filterCategory: string): Observable<Course[]> {
    return this._courses$
      .pipe(
        map(courses => courses?.filter(course => course.category === filterCategory))
      );
  }

  public saveCourse(id: number, updatedCourse: Course): Observable<any> {
    // Find course and update it in memory
    const courses = this.coursesSubject.getValue()
      .map(course => {
        if (course.id === id) {
          course = { ...course, ...updatedCourse };
        }

        return course;
      });

    // Emit the optimistic update of the course
    this.coursesSubject.next(courses);

    // Update the course in the DB
    return from(fetch(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedCourse),
      headers: {
        'content-type': 'application/json'
      }
    }));
  }

  public getLessons(courseId: number, filter: string = ''): Observable<Lesson[]> {
    return createHttpObservable(`/api/lessons?courseId=${courseId}&filter=${filter}&pageSize=100`)
      .pipe(
        map(response => response['payload']),
        debug(LogLevel.DEBUG, 'Lessons')
      );
  }
}
