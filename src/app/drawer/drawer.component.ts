import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';



@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent implements OnInit {

  loaded = false;

  @ViewChild('drawer') drawer: ElementRef;
  @ViewChild('drawerTriggerArrow') drawerTriggerArrow: ElementRef;

  constructor(
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
  }

  moveDrawer() {
    this.loaded = !this.loaded;
    if(this.loaded){
      this.renderer.setStyle(this.drawer.nativeElement, "transform", 'translateY(190px)');
      this.renderer.setStyle(this.drawerTriggerArrow.nativeElement, "transform", 'rotate(-90deg)');
    }else{
      this.renderer.setStyle(this.drawer.nativeElement, "transform", 'translateY(0)')
      this.renderer.setStyle(this.drawerTriggerArrow.nativeElement, "transform", 'rotate(90deg)');
    }
    
  }

}
