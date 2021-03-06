import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  map,
  concatMap,
  switchMap,
  withLatestFrom,
  concatAll, shareReplay, debounce
} from 'rxjs/operators';
import { merge, fromEvent, Observable, concat, timer, forkJoin } from 'rxjs';

import { Course } from '../model/course';
import { Lesson } from '../model/lesson';
import { createHttpObservable } from '../common/util';
import { debug, LogLevel } from '../common/debugOperator';


@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

  courseId: number;

  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  @ViewChild('searchInput', { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {

    this.courseId = +this.route.snapshot.params['id'];

    this.course$ = createHttpObservable(`/api/courses/${this.courseId}`)
      .pipe(
        debug(LogLevel.DEBUG, 'Course:')
      );
    // const lessonsInital$ = this.getLessons();

    /*const lessonsFiltered$ =*/
    this.lessons$ = fromEvent<KeyboardEvent>(this.input.nativeElement, 'keyup')
      .pipe(
        // Mapping to the string value must come anywhere before 'distinctUntilChanged'
        map(event => (event.target as HTMLInputElement).value),
        // Gives the observable an initial value
        startWith(''),
        // Do not emit a change if the current value does not change with the current key press.
        // IOW if the user presses the Shift, Ctrl, etc... buttons
        distinctUntilChanged(),
        // Only allow values to emitted if they remain unchanged for 500ms
        // debounceTime(500),
        // If the input box is blank then do the search immediately, otherwise do the same debounceTime
        debounce(value => value === '' ? timer(0) : timer(500)),
        debug(LogLevel.DEBUG, 'Search Term:'),
        // If, while doing an http call, another key is pressed by the user,
        // switchMap will cancel the current http request and switch to a new one
        switchMap(filterTerm => {
          // console.log('Filter term: ', filterTerm);
          return this.getLessons(filterTerm);
        })
      );

    // this.lessons$ = concat(lessonsInital$, lessonsFiltered$);

    // forkJoin: Both observables have to complete in order for the forkJoin to complete
    // this.lessons$ = this.getLessons();
    // forkJoin([this.course$, this.lessons$])
    //   .subscribe(
    //     ([course, lessons]) => console.log('forkJoin next: ', course, lessons),
    //     error => console.error('forkJoin error:', error),
    //     () => console.log('forkJoin complete')
    //   );
  }

  ngAfterViewInit() {

  }

  getLessons(filter: string = ''): Observable<Lesson[]> {
    return createHttpObservable(`/api/lessons?courseId=${this.courseId}&filter=${filter}&pageSize=100`)
      .pipe(
        map(response => response['payload']),
        debug(LogLevel.DEBUG, 'Lessons')
      );
  }


}











