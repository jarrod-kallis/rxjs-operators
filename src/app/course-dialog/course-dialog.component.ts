import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { fromEvent, from, Observable } from 'rxjs';
import { concatMap, distinctUntilChanged, exhaustMap, filter, mergeMap, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

import { Course } from '../model/course';

@Component({
  selector: 'app-course-dialog',
  templateUrl: './course-dialog.component.html',
  styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  course: Course;

  @ViewChild('saveButton', { static: true }) saveButton: ElementRef;

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) course: Course) {

    this.course = course;

    this.form = fb.group({
      description: [course.description, Validators.required],
      category: [course.category, Validators.required],
      releasedAt: [moment(), Validators.required],
      longDescription: [course.longDescription, Validators.required]
    });

  }

  ngOnInit() {
    // let save$: Observable<Response>;

    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid), // Only allow a valid form to be saved
        // tap((changes) => console.log(changes)),

        // Will wait for the previous save attempt to complete before continuing to the next save
        // concatMap(v => this.saveChanges(v)),

        // Will attempt to save to the DB in parallel
        mergeMap(v => this.saveChanges(v))
      )
      .subscribe();
  }

  saveChanges(values: Course): Observable<any> {
    return from(fetch(`/api/courses/${this.course.id}`, {
      method: 'PUT',
      body: JSON.stringify(values),
      headers: {
        contentType: 'application/json'
      }
    }));
  }



  ngAfterViewInit() {

    fromEvent(this.saveButton.nativeElement, 'click')
      .pipe(
        // Will ignore multiple clicks of the save button if an existing save is in progress
        exhaustMap(() => this.saveChanges(this.form.value))
      )
      .subscribe();
  }



  close() {
    this.dialogRef.close();
  }


}
