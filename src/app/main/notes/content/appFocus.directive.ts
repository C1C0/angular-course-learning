import { Directive, HostListener, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appFocus]'
})
export class AppFocus{

  //sends focus state of element when clicked
  @Output('appFocus') focus = new EventEmitter<boolean>();

  //used for showing move arrows
  //above the element while moving out of boundaries
  //of content area, but still holding mousedown
  mousehold: boolean = false;

  //sets focus of textarea
  @HostListener('mousedown') setMouseHold(){
    this.mousehold = true;
    this.hostEl.nativeElement.children[1].focus();
  }

  @HostListener('mouseup') lostMouseHold(){
    this.mousehold = false;
  }

  //when mouse hovers over element, only then moving handle - "Arrows" -
  //are shown
  @HostListener('mouseenter') setVisi(){
    this.renderer.setStyle(this.hostEl.nativeElement.children[0], 'visibility', 'visible');
  }

  @HostListener('mouseleave') lostVisi(){
    if(!this.mousehold){
      this.renderer.setStyle(this.hostEl.nativeElement.children[0], 'visibility', 'hidden');
    }
  }

  @HostListener('click') setFocus(){
    this.focus.emit(true);
  }

  constructor(private hostEl: ElementRef, private renderer: Renderer2) { }

}
