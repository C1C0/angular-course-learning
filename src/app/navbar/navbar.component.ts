import { Component, OnInit } from '@angular/core';

import { UserService } from "src/app/user.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(
    private userService: UserService,

  ) { }

  ngOnInit(): void {
  }

  logOff(): void{
    this.userService.loggedIn = false;
  }


}
