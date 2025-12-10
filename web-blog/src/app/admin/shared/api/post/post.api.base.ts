import { Observable } from "rxjs";
import { Post } from "../../interfaces";

export interface PostApi {

  create(post: Post): Observable<Post>;
  getAll(): Observable<Post[]>;

  getRecent(): Observable<Post[]> ;
  getPopular(): Observable<Post[]> ;

  getById(id: string): Observable<Post> ;

  getByRange(ids: string[]): Observable<Post[]> ;

  update(post: Post | string, data?: {}): Observable<Post>;

  remove(post: Post | string): Observable<void>;

}


export class PostApiBase implements PostApi {

  private readonly apiContext: PostApi;

  constructor( context: PostApi ){
    this.apiContext = context;
  }

  create(post: Post): Observable<Post>{
    return this.apiContext.create(post);
  }
  getAll(): Observable<Post[]>{
    return this.apiContext.getAll();
  }

  getRecent(): Observable<Post[]> {
    return this.apiContext.getRecent();
  }
  getPopular(): Observable<Post[]>{
    return this.apiContext.getPopular();
  }

  getById(id: string): Observable<Post>{
    return this.apiContext.getById(id);
  }

  getByRange(ids: string[]): Observable<Post[]>{
    return this.apiContext.getByRange(ids);
  }

  update(post: Post | string, data?: {}): Observable<Post>{
    return this.apiContext.update(post);
  }

  remove(post: Post | string): Observable<void>{
    return this.apiContext.remove(post);
  }

}
