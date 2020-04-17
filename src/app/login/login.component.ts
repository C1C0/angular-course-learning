import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  initLogin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.initForm();
    console.log(this.loginForm);
  }

  onLogIn(): void {
    this.authService.login(this.loginForm.value);
    this.authService.user.pipe(take(1)).subscribe((user) => {
      //sets state of app to change password
      if (user) {
        this.initLogin = !user.passwordChanged;
        if (!this.initLogin) {
          //nav to /home, if not init login
          this.router.navigate(['/home']);
        }
      }
    });
  }

  

  private initForm() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.email, Validators.required]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
      ]),
    });
  }
}
