import { Injectable } from '@angular/core';

import { Student } from '../shared/student.model';
import { LocalStorageService } from '../shared/local-storage.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { take, catchError} from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //user instance - represents logged in user
  student = new BehaviorSubject<Student>(null);

  constructor(
    private lss: LocalStorageService,
    private http: HttpClient,
    private router: Router
  ) {}

  getStudent():Observable<any>{
    return this.student.pipe(take(1));
  }


  //sends HTTP GET request to server
  //if all headers are valid, return user full user
  login(credentials: { email: string; password: string }): Observable<Student> {
    return this.http
      .get<Student>(environment.fetchUrl+ "student", {
        headers: new HttpHeaders()
          .set('email', credentials.email)
          .set('password', credentials.password),
      }).pipe(
        catchError(this.handleError)
      );

  }

  private handleError(error: HttpErrorResponse){
    if(error.error instanceof ErrorEvent){
      //client side error
      console.error("an error occurred: ", error.error.message);
    }else{
      //unsuccessful response code from backend
      console.error(
        `Backend returned code ${error.status}`,
        `body was:`, error.error
      )
    }
    //return an observable with a user-facing error message
    return throwError("error")
  }

  //we just set null user
  //data are stored on API
  logout() {
    this.lss.clear();
    this.student.next(null);
  }

  //gets data from LS and then emit to this.user
  autoLogin() {
    //get data from storage
    let student: Student = this.lss.getLS(this.lss.userData);

    //if user there, automatically update student: Beh.Sub
    if (!student) {
      return;
    } else {
      this.student.next(student);
    }
  }

  changePass(p1: string, p2: string) {
    if (p1 === p2) {
      this.student.pipe(take(1)).subscribe((student) => {
        student.password_changed = true;

        console.log(student);

        this.http
          .put<Student>(
            environment.fetchUrl+'student/edit',
            {
              student:{
                password: p1,
                password_confirmation: p2,
              }
            }
          )
          .subscribe((student) => {
            console.log(student);

            //creates instance in local storage, to allow auto-login
            this.lss.setToLS(this.lss.userData, student);

            this.student.next(student);
            //to continue to next page
            this.router.navigate(['/user/home']);
          });
      });
    }
  }
}
