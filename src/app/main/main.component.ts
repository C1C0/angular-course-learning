import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  faqLoaded: boolean;
  notesLoaded: boolean = false;

  constructor() { }

  ngOnInit(): void {
    
  }

  onActivate(event){
    this.notesLoaded = event.notesLoaded;
    this.faqLoaded = event.faqLoaded;
  }

}
