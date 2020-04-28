import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { StudentDataService } from '../student-data.service';
import { Student } from 'src/app/shared/student.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  studentName:string;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    //sets vars of user properties in this component
    this.authService.getStudent().subscribe((student: Student) => {
      this.studentName = `${student.name} ${student.surrname}`;
    })
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
