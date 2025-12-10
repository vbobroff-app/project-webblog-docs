import { EventEmitter, ViewContainerRef } from '@angular/core';

export interface Modal<T>{
    id: any;
    name?:string;
    options?: any;
    close: EventEmitter<void>;
    cancel?: EventEmitter<void>;
    submit: EventEmitter<T>;
    viewRef?: ViewContainerRef;
}
