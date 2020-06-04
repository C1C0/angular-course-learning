import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewChecked,
  AfterViewInit,
} from '@angular/core';
import { NotesService } from '../notes.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Student } from 'src/app/shared/student.model';
import { map, tap } from 'rxjs/operators';
import { stringify } from 'querystring';

export interface Page {
  id: number;
  title: string;
  content?: string;
  section_id: number;
  parentId: number;
  index: number;
  level: number;
  children?;
}

export interface Section {
  id: number;
  index: number;
  max_pages: number;
  note_id: number;
  title: string;
  updated_at: string;
  created_at: string;
}

@Component({
  selector: 'app-sections-bar',
  templateUrl: './sections-bar.component.html',
  styleUrls: ['./sections-bar.component.scss'],
})
export class SectionsBarComponent implements OnInit {
  //sections - global parameters
  updated: boolean = true;
  toUpdateSections: { id: number; index: number }[] = [];

  //contextMenu for sections
  contextMenu = {
    up: false,
    for: null,
    id: null,
    x: null,
    y: null,
  };

  //used for renaming
  renaming: boolean = false;

  constructor(
    public notesS: NotesService,
    private authService: AuthService,
    private renderer: Renderer2
  ) {}

  //get sections and student
  ngOnInit(): void {
    //get student params
    this.authService.getStudent().subscribe((student) => {
      this.notesS.student = student;

      //get sections
      this.notesS.getSections(this.notesS.student).subscribe((sections) => {
        this.notesS.sections = this.orderByIndex(sections);
        this.notesS.getNote(this.notesS.student).subscribe((note) => {
          this.notesS.lastSave = new Date(note.updated_at).toLocaleString();
        });
        this.notesS.selectedSection = sections[0];

        console.log(this.notesS.sections);
      });
    });
  }

  //!context menu functions
  //show context menu (options)
  @HostListener('contextmenu', ['$event']) onRightClick(event) {
    event.preventDefault();

    if (this.renaming) return;
    //called because
    this.onClose();

    //gets value if user will click on section or page li
    let pageType = null;

    if (event.target.tagName == 'LI') {
      if (event.path.includes(document.querySelector('ul.sections'))) {
        pageType = 'sections';
        event.target.className += ' selected';
      }

      document.querySelectorAll('ul.pages').forEach((ulPage) => {
        if (event.path.includes(ulPage)) {
          console.log(event.target);
          pageType = 'pages';
          event.target.className += ' selected';
        }
      });
    }
    if (pageType) {
      this.contextMenu = {
        up: true,
        for: pageType,
        id: parseInt(event.target.id),
        x: event.x,
        y: event.y - 5,
      };
    } else {
      this.contextMenu = {
        up: true,
        for: null,
        id: null,
        x: event.x,
        y: event.y,
      };
    }
  }

  //close context menu
  onClose() {
    if (this.contextMenu.up) {
      //removes class=' selected '
      if (this.contextMenu.id) {
        let item = document.getElementById(this.contextMenu.id);
        if (item) item.classList.remove('selected');
      }

      this.contextMenu.up = false;
    }
  }

  //hides context menu when clicked whereever on page
  @HostListener('window:click', ['$event']) onWindowCLick(event) {
    let contextMenuTemp = document.querySelector('#contextmenuTemplate');

    if (!event.path.includes(contextMenuTemp)) this.onClose();
  }

  //!Sections f
  //selected section will be changed
  onSelectSection(sectionId) {
    if (!this.renaming && !this.contextMenu.up) {
      if (this.notesS.selectedSection.id !== sectionId) {
        this.notesS.selectedSection = this.notesS.sections.find((section) => {
          return section.id == sectionId;
        });

        //gets pages of selectedSection
        this.onGetPages();
      }

      //hides sections part
      //shows pages part
      this.notesS.sectionsUp = false;
    }
  }

  //sections managing
  onCreateSection() {
    let newIndex = this.findHighest(this.notesS.sections, 'index') + 1;
    this.notesS
      .postSection('Nová sekcia', 15, newIndex)
      .subscribe((newSection) => {
        this.notesS.sections.push(newSection);
      });
  }

