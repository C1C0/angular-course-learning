import {
  Component,
  OnInit,
  ViewEncapsulation,
  Renderer2,
  OnDestroy,
} from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take, catchError } from 'rxjs/operators';
import { FormCheckingService } from './form-checking.service';
import { Subscription, throwError } from 'rxjs';
import { LocalStorageService } from '../shared/local-storage.service';
import { error } from '@angular/compiler/src/util';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  initLogin: boolean = false;

  invalidCredentials: boolean;

  authUserSubs: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formCheck: FormCheckingService,
    private lss: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.initForm();

    //if is user logged in and would like to visit this /login,
    //this will prevent it and redirects user  back to /home
    this.authUserSubs = this.authService.student
      .pipe(take(1))
      .subscribe((user) => {
        if (user) {
          this.router.navigate(['/user/home']);
        }
      });
  }

  ngOnDestroy(): void {
    this.authUserSubs.unsubscribe();
  }

  onLogIn(): void {
    this.authService
      .login(this.loginForm.value)
      .subscribe(student => {
        console.log(student);
        //sets state of app to change password
        if (student) {
          //pass new student into student: BehaviourSubject
          this.authService.student.next(student);

          //If first log in, this.initLogin = true
          this.initLogin = !student.password_changed;

          //set to LS
          this.lss.setToLS(this.lss.userData, student);
          if (!this.initLogin) {
            //nav to /home, if not init login
            this.router.navigate(['/user/home']);
          }

          //if was true before, makes sure to switch it to false
          this.invalidCredentials = false;
        }},
        error => {
          //for displaying, that invalid credentials were set
          this.invalidCredentials = true;
        }
      );
  }


  //handling error service
  onGetError(form: FormGroup, property: string) {
    return this.formCheck.getError(form, property);
  }

  private initForm() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, {
        validators: [Validators.email, Validators.required],
        updateOn: 'blur',
      }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)],
        updateOn: 'change',
      }),
    });
  }
}
