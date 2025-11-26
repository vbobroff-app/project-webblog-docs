import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Post } from 'src/app/admin/shared/interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { HubService } from '../../../admin/shared/services/hub.service';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  @Input() post: Post;
  @Input() command: string;
  @Output() action = new EventEmitter<void>();

  public image: any;
  public title: string;
  public author: string;


  public width: number;
  public text: string ="";

  @ViewChild('element')
  element: ElementRef;


  constructor(private hubService: HubService, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) { }


  ngOnInit(): void {
    if (this.post && this.post.icon) {
      this.image = this.sanitizer.bypassSecurityTrustUrl(this.post.icon);
    }
  }

  ngAfterViewInit():void{

    if(this.post && this.element?.nativeElement){
       this.width = this.element?.nativeElement?.offsetWidth;
       this.text = this.strip(this.post.text, this.width);
    }
    this.cdr.detectChanges();
  }

  onResize(event) {

    if(this.element?.nativeElement){
      this.width = this.element.nativeElement.offsetWidth;
      this.text = this.strip(this.post.text, this.width)
    }
  }


  strip(html, width: number) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || "";

    const numb = width*0.3;
    return text.substring(0, numb) + "...";
  }

  onHubClick(hub: string){
    this.hubService.select(hub);
  }

}
