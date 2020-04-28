import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Student } from 'src/app/shared/student.model';
import { AuthService } from 'src/app/auth/auth.service';
import { CalendarService } from './calendar.service';

interface Calendar {
  showDate: string;
  compareDate: string;
  classroomEvents: any;
  timetable: any;
  personalEvents: any;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  student: Student;

  calendar: Calendar[] = [];
  initDates;

  filters = [
    {
      name: 'Triedny Kalendár',
      class: 'triednyKalendar',
    },
    {
      name: 'Rozvrh',
      class: 'rozvrh',
    },
    {
      name: 'Tvoj Kalendar',
      class: 'tvojKalendar',
    },
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private calendarService: CalendarService
  ) {}

  ngOnInit(): void {
    this.createCalendar();

    this.authService.getStudent().subscribe((student) => {
      this.student = student;
      this.initDates = this.calendarService.dates();

      //get and sort classroom events
      this.calendarService
        .getClassroomEvents(this.student, this.initDates)
        .subscribe((events) => {
          this.calendar.forEach((day) => {
            events.forEach((serverEvent) => {
              if (
                serverEvent.date_from.split('T')[0] ===
                day.compareDate.split('T')[0]
              ) {
                day.classroomEvents.push(serverEvent);
              }
            });
          });
          console.log(this.calendar);
        });

      //get and sort PERSONAL events
      this.calendarService
        .getPersonalEvents(this.student, this.initDates)
        .subscribe((events) => {
          this.calendar.forEach((day) => {
            events.forEach((serverEvent) => {
              if (
                serverEvent.date_from.split('T')[0] ===
                day.compareDate.split('T')[0]
              ) {
                day.personalEvents.push(serverEvent);
              }
            });
          });
        });
    });
  }

  createCalendar(startingDay = null, nDays: number = 7) {
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

      this.calendar.push({
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
  }
}
