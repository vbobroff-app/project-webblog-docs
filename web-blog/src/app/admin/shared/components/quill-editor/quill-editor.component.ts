import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';
import BlotFormatter from 'quill-blot-formatter/dist/BlotFormatter';

Quill.register('modules/blotFormatter', BlotFormatter);

interface ShadowBlot {
  new (...args: any[]):ShadowBlot;
  domNode: any;
  format(name, value);
}

var BaseImageFormat: ShadowBlot = Quill.import('formats/image');
const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style'
];

class StyledImageFormat extends BaseImageFormat  {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(StyledImageFormat, true);


@Component({
  selector: 'app-quill-editor',
  templateUrl: './quill-editor.component.html',
  styleUrls: ['./quill-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillEditorComponent),
      multi: true
    }
  ]
})
export class QuillEditorComponent implements ControlValueAccessor, OnInit {
  
  
  private isTouched: boolean;
  private isCalled: boolean;
  private disabled: boolean;

  private editor: any;

  public modules: any;

  public onChange: (value: string) => void;
  public onTouched: () => void;

  public text: string;


  constructor() { }

  ngOnInit() {
    this.modules = {
      // toolbar: {
      //   container: [
      //     [{ 'font': [] }],
      //     [{ 'size': ['small', false, 'large', 'huge'] }],
      //     ['bold', 'italic', 'underline', 'strike'],
      //     [{ 'header': 1 }, { 'header': 2 }],
      //     [{ 'color': [] }, { 'background': [] }],
      //     [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      //     [{ 'align': [] }],
      //     ['link', 'image']
      //   ]
      // },
      blotFormatter: {}
    };
  }

  onClickedOutside() {

      if(this.isTouched && !this.isCalled){
        this.isCalled = true;
        this.onTouched();
      }
  }

  onEditorCreated(quill: Quill) {
    this.editor = quill;
  }

  onFocus(event){
    if(this.isTouched){
      return;
    }
    this.isTouched = true;   
  }
  

  writeValue(text: string): void {
    this.text = text;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched=fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}
