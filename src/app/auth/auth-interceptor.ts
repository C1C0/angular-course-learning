import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Student } from '../shared/student.model';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler) {
      //puts headers only if not login
    if (req.url !== environment.fetchUrl + 'student') {
      let student: Student = JSON.parse(localStorage.getItem('userData'))
      const modifiedRequest = req.clone({
        headers: req.headers
          .set('email', student.email)
          .set('password-digest', student.password_digest),
      });

      return next.handle(modifiedRequest);
    }else{
        return next.handle(req)
    }
  }
}
