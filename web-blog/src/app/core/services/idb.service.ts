import { Injectable, OnDestroy } from "@angular/core";
import Client from 'idb-observer';
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class IdbService  implements OnDestroy{

  private readonly destroy$ = new Subject();
  public readonly dbInit$: Observable<IDBDatabase>;

  constructor() {

    const client = new Client('web-blog');

    client.upgrade().pipe(
      takeUntil(this.destroy$),
    ).subscribe((db:IDBDatabase)=>{

      if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', {keyPath: 'id', autoIncrement: false});
      };

    });

     this.dbInit$ = client.init();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

}
