import { Injectable } from '@angular/core';

import { User } from '../shared/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  //offline version of logging in
  Users: User[] = [
    new User('Kristián', 'Palovič', 19, 'kristian.palovic@spsjm.eu', '12345678'),
    new User('Janko', 'Hraško', 19, 'jano.hrasko@spsjm.eu', '12345678'),
    new User('Dušan', 'Mrkva', 19, 'dusan.mrkva@spsjm.eu', '12345678'),
    new User('Test', 'Test', 19, 't@t.t', '12345678'),
  ];
}
