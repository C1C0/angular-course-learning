import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit, OnDestroy {

  @Output() faqLoaded = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    this.faqLoaded.emit(true);
  }

  ngOnDestroy(): void{
    this.faqLoaded.emit(false);
  }

}
