import { Component, OnInit, HostListener } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl,
  ValidatorFn,
  AbstractControl,
  AsyncValidatorFn,
} from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FormCheckingService } from '../form-checking.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-chaned-pass',
  templateUrl: './chaned-pass.component.html',
  styleUrls: ['./chaned-pass.component.scss', '../login.component.scss'],
})
export class ChanedPassComponent implements OnInit {
  changePassForm: FormGroup;

  firstPass: string;

  password_type: string = 'password';
  password_confirm_type: string = 'password';

  constructor(
    private authService: AuthService,
    private router: Router,
    private formCheck: FormCheckingService
  ) {}

  ngOnInit(): void {
    this.changePassForm = new FormGroup({
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/),
      ]),
      checkPassword: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: this.hasToMatch.bind(this),
        updateOn: 'blur',
      }),
    });
  }

  //handling error service
  onGetError(form: FormGroup, property: string) {
    return this.formCheck.getError(form, property);
  }

  //checks, if passwords match
  hasToMatch(control: AbstractControl): Promise<any> | Observable<any> {
    return new Promise((resolve, reject) => {
      //not good solution, because if has to fetch after timeout but probably good enough to work with updateOn:'blur'
      setTimeout(() => {
        if (control.value !== this.changePassForm.get('password').value) {
          resolve({ noMatch: true });
        } else {
          resolve(null);
        }
      }, 20);
    });
  }

  onSubmit() {
    let p1: string = this.changePassForm.get('password').value;
    let p2: string = this.changePassForm.get('checkPassword').value;

    this.authService.changePass(p1, p2)
  }

  onChangePassType(event, pass_confirm: boolean = false){
    this.formCheck.changePassField(event);
    if(pass_confirm){
      this.password_confirm_type = this.password_confirm_type === 'password' ? 'text' : 'password';
    }else{
      this.password_type = this.password_type === 'password' ? 'text' : 'password';
    }

  }
}
