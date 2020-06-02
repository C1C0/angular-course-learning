import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { NotesService } from '../notes.service';

export interface Field {
  id: number;
  content: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent implements OnInit {
  //prevents creating new element
  //when user wants to just lost focus on selected one
  activeComponent: boolean = false;

  //only second+ click creates new element
  pageClicks: number = 0;

  //right click menu
  contextMenu = {
    show: false,
    x: 0,
    y: 0,
  };

  //show context menu (options)
  @HostListener('contextmenu', ['$event']) onRightClick(event) {
    event.preventDefault();

    if (event.target.className == 'content-container'){
      this.contextMenu = {
        show: true,
        x: event.offsetX - 15,
        y: event.offsetY - 25,
      };
    }
  }

  //prevents whole page selections
  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    if (event.detail > 1) event.preventDefault();
  }

  //enable tabulator inside textarea
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent){
    if(event.code === 'Tab'){
      event.preventDefault()
    }
  }

  constructor(private elRef: ElementRef, public notesS: NotesService) {}

  ngOnInit(): void {}

  //if element loses or gets focus,
  //pages click will be reset and
  //activateComponent will be set to defined value
  setState(bool) {
    this.pageClicks = 0;
    this.activeComponent = bool;
  }

  //creates new element
  onCreateHolder(event) {
    if (
      !this.activeComponent &&
      this.pageClicks > 0 &&
      this.notesS.selectedPage
    ) {
      if (!this.contextMenu.show) {
        //element can be created only on content-container,
        //when leftclicked (event.button == 0)
        //and none of the elements is activated
        if (
          event.target.className == 'content-container' &&
          event.button == 0 &&
          !this.activeComponent
        ) {
          //find highest id
          let ids = this.notesS.textFields.map((field) => {
            return field.id;
          });

          console.log(event);

          let field: Field = {
            id: ids.length === 0 ? 1 : Math.max(...ids) + 1,
            content: '',
            x: event.offsetX - 10,
            y: event.offsetY - 107,
          };

          this.notesS.textFields.push(field);

          //makes sure to automatically set focus to created element
          //if nothing writte, element will be destroyed in other functions
          setTimeout(() => {
            let htmlEl: HTMLInputElement = this.elRef.nativeElement;
            let textareasArray = htmlEl.getElementsByTagName('textarea');

            for (let i = 0; i < textareasArray.length; i++) {
              if (parseInt(textareasArray[i].id) == field.id) {
                textareasArray[i].focus();
              }
            }
          }, 100);
        }
      }
    }
    this.contextMenu.show = false;
    this.pageClicks++;
  }

  //prevents creating or keeping empty element
  //fired on blur of element
  checkContent(event) {
    //find element
    let actualField = this.notesS.textFields.find((field) => {
      if (field.id === parseInt(event.target.id)) {
        return field;
      }
    });

    //solving problem, when selectedPage is empty
    //this function was throwing error
    if (!actualField) return;

    //set its content
    actualField.content = event.target.value;
    console.log(actualField.content);
    //maps all ids and its fields and then gets index of
    //field that has give ID
    if (actualField.content === '') {
      console.log(
        this.notesS.textFields.map((field) => {
          return field.id;
        })
      );
      let index = this.notesS.textFields
        .map((field) => {
          return field.id;
        })
        .indexOf(actualField.id);

      this.notesS.textFields.splice(index, 1);
    }
  }
}
