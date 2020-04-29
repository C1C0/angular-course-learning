import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Student } from 'src/app/shared/student.model';
import { FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';

export interface Calendar {
  showDate: string;
  compareDate: string;
  classroomEvents: any;
  timetable: any;
  personalEvents: any;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  calendar = new BehaviorSubject<Calendar[]>([]);

  constructor(private http: HttpClient) {}

  dates(up_to = 7, startingDay = null) {
    let from = startingDay
      ? new Date(startingDay).toISOString()
      : new Date().toISOString();
    let to = new Date(
      new Date().getTime() + (up_to - 1) * 24 * 60 * 60 * 1000
    ).toISOString();
    return { from, to };
  }

  //requests

  setRequestParams(initDates) {
    return new HttpParams()
      .set('date_from', initDates.from)
      .set('date_to', initDates.to)
      .set('fullDay', 'true');
  }

  //sever communication

  getClassroomEvents(student, initDates): Observable<any> {
    return this.http.get(
      environment.fetchUrl +
        `student_classes/${student.student_class_id}/calendar`,
      {
        params: this.setRequestParams(initDates),
      }
    );
  }

  getPersonalEvents(student, initDates): Observable<any> {
    return this.http.get(environment.fetchUrl + `student/calendar`, {
      params: this.setRequestParams(initDates),
    });
  }

  postEvent(
    personalCal: boolean,
    student: Student,
    form: { title; description; from; to }
  ): Observable<any> {
    let setUri =
      personalCal === true
        ? 'student/calendar'
        : `student_classes/${student.student_class_id}/calendar`;
    return this.http.post(environment.fetchUrl + setUri, {
      event: {
        title: form.title,
        description: form.description,
        date_from: form.from,
        date_to: form.to,
        fullDay: true,
      },
    });
  }

  //UI of calendar

  createCalendar(startingDay = null, nDays: number = 7) {
    let calendar: Calendar[] = [];

    if (startingDay === null) {
      startingDay = new Date();
    } else {
      startingDay = new Date(startingDay);
    }

    for (let i = 0; nDays > i; i++) {
      if (i != 0) {
        startingDay = new Date(startingDay + 24 * 60 * 60 * 1000);
      }

      let ISO = startingDay.toISOString();


      calendar.push({
        showDate: `${startingDay.getDate()}.${
          startingDay.getMonth() + 1
        }.${startingDay.getFullYear()}`,
        compareDate: ISO,
        classroomEvents: [],
        timetable: [],
        personalEvents: [],
      });

      if (typeof startingDay === 'object') {
        startingDay = startingDay.getTime();
      }
    }

    this.calendar.next(calendar);
  }

  getMonday() {
    let currentdate = new Date();
    let day = currentdate.getDay(),
      diff = currentdate.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(currentdate.setDate(diff));
  }

  addEvent(form: FormGroup) {
    //gets correct date format (only days for now)
    let AddToDay = new Date(form.get('from').value).toDateString();
    this.calendar.pipe(take(1)).subscribe((cal:Calendar[]) => {
      cal.forEach((day) => {
        if (new Date(day.compareDate).toDateString() === AddToDay) {
          if (form.get('calendar').value === 'personal') {
            day.personalEvents.push(form.value);
          } else {
            day.classroomEvents.push(form.value);
          }
        }
      });
    });
  }
}
