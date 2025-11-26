import { Injectable } from '@angular/core';
import { Observable, combineLatest, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Databases, ID } from 'appwrite';

import { environment } from 'src/environments/environment';
import { AwHubApi } from '../../hub/appwrite/aw.hub.api';
import { Post } from '../../../interfaces';
import { WebAppService } from 'src/app/core/services/webapp.service';

import { AwGetAllResponse, AwPostModel, mapToPost, mapToPosts, postToDto } from './models';
import { isNorOrEmpty } from 'src/app/core/functions';



@Injectable({
  providedIn: 'root'
})
export class AwPostApi {

  public databases: Databases;

  constructor(private aw: WebAppService, private hubApi: AwHubApi) {
    this.databases = aw.databases;
  }


  create(post: Post): Observable<Post> {
    if(isNorOrEmpty(post)){
      return of(post);
    }
    return from(this.databases.createDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.posts, // collectionId
      ID.unique(),
      postToDto(post),
      ['read("any")'] // permissions (optional)
    )).pipe(
      map((doc: AwPostModel) => mapToPost(doc)),
      switchMap((post) => this.hubApi.updatesByPost(post)),
    )
  }

  getAll(): Observable<Post[]> {

    return from(this.databases.listDocuments(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.posts, // collectionId
      [] // queries (optional)
    )).pipe(
      map((docs: AwGetAllResponse) => mapToPosts(docs)),
      map(posts=>posts.sort((a, b)=>{
        if(a.created < b.created){
          return 1;
        }
        if(a.created > b.created){
          return -1;
        }
        return 0;
      }))
    );

  }

  getRecent(): Observable<Post[]> {
    return this.getAll().pipe(map(posts => posts.slice(0, 5)))
  }

  getPopular(): Observable<Post[]> {
    return this.getAll().pipe(map(posts => posts.slice(0, 5)))
  }

  getById(id: string): Observable<Post> {
    if(!id){
      return of(null);
    }
    return from(this.databases.getDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.posts, // collectionId
      id, // documentId
      [] // queries (optional)
    )).pipe(
      map((doc: AwPostModel) => mapToPost(doc))
    )
  }

  getByRange(ids: string[]): Observable<Post[]> {
    if(!ids?.length){
      return of([]);
    }
    return combineLatest([
      ...ids.map(id => from(this.databases.getDocument(
        environment.webAppConfig.databaseId, // databaseId
        environment.webAppConfig.collections.posts, // collectionId
        id, // documentId
        [] // queries (optional)
      )).pipe(
        map((response: AwPostModel) => mapToPost(response))
      )
      )
    ])
  }

  update(post: Post | string, data?: {}): Observable<Post> {
    if(!post){
      return of(null);
    }
    const id = typeof post === 'string' ? post : post.id;
    if(!data && typeof post === 'string'){
      data = {};
    }
    return from(this.databases.updateDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.posts, // collectionId
      id, // documentId
      data? data : postToDto(post as Post), // data (optional)
      ['read("any")'] // permissions (optional)
    )).pipe(
      map((doc: AwPostModel) => mapToPost(doc)),
      switchMap((post) => this.hubApi.updatesByPost(post))
    )
  }

  remove(post: Post | string): Observable<void> {
    if(isNorOrEmpty(post)){
      return void 0;
    }
    const id = typeof post === 'string' ? post : post.id;
    return from(this.databases.deleteDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.posts, // collectionId
      id, // documentId
    )).pipe(
      switchMap(()=> typeof post === 'string'? this.getById(id) : of(post)),
      switchMap((post: Post) => this.hubApi.deletePostFromHubs(post))
    )
  }

}
