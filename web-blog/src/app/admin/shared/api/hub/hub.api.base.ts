import { Observable } from "rxjs";
import { Hub, Post } from "src/app/admin/shared/interfaces";

export interface HubApi{

  create(hub: Hub): Observable<Hub>;

  getAll(): Observable<Hub[]>;
  getByName(hubName: string): Observable<Hub>;

  put(hub: Hub): Observable<Hub>;
  update(hub: Hub): Observable<Hub>;
  updateById(hubId: string, data): Observable<any>;
  updatesByPost(post: Post): Observable<Post>;

  clearLinks(): Observable<Hub[]>;
  linkedAll(posts: Post[]): Observable<Post[]>;

  remove(hub: Hub): Observable<void>
  deleteHubFromPosts(hub: Hub) :Observable<void>;
  deletePostFromHubs(post: Post) :Observable<void>;

}


export class HubApiBase implements HubApi {

   private readonly apiContext: HubApi;


   constructor( context: HubApi ){
     this.apiContext = context;
   }

   create(hub: Hub): Observable<Hub> {
    return this.apiContext.create(hub);
  }


  getAll(): Observable<Hub[]>{
    return this.apiContext.getAll();
  }
  getByName(hubName: string): Observable<Hub> {
   return this.apiContext.getByName(hubName);
  }


   put(hub: Hub): Observable<Hub>{
    return this.apiContext.put(hub);
   }

   update(hub: Hub): Observable<Hub>{
    return this.apiContext.update(hub);
   }

   updatesByPost(post: Post): Observable<Post> {
    return this.apiContext.updatesByPost(post);
  }

   updateById(hubId: string, data): Observable<any>{
    return this.apiContext.updateById(hubId, data);
   }


   clearLinks(): Observable<Hub[]>{
     return this.apiContext.clearLinks();
   }

   linkedAll(posts: Post[]): Observable<Post[]>{
    return this.apiContext.linkedAll(posts);
   }

   remove(hub: Hub): Observable<void> {
    return this.apiContext.remove(hub);
   }

   deleteHubFromPosts(hub: Hub) :Observable<void>{
    return this.apiContext.deleteHubFromPosts(hub);
   }

   deletePostFromHubs(post: Post) :Observable<void>{
     return this.apiContext.deletePostFromHubs(post);
   }

}
