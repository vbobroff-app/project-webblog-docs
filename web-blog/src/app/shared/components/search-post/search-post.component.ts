import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Moment } from 'moment';
import { MatSelectChange } from '@angular/material/select';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-search-post',
  templateUrl: './search-post.component.html',
  styleUrls: ['./search-post.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class SearchPostComponent implements OnInit {

  public selected = 'Название';
  public markedFilter: boolean;
  public dateFilter: boolean;

  public selectedDate: Date = new Date();

  public actions: string[] = ['за 3 дня','за неделю','за месяц', this.getDates()];
  public selectedValue: string = this.actions[1];

  public focused = false;
  public typing = false;
  public searching = false;
  public hasValue = false;

  @ViewChild('searchInput')
  searchInput: ElementRef<HTMLInputElement>;

  constructor() { }

  ngOnInit(): void {
    this.selected = ''
  }

  onFocus($event){
    this.searching = false;
    this.focused = true;
    this.hasValue = !!this.searchInput.nativeElement.value;
    if(this.hasValue){
      this.typing = true;
    }
  }

  onBlur($event){

    if($event.relatedTarget?.id=='close-button'){
      this.closeClick();
    }

    this.focused = false;
    this.typing = false;
  }

  onTextChange($event){
    console.log($event);
  }

  onTyping($event){
   this.hasValue = !!this.searchInput.nativeElement.value;

    this.searching = false;
    if(this.hasValue){
      this.typing = true;
    }

  }

  searchClick(){
    if(this.hasValue){
      this.searching = true;
    }

  }

  closeClick(){
    this.searchInput.nativeElement.value = '';
    this.hasValue=false;
  }

  markedClick(){
    this.markedFilter = !this.markedFilter;
  }

  dateChange($event: MatDatepickerInputEvent<Moment>){
     this.selectedDate = $event.value.toDate();
     this.actions[3] = this.getDates(this.selectedDate);
     this.selectedValue = this.actions[3];
  }

  onSelect($event: MatSelectChange){
    this.selectedValue = $event.value;
  }

  dateClick(){
    this.dateFilter = !this.dateFilter;
  }

  getDates(date?: Date){
   var d = date? date : new Date();

    const datePipe = new DatePipe('en-US');
	  const dateLabel = datePipe.transform(d, 'dd.MM.yyyy');
    return 'c ' + dateLabel;
  }

  onValChange(value:string){
     console.log('value=', value);
  }

  markedCount(){
    return 10;
  }

}
