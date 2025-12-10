import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DropzoneComponent, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';


@Component({
  selector: 'app-dropzone-icon',
  templateUrl: './dropzone-icon.component.html',
  styleUrls: ['./dropzone-icon.component.scss']
})
export class DropzoneIconComponent implements OnInit {

  public config: DropzoneConfigInterface = {
    clickable: true,
    maxFiles: 1,
    autoReset: null,
    errorReset: null,
    cancelReset: 300
  };

  componentRef?: DropzoneComponent;
  @ViewChild(DropzoneComponent, { static: false }) set content(componentRef: DropzoneComponent) {
    if (componentRef) {
      this.componentRef = componentRef;
      this.setPostImage();
    }
  }

  @ViewChild('upload')
  upload: ElementRef<HTMLInputElement>;

  @Output() loaded = new EventEmitter<string>();
  @Output() reset = new EventEmitter<void>();

  public isLoaded: boolean = false;
  public blur: boolean = false;

  @Input() iconURL: string;

  private thumbnailMock = { name: "post icon", size: 12345 };

  constructor(private cd: ChangeDetectorRef) { }


  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }


  onLoad(files: FileList) {

    const file = files[0];
    if (!file) {
      return;
    }
    this.closeClick(); //else we are have two images

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.iconURL = reader.result.toString();
      this.loaded.emit(this.iconURL);
    };


  }

  onUpLoad($event: Event) {

    const files: FileList = ($event.target as HTMLInputElement).files;

    if(!files?.length) return;

    this.closeClick();
    this.onLoad(files);

    if (!!this.upload) {
      this.upload.nativeElement.value = '';
    }

  }

  closeClick() {
    if (this.componentRef && this.componentRef.directiveRef) {

      const dropzone = this.componentRef.directiveRef.dropzone();
      dropzone.removeFile(this.thumbnailMock);

      this.componentRef.directiveRef.reset();
      this.isLoaded = false;
      this.blur = false;
      this.iconURL = null;
      this.reset.emit();
    }
  }

  getOriginalLengthInBytes(base64string: string): number {
    if (!base64string) { return 0; }

    const characterCount = base64string.length;
    const ending = base64string.substring(characterCount - 2)
    var paddingCount = ending.split('=').length - 1;
    return (3 * (characterCount / 4)) - paddingCount;
  }

  setPostImage() {
    if (!this.iconURL) {
      return;
    }
    if (!this.componentRef || !this.componentRef.directiveRef) {
      return;
    }

    const dropzone = this.componentRef.directiveRef.dropzone();

    this.thumbnailMock = { name: "post icon", size: this.getOriginalLengthInBytes(this.iconURL) };
    dropzone.emit("addedfile", this.thumbnailMock);
    dropzone.emit("thumbnail", this.thumbnailMock, this.iconURL);
    dropzone.emit("complete", this.thumbnailMock);
    dropzone.emit("success", this.thumbnailMock);

    this.isLoaded = true;

  }

  ngOnChanges(changes: SimpleChanges) {
    if ('iconURL' in changes) {
      if (changes.iconURL.currentValue) {
        const url = changes.iconURL.currentValue.toString();
        if (!this.isLoaded) {
          this.iconURL = url;
          this.setPostImage();
        }
      }
      else {
        this.closeClick();
      }
    }
  }

}
