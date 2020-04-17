import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main.component';
import { FaqComponent } from './faq/faq.component';
import { RouterModule } from '@angular/router';
import { MainRoutingModule } from './main-routing.module';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from '../profile/profile.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    MainComponent,
    HomeComponent,
    FaqComponent,
    ProfileComponent,
    NavbarComponent,
  ],
  imports: [CommonModule, MainRoutingModule],
})
export class MainModule {}
