import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormCheckingDirective } from './form-checking.directive';



@NgModule({
  declarations: [FormCheckingDirective],
  imports: [
    CommonModule
  ],
  exports: [FormCheckingDirective]
})
export class SharedModule { }
