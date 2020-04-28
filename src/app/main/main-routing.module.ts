import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqComponent } from './faq/faq.component';
import { ProfileComponent } from './profile/profile.component';
import { MainComponent } from './main.component';
import { HomeComponent } from './home/home.component';
import { CalendarComponent } from './calendar/calendar.component';

const routes: Routes = [
  // '' -> represents /user
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'calendar', component: CalendarComponent },
    ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
