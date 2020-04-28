import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { StudentDataService } from './main/student-data.service';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'Studentska Siet';

  constructor(private authService: AuthService,
    private studentDataService: StudentDataService  ){}

  ngOnInit(){
    //if user closes or refreshes page,
    //this should be apble to automatically put him back
    //to loaded state
    this.authService.autoLogin();

    //loads user to the studentDataService
    this.authService.student.pipe(take(1)).subscribe(
      student => {
        this.studentDataService.student = student;
      }
    )

  }
}
