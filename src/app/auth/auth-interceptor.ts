import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Student } from '../shared/student.model';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { LocalStorageService } from '../shared/local-storage.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private lsS: LocalStorageService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    //puts headers only if not login
    if (req.url !== environment.fetchUrl + 'student') {
      let student: Student = JSON.parse(localStorage.getItem('userData'));
      const modifiedRequest = req.clone({
        headers: req.headers
          .set('email', student.email)
          .set('password-digest', student.password_digest),
      });

      return next.handle(modifiedRequest).pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.lsS.clear();
            this.router.navigate(['/login']);
          }
          return throwError(err);
        })
      );
    } else {
      return next.handle(req);
    }
  }
}
