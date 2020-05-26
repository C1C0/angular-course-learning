import { Component, OnInit } from '@angular/core';
import { NotesService } from '../notes.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Student } from 'src/app/shared/student.model';

@Component({
  selector: 'app-sections-bar',
  templateUrl: './sections-bar.component.html',
  styleUrls: ['./sections-bar.component.scss'],
})
export class SectionsBarComponent implements OnInit {
  student: Student;

  //section(s) variables
  sections = [];
  selectedSection;
  sectionsUp: boolean = true;

  //pages variables
  pages = [
    { id: 1, content: 'Literarna moderna', section_id: 2, level: 0 },
    { id: 1, content: 'Prekliati basnici', section_id: 2, level: 0 },
    { id: 1, content: 'Charles Baudelaire', section_id: 2, level: 0 },
    { id: 1, content: 'Ivan Krasko', section_id: 2, level: 0 },
    { id: 1, content: 'Predvojnove avantgardy', section_id: 2, level: 0 },
  ];
  selectedPage;

  constructor(
    private notesService: NotesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getStudent().subscribe((student) => {
      this.student = student;
    });

    console.log(
      this.notesService.getSections(this.student).subscribe((sections) => {
        console.log(sections);
        this.sections = sections;
        this.selectedSection = sections[0];
      })
    );
  }

  onSelect(event) {
    this.selectedSection = this.sections.find((section) => {
      return section.id == event.target.id;
    });
    this.sectionsUp = false;
    this.onGetPages();
  }

  onGetPages() {
    this.notesService
      .getPages(this.student, this.selectedSection)
      .subscribe((pages) => {
        console.log(pages);
        this.pages = pages;
      });
  }

  onMove(where = 'sections') {
    switch (where) {
      case 'sections':
        this.sectionsUp = true;
        break;
      case 'pages':
        this.sectionsUp = false;
        break;
    }
  }
}
