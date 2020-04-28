import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  

  constructor(private http: HttpClient) { }

  dates(up_to = 7){
    let from = new Date().toISOString();
    let to = new Date(new Date().getTime()+ (up_to*24*60*60*1000)).toISOString();

    return{from, to}
  }

  
//requests

setRequestParams(initDates){
  return new HttpParams()
  .set('date_from', initDates.from)
  .set('date_to', initDates.to)
  
}

getClassroomEvents(student, initDates): Observable<any> {
    return this.http
      .get(
        environment.fetchUrl +
          `student_classes/${student.student_class_id}/calendar`,
        {
          params: this.setRequestParams(initDates)
        }
      )
  }

  getPersonalEvents(student, initDates): Observable<any>{
    return this.http
      .get(
        environment.fetchUrl +
          `student/calendar`,
        {
          params: this.setRequestParams(initDates)
        }
      )
  }
}
