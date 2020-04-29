import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  ViewChildren,
  QueryList,
  AfterViewInit,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Student } from 'src/app/shared/student.model';
import { AuthService } from 'src/app/auth/auth.service';
import { CalendarService, Calendar } from './calendar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit {
  student: Student;
  initDates;
  addItem = false;

  viewCalendar: Calendar[] = [];
  viewCalendarSubs: Subscription;

  classroomCalendarSubs: Subscription;
  personalCalendarSubs: Subscription;

  classCalVisility: boolean = true;
  personalCalVisibility: boolean = true;
  timetableVisibility: boolean = true;

  @ViewChildren('vl') vls: QueryList<any>;

  filters = [
    {
      name: 'Triedny Kalendár',
      class: 'triednyKalendar',
      changeVisibilityOf: 1,
    },
    {
      name: 'Rozvrh',
      class: 'rozvrh',
      changeVisibilityOf: 2,
    },
    {
      name: 'Tvoj Kalendar',
      class: 'tvojKalendar',
      changeVisibilityOf: 3,
    },
  ];

  constructor(
    private authService: AuthService,
    public calendarService: CalendarService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setMain(this.calendarService.getMonday(), 7);
  }

  setMain(startingDay = null, nDays):void{
    //creates calendars days
    this.calendarService.createCalendar(startingDay, nDays);

    //gets actual user for correct API requests
    this.authService.getStudent().subscribe((student) => {
      this.student = student;
      //sets days from - to
      this.initDates = this.calendarService.dates(
        7,
        this.calendarService.getMonday()
      );

      //get and sort classroom events
      this.calendarService
        .getClassroomEvents(this.student, this.initDates)
        .subscribe((events) => {
          this.classroomCalendarSubs = this.calendarService.calendar.subscribe(
            (cal) => {
              cal.forEach((day) => {
                events.forEach((serverEvent) => {
                  if (
                    serverEvent.date_from.split('T')[0] ===
                    day.compareDate.split('T')[0]
                  ) {
                    day.classroomEvents.push(serverEvent);
                  }
                });
              });
            }
          );
        });

      //get and sort PERSONAL events
      this.calendarService
        .getPersonalEvents(this.student, this.initDates)
        .subscribe((events) => {
          this.personalCalendarSubs = this.calendarService.calendar.subscribe(
            (cal) => {
              cal.forEach((day) => {
                events.forEach((serverEvent) => {
                  if (
                    serverEvent.date_from.split('T')[0] ===
                    day.compareDate.split('T')[0]
                  ) {
                    day.personalEvents.push(serverEvent);
                  }
                });
              });
            }
          );
        });
    });

    this.viewCalendarSubs = this.calendarService.calendar.subscribe(
      (cal) => (this.viewCalendar = cal)
    );
  }

  ngAfterViewInit(): void {
    this.renderer.setStyle(this.vls.last.nativeElement, 'display', 'none');
  }

  ngOnChanges(): void {
    this.calendarService.calendar.subscribe((cal) => (this.viewCalendar = cal));
  }

  //prevents stacking already loaded events
  ngOnDestroy(): void {
    this.calendarService.calendar.next([]);
    this.viewCalendar = [];
    this.viewCalendarSubs.unsubscribe();

    this.classroomCalendarSubs.unsubscribe();
    this.personalCalendarSubs.unsubscribe();
  }

  onAddItem() {
    this.addItem = !this.addItem;
  }

  //filters
  onChangeVisibility(option) {
    switch (option) {
      case 1:
        this.classCalVisility = !this.classCalVisility;
        break;
      case 2:
        this.timetableVisibility = !this.timetableVisibility;
        break;
      case 3:
        this.personalCalVisibility = !this.personalCalVisibility;
        break;
    }
  }

  //changing week
  onPreviousWeek(){

  }
}
