import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { NotesService } from '../notes.service';
import { AuthService } from 'src/app/auth/auth.service';

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

  //pages
  toUpdatePages: { id: number; index: number; parentId: number }[] = [];

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
    let selectedSectionBeforeChange = this.notesS.selectedSection;
    if (!this.renaming && !this.contextMenu.up) {
      if (this.notesS.selectedSection.id !== sectionId) {
        this.notesS.selectedSection = this.notesS.sections.find((section) => {
          return section.id === sectionId;
        });
      }

      if (
        this.notesS.pages.length === 0 ||
        this.notesS.selectedSection.id !== selectedSectionBeforeChange.id
      ) {
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
    this.notesS.delSection(this.contextMenu.id).subscribe(() => {
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
      this.notesS.putSection(this.contextMenu.id, newValue).subscribe(() => {
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
    if (this.notesS.selectedPage && this.notesS.selectedPage.id === pageId)
      return;

    this.notesS.selectedPage = this.findById(this.notesS.pages, pageId);
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

  //get pages of selected section
  onGetPages() {
    this.notesS.getPages(this.notesS.student).subscribe((pages) => {
      this.notesS.pages = pages;
      this.orderPages();
    });
  }

  //orders by page Index
  orderPages() {
    // orders everything
    this.orderByIndex(this.notesS.pages);
    console.log(this.notesS.pages);
  }

  //pages managing
  onCreatePage() {
    let newIndex = 0;

    if (this.notesS.pages.length != 0) {
      newIndex = this.findHighest(this.notesS.pages, 'index') + 1;
    }

    this.notesS.postPage('Nová stránka', 0, newIndex).subscribe((page) => {
      this.notesS.pages.push(page);
    });
  }

  onDeletePage() {
    this.notesS.delPage(this.contextMenu.id).subscribe(() => {
      //find page
      let delpage: Page = this.notesS.pages.find((page) => {
        return this.contextMenu.id === page.id;
      });

      //to all pages that comes after  this page (with higher index), lower index by one
      this.notesS.pages.forEach((comppage) => {
        if (comppage.index > delpage.index) {
          comppage.index--;
        }
      });

      //removes page
      let pageArrayPos: number = this.notesS.pages.indexOf(delpage);
      this.notesS.pages.splice(pageArrayPos, 1);

      this.onUpdateIndexes(this.notesS.pages.length, delpage.index);

      console.log(this.notesS.pages);
    
    })
  }

  onChangePageToInput() {
    //to make sure user cant load pages
    this.renaming = true;

    //creates element
    let li = document.getElementById(this.contextMenu.id);
    li.draggable = false;

    //creates input and creates new listener to it
    let input = this.renderer.createElement('input');
    input.addEventListener('blur', this.renamePage.bind(this), true);
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

  renamePage(event) {
    let calledInputEl = <HTMLInputElement>event.target;

    let newValue: string = calledInputEl.value;
    if (newValue === '') newValue = 'Nová sekcia';

    let oldValue = calledInputEl.attributes.getNamedItem('data-initvalue')
      .value;

    //If value doesnt change, it is waste of performance to send any http request
    if (oldValue != newValue) {
      this.notesS.putPage(this.contextMenu.id, {title: newValue}).subscribe(() => {
        //find page
        let renpage = this.notesS.pages.find((page) => {
          return this.contextMenu.id === page.id;
        });

        //writes locally
        renpage.title = newValue;
        console.log(renpage);
      });
    }

    //sets newly created value
    calledInputEl.parentElement.draggable = true;
    calledInputEl.parentElement.innerHTML = newValue;

    this.renaming = false;
  }

  changeLevel(direction: string) {
    //change level
    //check parents and children around
    let pageEl: Page = this.findById(this.notesS.pages, this.contextMenu.id, false);

    //just change level
    switch (direction) {
      case 'left':
        if (pageEl.level > 0) pageEl.level--;
        break;
      case 'right':
        if (pageEl.level < 3) pageEl.level++;
        break;
    }

    //TODO allow if only any potentional parent
    this.updateParentChildren(pageEl);
  }

  updateParentChildren(changedPage: Page) {
    //find parent
    if (changedPage.level != 0) this.updateParentId(changedPage);

    //find children (pages with higher level)
    console.clear();
    let i = changedPage.index;
    let child: Page = null;
    this.changedChildrenPage = [];
    do {
      i++;
      child = this.notesS.pages[i];

      this.updateParentId(child);
    } while (i < this.notesS.pages.length - 1);

    this.notesS.putPagesIndexes(this.changedChildrenPage).subscribe(mess=>{
      console.log(mess);
    })
  }

  changedChildrenPage = [];
  updateParentId(changedPage: Page): Page {
    //find parent (page with lower level)
    let i = changedPage.index;
    let initPId = changedPage.parentId;
    let parentLevel;
    let parent: Page = null;

    do {
      i--;
      parentLevel =
        this.notesS.pages[i].level === null ? 0 : this.notesS.pages[i].level;
      if (parentLevel < changedPage.level) {
        parent = this.notesS.pages[i];
        changedPage.parentId = parent.id;
        if (initPId !== parent.id) {
          this.changedChildrenPage.push({
            id: changedPage.id,
            index: changedPage.index,
            parentId: changedPage.parentId,
          });
        }
      }
    } while (i > 0 && !parent);
    return parent;
  }

  //!Others

  onUpdateIndexes(to: number, from: number = 0) {
    if (this.notesS.sectionsUp) {
      this.toUpdateSections = [];
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
    } else {
      this.notesS.pages.forEach((page: Page) => {
        if (!this.toUpdatePages.includes({id: page.id, index: page.index, parentId: page.parentId})) {
          if (from <= page.index && page.index <= to) {
            this.updateParentId(page);
            this.toUpdatePages.push({
              id: page.id,
              index: page.index,
              parentId: page.parentId,
            });
          }
        }
      });
      this.notesS.putPagesIndexes(this.toUpdatePages).subscribe(mess => {
        console.log(mess);
      })
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

    console.log(this.notesS.sectionsUp);
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

  findById(arr, id, includeChildren: boolean = true): any {
    //recursion
    let found: Page | Section;

    for (let el of arr) {
      if (el === null || el === undefined) return;

      if (el.id === id) {
        found = el;
        break;
      }

      //check for 'children' properties
      if (includeChildren) {
        for (let val of Object.values(el)) {
          if (val && typeof val === 'object') {
            let page = this.findById(val, id);
            if (page) return page;
          }
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

  onDragRemoveHint() {
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

      let changePlacePage: Page = this.findById(this.notesS.pages, draggingId);

      let oldPlacePage: Page = this.findById(this.notesS.pages, droppingId);

      this.toUpdatePages = [];
      if (oldPlacePage !== changePlacePage) {
        //old index of dragged element
        //used to determine, wheter user is moving element down or up
        let initIndex = changePlacePage.index;
        let direction: string;

        //delete dragged
        this.notesS.pages.splice(changePlacePage.index, 1);

        //set selected index
        changePlacePage.index = oldPlacePage.index;

        //Two ways of dragging - up and down
        //a bit different logic
        if (initIndex > oldPlacePage.index) {
          direction = 'up';

          //dragging element above it's position
          this.notesS.pages.splice(oldPlacePage.index, 0, changePlacePage);

          //increase index of every el which is in selected boundries
          this.notesS.pages.forEach((compPage) => {
            if (
              compPage.index >= changePlacePage.index &&
              compPage != changePlacePage &&
              compPage.index < initIndex
            ) {
              compPage.index++;
            }
          });
          this.updateParentChildren(this.notesS.pages[initIndex]);
          this.toUpdatePages = this.changedChildrenPage;
        } else {
          direction = 'down';
          //dragging element under it's position

          //if dragged to last position
          if (droppingLast) {
            this.notesS.pages.push(changePlacePage);
          } else {
            //this has to be done becuase all pages are being found by ID, which in this case has to be -1
            changePlacePage.index--;

            //index is as well -1
            oldPlacePage.index;
            this.notesS.pages.splice(
              oldPlacePage.index - 1,
              0,
              changePlacePage
            );
          }

          //decrease index of every el which is in selected boundries
          this.notesS.pages.forEach((compPage) => {
            if (
              compPage.index <= changePlacePage.index &&
              compPage != changePlacePage &&
              compPage.index >= initIndex
            ) {
              compPage.index--;
            }
          });
          this.updateParentChildren(this.notesS.pages[initIndex]);
          this.toUpdatePages = this.changedChildrenPage;
        }
        let from, to;
        from = oldPlacePage.index - 1;
        to = initIndex;

        if (direction === 'down') {
          if (droppingLast) {
            from = to;
            to = this.notesS.pages.length;
          } else {
            let x = to;
            to = from;
            from = x;
          }
        }
        this.onUpdateIndexes(to, from);
      }
    }

    //hides <hr> hint
    this.onDragRemoveHint();
  }

  onDragOver(event: DragEvent) {
    //(drop) doesnt work if this not set
    // event.stopPropagation();
    event.preventDefault();
  }
}