  onDeleteSection() {
    this.notesS.delSection(this.contextMenu.id).subscribe((mess) => {
      //find section
      let delSection: Section = this.notesS.sections.find((section) => {
        return this.contextMenu.id === section.id;
      });

      //to all sections that comes after  this section (with higher index), lower index by one
      this.notesS.sections.forEach((compSection) => {
        if (compSection.index > delSection.index) {
          compSection.index--;
        }
      });

      //removes section
      let sectionArrayPos: number = this.notesS.sections.indexOf(delSection);
      this.notesS.sections.splice(sectionArrayPos, 1);

      this.onUpdateIndexes(this.notesS.sections.length, delSection.index);
    });
  }

  onChangeSectionToInput() {
    //to make sure user cant load pages
    this.renaming = true;

    //creates element
    let li = document.getElementById(this.contextMenu.id);
    li.draggable = false;

    //creates input and creates new listener to it
    let input = this.renderer.createElement('input');
    input.addEventListener('blur', this.renameSection.bind(this), true);
    input.addEventListener('keyup', (event) => {
      if (event.code === 'Enter') {
        input.blur();
      }
    });
    //stores values
    //first is new set value
    //second used for comparision
    this.renderer.setAttribute(input, 'value', li.innerText);
    this.renderer.setAttribute(input, 'data-initvalue', li.innerText);
    input.draggable = false;

    //clear li's inner value and show only input
    li.innerText = '';
    this.renderer.appendChild(li, input);
    input.select();
  }

  renameSection(event) {
    let calledInputEl = <HTMLInputElement>event.target;

    let newValue: string = calledInputEl.value;
    if (newValue === '') newValue = 'Nová sekcia';

    let oldValue = calledInputEl.attributes.getNamedItem('data-initvalue')
      .value;

    //If value doesnt change, it is waste of performance to send any http request
    if (oldValue != newValue) {
      this.notesS
        .putSection(this.contextMenu.id, newValue)
        .subscribe((mess) => {
          //find section
          let renSection = this.notesS.sections.find((section) => {
            return this.contextMenu.id === section.id;
          });

          //writes locally
          renSection.title = newValue;
          console.log(renSection);
        });
    }

    //sets newly created value
    calledInputEl.parentElement.draggable = true;
    calledInputEl.parentElement.innerHTML = newValue;

    this.renaming = false;
  }

  //!Pages f
  //changes content in content component
  onSelectPage(pageId) {
    //execute function only once per selected page
    if(this.notesS.selectedPage && this.notesS.selectedPage.id === pageId) return;

    this.notesS.selectedPage = this.findById(this.notesS.orderedPages, pageId);
    //sets content by selected page
    this.notesS.getPage(this.notesS.student).subscribe((page) => {
      this.notesS.textFields = JSON.parse(page.content);
    });

    console.log('Selected page', this.notesS.selectedPage);
  }

  //used in HTML to enter "selected" class
  setPageClass(pageId) {
    if (!this.notesS.selectedPage) return false;
    return pageId === this.notesS.selectedPage.id;
  }

  //get pages of seleted section
  onGetPages() {
    this.notesS.getPages(this.notesS.student).subscribe((pages) => {
      this.notesS.pages = pages;
      this.orderPages();
    });
  }

