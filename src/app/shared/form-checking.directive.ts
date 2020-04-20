import { Directive, Input, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive({
  selector: '[appFormChecking]',
})
export class FormCheckingDirective {
  // to make it usable for every form in app
  @Input() appFormChecking: FormGroup;
  @Input() formCheckingInputParam: string;

  @HostBinding('class.ng-touched') get invalid() {
    return (
      this.appFormChecking.get(this.formCheckingInputParam).touched &&
      this.appFormChecking.get(this.formCheckingInputParam).invalid
    );
  }
}
