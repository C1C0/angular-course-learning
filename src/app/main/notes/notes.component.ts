import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, OnDestroy {

  @Output() notesLoaded = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    this.notesLoaded.emit(true);
  }

  ngOnDestroy(): void {
    this.notesLoaded.emit(false);
  }

}