  //orders by page Index
  orderPages() {
    //filter each level
    //connect parents with children
    //then reorder base on index

    let filteredPages: any[] = [[], [], [], []];
    let parent;
    let childrenOfMain;

    //reset orderedPages
    this.notesS.orderedPages = [];

    //filter level
    this.notesS.pages.forEach((page) => {
      //first filtering is made based on page's level
      if (page.level <= 3) filteredPages[page.level].push(page);
      else console.log(page.level, `Page.level: ${page.level} not defined`);
    });

    //top - "0" level
    this.notesS.orderedPages = filteredPages[0];

    //"1" level
    for (let page1 of filteredPages[1]) {
      parent = this.notesS.orderedPages.find((parentPage) => {
        return page1.parentId == parentPage.id;
      });
      this.createOrAddObject(parent, page1);
    }

    //"2" level
    for (let page2 of filteredPages[2]) {
      //check every element
      for (let i = 0; i < this.notesS.orderedPages.length; i++) {
        childrenOfMain = this.notesS.orderedPages[i].children;

        if (childrenOfMain != undefined && childrenOfMain != null) {
          parent = this.notesS.orderedPages[i].children.find((parentPage) => {
            return page2.parentId === parentPage.id;
          });

          //if parent was found for actual page2, create element and move to next page2
          if (parent) {
            this.createOrAddObject(parent, page2);
            break;
          }
        }
      }
    }

    //"3" level
    for (let page3 of filteredPages[3]) {
      let skipIterration: boolean = false;

      for (let i = 0; i < this.notesS.orderedPages.length; i++) {
        //if page3 was found, makes sure to skip to next page3
        if (skipIterration) {
          skipIterration = false;
          break;
        }

        childrenOfMain = this.notesS.orderedPages[i].children;

        if (childrenOfMain != undefined && childrenOfMain != null) {
          for (let i = 0; i < childrenOfMain.length; i++) {
            if (childrenOfMain[i].children) {
              parent = childrenOfMain[i].children.find((parentPage) => {
                return page3.parentId === parentPage.id;
              });

              if (parent) {
                this.createOrAddObject(parent, page3);
                skipIterration = true;
                break;
              }
            }
          }
        }
      }
    }

    //orders everything
    this.orderByIndex(this.notesS.orderedPages);

    console.log(this.notesS.orderedPages);
  }

  //pages managing
  onCreatePage() {
    let newIndex = 0;

    if (this.notesS.orderedPages.length != 0) {
      newIndex = this.findHighest(this.notesS.orderedPages, 'index') + 1;
    }

    this.notesS.postPage('Nová stránka', 0, newIndex).subscribe((page) => {
      this.notesS.orderedPages.push(page);
    });
  }

  onDeletePage(){
    console.log('Would be deleted');
  }

  onChangePageToInput(){
    console.log('would change name');
  }

  //!Others

  onUpdateIndexes(to: number, from: number = 0) {
    this.toUpdateSections = [];

    if (this.notesS.sectionsUp) {
      this.notesS.sections.forEach((section: Section) => {
        if (from <= section.index && section.index <= to) {
          this.toUpdateSections.push({ id: section.id, index: section.index });
        }
      });

      this.notesS
        .putSectionsIndexes(this.toUpdateSections)
        .subscribe((message) => {
          console.log(message);
        });
    }
  }

  orderByIndex(arr: any[]) {
    arr.sort((a, b) => {
      return a['index'] - b['index'];
    });
    arr.forEach((el) => {
      if (el.children) return this.orderByIndex(el.children);
    });
    return arr;
  }

  //called by little arrows on the top of
  //the sections/pages bar
  onMove(where = 'sections') {
    switch (where) {
      case 'sections':
        this.notesS.sectionsUp = true;
        break;
      case 'pages':
        this.notesS.sectionsUp = false;
        break;
    }
  }

  //used primarly by pages to insert subpages
  createOrAddObject(parent, object) {
    if (parent === null || parent === undefined) {
      console.log('Parent object Not found');
      return;
    }
    //if parent object has not key for children, create one
    if (
      !Object.keys(parent).find((key) => {
        return key == 'children';
      })
    ) {
      parent.children = [object];
      return;
    }

    parent.children.push(object);
  }

  findById(arr, id): any {
    //recursion
    let found: Page;

    for (let el of arr) {
      if (el === null || el === undefined) return;

      if (el.id === id) {
        found = el;
        break;
      }

      //check for 'children' properties
      for (let val of Object.values(el)) {
        if (val && typeof val === 'object') {
          let page = this.findById(val, id);
          if (page) return page;
        }
      }
    }

    return found;
  }

  findHighest(arr, propr: string, set: number = 0): number {
    //recursion
    let oldPropr = set;
    arr.forEach((el) => {
      if (el === null || el === undefined) return;

      if (el[propr] > oldPropr) {
        oldPropr = el[propr];
      }

      //check for 'children' properties
      for (let val of Object.values(el)) {
        if (val && typeof val === 'object') {
          let newpropr = this.findHighest(val, propr, oldPropr);
          if (newpropr) return newpropr;
        }
      }
    });

    return oldPropr;
  }

  //!drag-n-drop
  //drag and drop styling
  dragParent: HTMLElement;

