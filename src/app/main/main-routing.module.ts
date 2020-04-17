import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqComponent } from './faq/faq.component';
import { ProfileComponent } from '../profile/profile.component';
import { MainComponent } from './main.component';

const routes: Routes = [
    {path: '', component: MainComponent},
    {path: 'faq', component: FaqComponent},
    {path: 'profile', component: ProfileComponent},
]

@NgModule({
    imports:[
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class MainRoutingModule{}