import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChanedPassComponent } from './chaned-pass/chaned-pass.component';

@NgModule({
  declarations: [LoginComponent, ChanedPassComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: LoginComponent }]),
  ],
  exports: [RouterModule],
})
export class LoginModule {}
