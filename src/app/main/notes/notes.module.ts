import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesComponent } from './notes.component';
import { ContentComponent } from './content/content.component';
import { Routes, RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppFocus } from './content/appFocus.directive';
import { SectionsBarComponent } from './sections-bar/sections-bar.component';
import { OptionsBarComponent } from './options-bar/options-bar.component';

const routes: Routes = [{ path: '', component: NotesComponent }];

@NgModule({
  declarations: [
    NotesComponent,
    ContentComponent,
    AppFocus,
    SectionsBarComponent,
    OptionsBarComponent,
  ],
  imports: [CommonModule, DragDropModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotesModule {}
