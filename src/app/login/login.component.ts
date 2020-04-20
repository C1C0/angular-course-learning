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
import { take } from 'rxjs/operators';
import { FormCheckingService } from './form-checking.service';
import { isNull } from 'util';
import { Subscription } from 'rxjs';

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
    private formCheck: FormCheckingService
  ) {}

  ngOnInit(): void {
    this.initForm();

    //if is user logged in and would like to visit this /login,
    //this will prevent it and redirects user  back to /home
    this.authUserSubs = this.authService.user
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
    this.invalidCredentials = this.authService.login(this.loginForm.value);
    this.authService.user.pipe(take(1)).subscribe((user) => {
      //sets state of app to change password
      if (user) {
        this.initLogin = !user.passwordChanged;
        if (!this.initLogin) {
          //nav to /home, if not init login
          this.router.navigate(['/user/home']);
        }
      }
    });
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
        updateOn: 'blur'
      }),
    });
  }
}
