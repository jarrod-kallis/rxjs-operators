import { Component, OnInit } from '@angular/core';
import { interval, Observable, of, timer, throwError } from 'rxjs';
import { catchError, delayWhen, map, retryWhen, shareReplay, tap, filter, finalize, delay } from 'rxjs/operators';

import { Course } from '../model/course';
import { createHttpObservable } from '../common/util';
import { StoreService } from '../common/store.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;

  constructor(private store: StoreService) { }

  ngOnInit() {
    this.beginnerCourses$ = this.store.selectBeginnerCourses();
    this.advancedCourses$ = this.store.selectAdvancedCourses();
  }
}
