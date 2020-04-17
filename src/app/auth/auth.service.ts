import { Injectable } from '@angular/core';

import { User } from '../shared/user.model';
import { UsersService } from './users.service';
import { LocalStorageService } from '../shared/local-storage.service';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //user instance - represents logged in user
  user = new BehaviorSubject<User>(null);

  constructor(
    private UsersService: UsersService,
    private lss: LocalStorageService
  ) {}

  //get all users from offline version and checks credentials
  //if true, emits uesr and sets local storage
  login(credentials: { email: string; password: string }) {
    for (let user of this.UsersService.Users) {
      if (
        credentials.email === user.email &&
        credentials.password === user.password
      ) {
        this.user.next(user);

        if (user.passwordChanged) {
          this.lss.setToLS(this.lss.userData, user);
        }
      }
    }
  }

  //we just set null user
  //data are stored on API
  logout() {
    this.lss.removeFromLS(this.lss.userData);
    this.user.next(null);
  }

  //gets data from LS and then emit to this.user
  autoLogin() {
    let userData: User = this.lss.getLS(this.lss.userData);

    if (!userData) {
      return;
    } else {
      this.user.next(userData);
    }
  }

  changePass(p1: string, p2: string) {
    if (p1 === p2) {
      this.user.pipe(take(1)).subscribe((user) => {
        user.passwordChanged = true;
        user.password = p1;

        this.lss.setToLS(this.lss.userData, user);

        this.user.next(user);
        //to continue to next page
      });

      return true;
    }
  }
}
