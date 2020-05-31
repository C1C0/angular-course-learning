import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Student } from 'src/app/shared/student.model';

import { Page } from "./sections-bar/sections-bar.component";
import { Field } from "./content/content.component";

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private http: HttpClient) {}

  student: Student;

  //section(s) variables
  sections = [];
  selectedSection;
  sectionsUp: boolean = true;

  //pages variables
  pages: Page[] = [];
  orderedPages: Page[] = [];
  selectedPage: Page

  //contents variables
  //temporary storage for content on page
  textFields: Field[] = [];

  //get all sections
  getSections(student: Student): Observable<any> {
    return this.http.get(
      `${environment.fetchUrl}student_classes/${student.student_class_id}/notes/sections/`
    );
  }

  getPages(student: Student): Observable<any> {
    return this.http.get(
      `${environment.fetchUrl}student_classes/${student.student_class_id}/notes/sections/${this.selectedSection.id}/pages`
    );
  }

  getPage(student: Student): Observable<any> {
    return this.http.get(
      `${environment.fetchUrl}student_classes/${student.student_class_id}/notes/sections/${this.selectedSection.id}/pages/${this.selectedPage.id}`
    );
  }
}
