import { Injectable } from '@angular/core';
import { Student } from './student.model';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  //localStorage vars
  userData: string = 'userData';

  //get data from local storage
  getLS(itemName: string): Student {
    return JSON.parse(localStorage.getItem(itemName));
  }

  //set OR add item
  setToLS(itemName: string, item: object) {
    localStorage.setItem(itemName, JSON.stringify(item));
  }

  //remove item
  removeFromLS(itemName: string) {
    if (this.getLS(itemName)) {
      localStorage.removeItem(itemName);
    }
  }

  //clear whole localStorage
  clear(){
    localStorage.clear();
  }
}
