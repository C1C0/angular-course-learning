import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent implements OnInit {
  loaded = false;

  icons = [
    {
      navigation: '/user/home',
      src: '../../assets/icons/landing_icon.png',
      alt: 'Klikni pre presun na domov',
      label: 'Domov',
    },
    {
      navigation: '/user/chatroom',
      src: '../../assets/icons/chat_icon.png',
      alt: 'Klikni pre presun na chatroom',
      label: 'Chatroom',
    },
    {
      navigation: '/user/notes',
      src: '../../assets/icons/notes_icon.png',
      alt: 'Klikni pre presun na poznánky',
      label: 'Poznámky',
    },
    {
      navigation: '/user/calendar',
      src: '../../assets/icons/calendar_icon.png',
      alt: 'Klikni pre presun na kalenár',
      label: 'Kalendár',
    },
  ];


  //get drawer as an elemnt
  @ViewChild('drawer') drawer: ElementRef;
  @ViewChild('drawerTriggerArrow') drawerTriggerArrow: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {}

  //makes the animation
  //in the future should be re-written in nicer code
  moveDrawer() {
    this.loaded = !this.loaded;
    if (this.loaded) {
      this.renderer.setStyle(
        this.drawer.nativeElement,
        'transform',
        'translateY(190px)'
      );
      this.renderer.setStyle(
        this.drawerTriggerArrow.nativeElement,
        'transform',
        'rotate(-90deg)'
      );
    } else {
      this.renderer.setStyle(
        this.drawer.nativeElement,
        'transform',
        'translateY(0)'
      );
      this.renderer.setStyle(
        this.drawerTriggerArrow.nativeElement,
        'transform',
        'rotate(90deg)'
      );
    }
  }
}
