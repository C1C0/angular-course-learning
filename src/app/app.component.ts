import { Component } from '@angular/core';

import { UserService } from "./user.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Studentska Siet';

  constructor(
    public userService: UserService
  ){}
}
