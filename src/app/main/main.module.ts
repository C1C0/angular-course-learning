import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main.component';
import { FaqComponent } from './faq/faq.component';
import { MainRoutingModule } from './main-routing.module';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FormCheckingDirective } from '../shared/form-checking.directive';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { DrawerComponent } from '../drawer/drawer.component';

@NgModule({
  declarations: [
    MainComponent,
    HomeComponent,
    FaqComponent,
    ProfileComponent,
    NavbarComponent,
    DrawerComponent
  ],
  imports: [CommonModule, MainRoutingModule],
  exports: []
})
export class MainModule {}
