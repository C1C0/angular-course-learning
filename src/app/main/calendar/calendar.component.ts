import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { Student } from 'src/app/shared/student.model';
import { AuthService } from 'src/app/auth/auth.service';
import { CalendarService, Calendar } from './calendar.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit {
  student: Student;
  initDates;
  addItem = false;

  shiftWeek = 0;

  viewCalendar: Calendar[] = [];
  viewCalendarSubs: Subscription;

  classroomCalendarSubs: Subscription;
  personalCalendarSubs: Subscription;

  classCalVisility: boolean = true;
  personalCalVisibility: boolean = true;
  timetableVisibility: boolean = true;

  @ViewChildren('vl') vls: QueryList<any>;
  @ViewChildren('checkMark') checkMarks: QueryList<any>;
  showActive;

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

  setMain(startingDay = null, nDays, shiftWeek = 0): void {
    //creates calendars days
    this.calendarService.createCalendar(startingDay, nDays, shiftWeek);

    //gets actual user for correct API requests
    this.authService.getStudent().subscribe((student) => {
      this.student = student;
      //sets days from - to
      this.initDates = this.calendarService.dates(
        7,
        this.calendarService.getMonday(),
        shiftWeek
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
      console.log('init dates', this.initDates);
      this.calendarService
        .getPersonalEvents(this.student, this.initDates)
        .subscribe((events) => {
          this.personalCalendarSubs = this.calendarService.calendar.subscribe(
            (cal) => {
              cal.forEach((day) => {
                console.log('eventty', events);
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

    console.log('calnedar', this.viewCalendar);
  }

  //i did not figure it out, how to hide last one
  ngAfterViewInit(): void {
    this.renderer.setStyle(this.vls.last.nativeElement, 'display', 'none');
  }

  resetPipes() {
    //!TODO
    // this.vls = new ViewChildren('vl')
    this.renderer.setStyle(this.vls.last.nativeElement, 'display', 'none');
  }

  ngOnChanges(): void {
    this.calendarService.calendar.subscribe((cal) => (this.viewCalendar = cal));
  }

  //prevents stacking already loaded events
  ngOnDestroy(): void {
    this.resetSubs();
  }

  resetSubs() {
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
        this.setCheckmark(this.classCalVisility, option)
        break;
      case 2:
        this.timetableVisibility = !this.timetableVisibility;
        this.setCheckmark(this.timetableVisibility, option)
        break;
      case 3:
        this.personalCalVisibility = !this.personalCalVisibility;
        this.setCheckmark(this.personalCalVisibility, option)
        break;
    }
    console.log(this.checkMarks);

  }

  setCheckmark(calType: boolean, option: number){
    if (!calType) {
      this.renderer.setStyle(
        this.checkMarks.find((e, index) => {
          return index === option - 1;
        }).nativeElement,
        'display',
        'none'
      );
    }else{
      this.renderer.setStyle(
        this.checkMarks.find((e, index) => {
          return index === option - 1;
        }).nativeElement,
        'display',
        'inline'
      );
    }
  }

  //changing weeks
  onPreviousWeek() {
    this.shiftWeek--;
    this.resetSubs();
    this.setMain(this.calendarService.getMonday(), 7, this.shiftWeek);
  }

  onNextWeek() {
    this.shiftWeek++;
    this.resetSubs();
    this.setMain(this.calendarService.getMonday(), 7, this.shiftWeek);
  }

  //manage events
  onSelectEvent(event) {
    let chooseTarget;
    if (event.target.tagName != 'DIV') {
      chooseTarget = event.target.parentElement.id;
    } else {
      chooseTarget = event.target.id;
    }

    this.showActive = this.showActive ? null : chooseTarget;
  }

  resume(event) {
    console.log(event.target.className);
    if (this.showActive != null) {
      this.showActive = null;
    }
  }

  onDestroyEvent(event) {
    let idOfEvent = event.target.parentElement.parentElement.id.split('-');
    let personalE = idOfEvent[0] === 'personalE' ? true : false;
    this.calendarService.calendar.pipe(take(1)).subscribe((cal: Calendar[]) => {
      if (personalE) {
        cal.forEach((day) => {
          day.personalEvents.forEach((e) => {
            if (e.id == idOfEvent[1]) {
              day.personalEvents.splice(
                day.personalEvents.findIndex((e) => {
                  return e.id == idOfEvent[1];
                }),
                1
              );
            }
          });
        });
      } else {
        cal.forEach((day) => {
          day.classroomEvents.forEach((e) => {
            if (e.id == idOfEvent[1]) {
              day.classroomEvents.splice(
                day.classroomEvents.findIndex((e) => {
                  return e.id == idOfEvent[1];
                }),
                1
              );
            }
          });
        });
      }
    });
    this.calendarService
      .destroyEvent(personalE, this.student, idOfEvent[1])
      .subscribe((err) => {
        console.log(err);
      });
  }
}
