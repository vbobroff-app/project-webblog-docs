import { Injectable, OnDestroy } from "@angular/core";
import { from, merge, of, Subject } from 'rxjs';

import { IdbApi } from "idb-observer";
import { map, mergeMap, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { IdbService } from "src/app/core/services/idb.service";
import { PostApi, PostApiBase } from "../api/post/post.api.base";
import { PostApiPlatform } from "../api/post/post.api.platform";
import { Post } from "../interfaces";


@Injectable({ providedIn: 'root' })
export class PostService extends PostApiBase implements PostApi, OnDestroy {

    public select$ = new Subject<string[]>();

    public posts: Post[] = [];

    private readonly idbApi: IdbApi;

    private db: IDBDatabase;

    private readonly destroy$=new Subject();

    constructor( private context: PostApiPlatform, private idb: IdbService){

      super(context.postApi);

      this.idbApi = new IdbApi();

      this.idb.dbInit$.pipe(
        takeUntil(this.destroy$)
      ).subscribe((db)=> {this.db = db; this.idbApi.init(db, 'posts')});

    }

    rewriteCatch(cashNumber?: number){
      if(!cashNumber) {
        cashNumber = this.posts.length;
      }

     return this.idbApi.safe(()=>this.idbApi.clear()).pipe(
        mergeMap(()=>from(this.posts.slice(0,cashNumber)).pipe(
          mergeMap((post)=>this.idbApi.create(post))
        )),
      )
    }

    getAllPosts(cashNumber: number = 5){
      if(this.posts?.length){
        return of(this.posts);
      }

      let cash = this.idbApi.safe(()=>this.idbApi.list<Post>());

      cash = cash.pipe(
        map(posts=>posts.sort((a, b)=>{
        if(a.created < b.created){
          return 1;
        }
        if(a.created > b.created){
          return -1;
        }
        return 0;
      })),
    );


      const list = this.getAll().pipe(
       // delay( 3000),
        tap(posts=> this.posts = posts),
        switchMap(()=>this.rewriteCatch(cashNumber)),
        take(1),
        map(()=>this.posts)
      );

      return merge(cash, list);

    }

    select(posts: string[]) {
        this.select$.next(posts);
    }
    resetAll(){
        this.select$.next(null);
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }


}
