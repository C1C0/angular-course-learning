import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StudentDataService{
  student;

  constructor() {}

  get fullName(): string{
    if(this.student){
      return `${this.student.name} ${this.student.surrname}`
    }
  }
}
