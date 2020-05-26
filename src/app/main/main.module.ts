import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main.component';
import { FaqComponent } from './faq/faq.component';
import { MainRoutingModule } from './main-routing.module';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DrawerComponent } from '../drawer/drawer.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AddComponent } from './calendar/add/add.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NotesModule } from './notes/notes.module';

@NgModule({
  declarations: [
    MainComponent,
    HomeComponent,
    FaqComponent,
    ProfileComponent,
    NavbarComponent,
    DrawerComponent,
    CalendarComponent,
    AddComponent
  ],
  imports: [CommonModule, MainRoutingModule, ReactiveFormsModule, NotesModule],
  exports: []
})
export class MainModule {}
