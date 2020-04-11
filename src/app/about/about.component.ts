import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { createHttpObservable } from '../common/util';
import { map } from 'rxjs/operators';
import { noop } from 'rxjs';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  ngOnInit() {
    // const http$ = createHttpObservable('/api/courses');

    // const sub = http$.subscribe();

    // setTimeout(() => sub.unsubscribe(), 150);
  }

}






