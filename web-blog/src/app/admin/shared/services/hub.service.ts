import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Hub } from '../interfaces';
import { HubApi, HubApiBase } from '../api/hub/hub.api.base';
import { HubApiPlatform } from '../api/hub/hub.api.platform';


@Injectable({ providedIn: 'root' })
export class HubService extends HubApiBase  implements OnDestroy, HubApi  {

  private readonly destroy$ = new Subject();

  public close$ = new Subject<string>();
  public select$ = new Subject<Hub>();

  public hubs: Hub[];

  constructor( private context: HubApiPlatform) {
    super(context.api);
  }


  close(key: string) {
    this.close$.next(key);
  }

  select(name: string) {
    this.getByName(name).pipe(takeUntil(this.destroy$))
      .subscribe(hub => this.select$.next(hub));
  }

  get hubList(): string[] {
    if (!this.hubs) {
      return [];
    }
    return this.hubs.map(h => h.name);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
