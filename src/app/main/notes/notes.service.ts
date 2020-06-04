import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Student } from 'src/app/shared/student.model';

import { Page } from './sections-bar/sections-bar.component';
import { Field } from './content/content.component';

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
  selectedPage: Page;

  //contents variables
  //temporary storage for content on page
  textFields: Field[] = [];

  //last save
  lastSave: String;

  //getting data
  getNote(student: Student): Observable<any> {
    return this.http.get(
      `${environment.fetchUrl}student_classes/${student.student_class_id}/notes/${this.sections[0].note_id}`
    );
  }

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

  //send data
  postSection(
    title: String,
    max_pages: number,
    index: number
  ): Observable<any> {
    return this.http.post(
      `${environment.fetchUrl}student_classes/${this.student.student_class_id}/notes/sections`,
      {
        section: {
          title: title,
          max_pages: max_pages,
          index: index,
        },
      }
    );
  }

  postPage(title: string, level: number, index: number): Observable<any> {
    return this.http.post(
      `${environment.fetchUrl}student_classes/${this.student.student_class_id}/notes/sections/${this.selectedSection.id}/pages`,
      {
        page: {
          title: title,
          level: level,
          index: index,
        },
      }
    );
  }

  //update data
  putSection(id: number, title: string): Observable<any> {
    return this.http.put(
      `${environment.fetchUrl}student_classes/${this.student.student_class_id}/notes/sections/${id}`,
      {
        section: {
          title: title,
        },
      }
    );
  }

  putPage(
    id: number,
    {
      index: index = null,
      level: level = null,
      title: title = '',
      content: content = '',
    }
  ): Observable<any> {
    return this.http.put(
      `${environment.fetchUrl}student_classes/${this.student.student_class_id}/notes/sections/${this.selectedSection.id}/pages/${id}`,
      {
        page: {
          title: title,
          content: content,
          level: level,
          index: index,
        },
      }
    );
  }

  putSectionsIndexes(indexes): Observable<any> {
    return this.http.put(
      `${environment.fetchUrl}student_classes/${this.student.student_class_id}/notes/sections/indexes`,
      {
        indexes: indexes,
      }
    );
  }

  //Delete data
  delSection(id: number): Observable<any> {
    return this.http.delete(
      `${environment.fetchUrl}student_classes/${this.student.student_class_id}/notes/sections/${id}`
    );
  }
}
