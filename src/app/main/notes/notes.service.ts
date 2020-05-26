import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Student } from "src/app/shared/student.model";

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private http: HttpClient) { }

  //get all sections
  getSections(student: Student): Observable<any> {
    return this.http.get(
      `${environment.fetchUrl}student_classes/${student.student_class_id}/notes/sections/`
    );
  }

  getPages(student: Student, section): Observable<any>{
    return this.http.get(
      `${environment.fetchUrl}student_classes/${student.student_class_id}/notes/sections/${section.id}/pages`
    );
  }
}
