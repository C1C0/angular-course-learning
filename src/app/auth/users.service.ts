import { Injectable } from '@angular/core';

import { User } from '../shared/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  //offline version of logging in
  Users: User[] = [
    new User('Kristián', 'Palovič', 19, 'kristian.palovic@spsjm.eu', '123456'),
    new User('Janko', 'Hraško', 19, 'jano.hrasko@spsjm.eu', '123456'),
    new User('Dušan', 'Mrkva', 19, 'dusan.mrkva@spsjm.eu', '123456'),
  ];
}
