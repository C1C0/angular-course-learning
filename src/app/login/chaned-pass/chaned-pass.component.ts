import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chaned-pass',
  templateUrl: './chaned-pass.component.html',
  styleUrls: ['./chaned-pass.component.scss', '../login.component.scss'],
})
export class ChanedPassComponent implements OnInit {
  changePassForm: FormGroup;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.changePassForm = new FormGroup({
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
      checkPassword: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  onSubmit() {
    //docasne riesenie
    //kym nebude API
    let p1: string = this.changePassForm.get('password').value;
    let p2: string = this.changePassForm.get('checkPassword').value;

    if(this.authService.changePass(p1, p2)){
      this.router.navigate(['/home']);
    };

    
  }
}
