import { Injectable } from '@angular/core';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  //localStorage vars
  userData: string = 'userData';

  //get data from local storage
  getLS(itemName: string): User {
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
}
