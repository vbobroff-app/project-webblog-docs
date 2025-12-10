import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appModalRef]'
})
export class RefDirective {

  constructor(public containerRef: ViewContainerRef) { }

}