  onDrag(event: DragEvent) {
    let element = <HTMLElement>event.target;
    event.dataTransfer.setData('sectionId', element.id);

    //little styling fun
    let elCopy = element.cloneNode();
    this.renderer.setStyle(elCopy, 'visibility', 'hidden');
    event.dataTransfer.setDragImage(<HTMLElement>elCopy, 0, 0);
  }

  onDragHint(event: DragEvent) {
    this.dragParent = <HTMLElement>event.target;
    let hr = document.getElementById(`${this.dragParent.children[0].id}`);
    hr.classList.add('hoverDrop');
    event.preventDefault();
  }

  onDragRemoveHint(event: DragEvent) {
    let hr = document.getElementById(`${this.dragParent.children[0].id}`);
    hr.classList.remove('hoverDrop');
  }

  //drag-n-drop changing order
  onDragDrop(event: DragEvent) {
    //purpose of this fucntion is to put dragged el between two elements

    event.preventDefault();
    let droppingHr = <HTMLElement>event.target;
    let droppingHrId = droppingHr.firstElementChild.id.split('-');
    let droppingId = parseInt(droppingHrId[1]);
    let droppingLast: boolean = droppingHrId[2] !== undefined ? true : false;
    let draggingId = parseInt(event.dataTransfer.getData('sectionId'));

    if (this.notesS.sectionsUp) {
      //updating sections

      let changePlaceSection: Section = this.notesS.sections.find((section) => {
        return draggingId === section.id;
      });

      let oldPlaceSection: Section = this.notesS.sections.find((section) => {
        return droppingId === section.id;
      });

      if (oldPlaceSection !== changePlaceSection) {
        //old index of dragged element
        //used to determine, wheter user is moving element down or up
        let initIndex = changePlaceSection.index;
        let direction: string;

        //delete dragged
        this.notesS.sections.splice(changePlaceSection.index, 1);

        //set selected index
        changePlaceSection.index = oldPlaceSection.index;

        //Two ways of dragging - up and down
        //a bit different logic

        if (initIndex > oldPlaceSection.index) {
          direction = 'up';

          //dragging element above it's position
          this.notesS.sections.splice(
            oldPlaceSection.index,
            0,
            changePlaceSection
          );

          //increase index of every el which is in selected boundries
          this.notesS.sections.forEach((compSection) => {
            if (
              compSection.index >= changePlaceSection.index &&
              compSection != changePlaceSection &&
              compSection.index < initIndex
            ) {
              compSection.index++;
            }
          });
        } else {
          direction = 'down';
          //dragging element under it's position

          //if dragged to last position
          if (droppingLast) {
            this.notesS.sections.push(changePlaceSection);
          } else {
            //this has to be done becuase all sections are being found by ID, which in this case has to be -1
            changePlaceSection.index--;

            //index is as well -1
            oldPlaceSection.index;
            this.notesS.sections.splice(
              oldPlaceSection.index - 1,
              0,
              changePlaceSection
            );
          }

          //decrease index of every el which is in selected boundries
          this.notesS.sections.forEach((compSection) => {
            if (
              compSection.index <= changePlaceSection.index &&
              compSection != changePlaceSection &&
              compSection.index >= initIndex
            ) {
              compSection.index--;
            }
          });
        }
        let from, to;
        from = oldPlaceSection.index - 1;
        to = initIndex;

        if (direction === 'down') {
          if (droppingLast) {
            from = to;
            to = this.notesS.sections.length;
          } else {
            let x = to;
            to = from;
            from = x;
          }
        }

        this.onUpdateIndexes(to, from);
      }
    } else {
      //enables reordering only pages on the same level under same parent

      let changePlacePage: Page = this.findById(
        this.notesS.orderedPages,
        draggingId
      );

      let oldPlacePage: Page = this.findById(
        this.notesS.orderedPages,
        droppingId
      );

      console.log('from', changePlacePage);
      console.log('to', oldPlacePage);
    }

    //hides <hr> hint
    this.onDragRemoveHint(event);
  }

  onDragOver(event: DragEvent) {
    //(drop) doesnt work if this not set
    // event.stopPropagation();
    event.preventDefault();
  }
}
