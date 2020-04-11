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
  concatAll, shareReplay
} from 'rxjs/operators';
import { merge, fromEvent, Observable, concat, of } from 'rxjs';

import { Course } from '../model/course';
import { Lesson } from '../model/lesson';
import { createHttpObservable } from '../common/util';


@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

  courseId: number;

  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  filtered$: Observable<string>;

  @ViewChild('searchInput', { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {

    this.courseId = +this.route.snapshot.params['id'];

    this.course$ = createHttpObservable(`/api/courses/${this.courseId}`);

    this.getLessons();

    fromEvent<KeyboardEvent>(this.input.nativeElement, 'keyup')
      .pipe(
        // Mapping to the string value must come anywhere before 'distinctUntilChanged'
        map(event => (event.target as HTMLInputElement).value),
        // Only allow values to emitted if they remain unchanged for 500ms
        debounceTime(500),
        // Do not emit a change if the current value does not change with the current key press.
        // IOW if the user presses the Shift, Ctrl, etc... buttons
        distinctUntilChanged()
      )
      .subscribe(filterTerm => {
        // console.log(filterTerm);
        this.getLessons(filterTerm);
      });
  }

  ngAfterViewInit() {

  }

  getLessons(filter: string = '') {
    this.lessons$ = createHttpObservable(`/api/lessons?courseId=${this.courseId}&filter=${filter}&pageSize=100`)
      .pipe(
        map(response => response['payload'])
      );
  }


}











