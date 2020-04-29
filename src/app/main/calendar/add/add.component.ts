import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit, OnDestroy {

  @Output() closed = new EventEmitter<void>();

  eventForm: FormGroup = new FormGroup({
    title: new FormControl(null, Validators.required),
    from: new FormControl(null, Validators.required),
    calendar: new FormControl('classroom', Validators.required),
    to: new FormControl(null,Validators.required)
  })

  secondaryColor = false;

  constructor(private authServ: AuthService, private calendarServ: CalendarService) { }

  ngOnInit(): void {
  }

  ngOnDestroy():void{

  }
  

  onClose(){
    this.closed.emit();
  }

  onSubmit(){
    this.onClose();
    this.calendarServ.addEvent(this.eventForm);
    this.authServ.getStudent().subscribe(student => {
      this.calendarServ.postEvent(this.eventForm.get('calendar').value === 'personal', student, this.eventForm.value).subscribe(mess => {
        console.log(mess);
      })
    })
  }

  onChangeColor(color:string){
    if(color === 'primary'){
      this.secondaryColor = false;
    }else if(color === "secondary"){
      this.secondaryColor = true
    }
  }

  

}
