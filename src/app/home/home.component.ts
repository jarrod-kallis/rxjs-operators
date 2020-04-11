import { Component, OnInit } from '@angular/core';
import { interval, Observable, of, timer } from 'rxjs';
import { catchError, delayWhen, map, retryWhen, shareReplay, tap, filter } from 'rxjs/operators';

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
        map(payload => payload['payload']),
        // Prevents 2 subscriptions to the same stream from making separate http calls
        // IOW they will share the result
        shareReplay()
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
    return courses.filter(course => course.category === filterCategory);
  }
}
