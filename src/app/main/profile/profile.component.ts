import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Student } from 'src/app/shared/student.model';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  student: Student;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getStudent().subscribe((s) => {
      this.student = s;
    });
  }


}
