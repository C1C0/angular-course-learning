import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormCheckingService {
  //returns true, if the property has some errors
  //it does not target exact error
  getError(form: FormGroup, property: string) {
    return form.get(property).errors && form.get(property).touched;
  }

  changePassField(event: Event){
    (<Element>event.target).className = (<Element>event.target).className === 'showPass' ? 'hidePass' : 'showPass';
  }
}
