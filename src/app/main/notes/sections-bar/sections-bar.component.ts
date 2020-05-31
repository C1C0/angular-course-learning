import { Component, OnInit } from '@angular/core';
import { NotesService } from '../notes.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Student } from 'src/app/shared/student.model';

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

@Component({
  selector: 'app-sections-bar',
  templateUrl: './sections-bar.component.html',
  styleUrls: ['./sections-bar.component.scss'],
})
export class SectionsBarComponent implements OnInit {
  constructor(public notesS: NotesService, private authService: AuthService) {}

  ngOnInit(): void {
    //get student params
    this.authService.getStudent().subscribe((student) => {
      this.notesS.student = student;

      //get sections
      this.notesS.getSections(this.notesS.student).subscribe((sections) => {
        this.notesS.sections = sections;
        this.notesS.selectedSection = sections[0];
      });
    });
  }

  //selected section will be changed
  onSelectSection(sectionId) {
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

  //changes content in content component
  onSelectPage(pageId) {
    for (let page of this.notesS.orderedPages) {
      this.findPageById(page, pageId);
    }
    //sets content by selected page
    this.notesS.getPage(this.notesS.student).subscribe((page) => {
      this.notesS.textFields = JSON.parse(page.content);
    });
  }

  findPageById(el, id): any {
    //recursion
    if (el === null || el === undefined) return;

    if (el.id === id) {
      this.notesS.selectedPage = el;
    }

    //check for 'children' properties
    for (let val of Object.values(el)) {
      if (val && typeof val === 'object') {
        let page = this.findPageById(val, id);
        if(page) return page;        
      }
    }
  }

  setPageClass(pageId) {
    if (!this.notesS.selectedPage) return false;
    return pageId === this.notesS.selectedPage.id;
  }

  onGetPages() {
    this.notesS.getPages(this.notesS.student).subscribe((pages) => {
      this.notesS.pages = pages;
      this.orderPages();
    });
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

  orderPages() {
    //filter each level
    //connect parents with children
    //then reorder base on index

    let filteredPages = [[], [], [], []];
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

    //set parents and childrens, reorder null level, each loop covers one level of sections
    //top - "0" level
    for (let page of filteredPages[0]) {
      this.notesS.orderedPages[page.index] = page;
    }

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
  }

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

    parent.children[object.index] = object;
  }
}
