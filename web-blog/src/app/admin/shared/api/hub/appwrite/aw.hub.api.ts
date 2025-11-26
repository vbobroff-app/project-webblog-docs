import { Injectable } from '@angular/core';
import { Databases, ID, Query } from 'appwrite';
import { Observable, from, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Hub, Post } from 'src/app/admin/shared/interfaces';
import { WebAppService } from 'src/app/core/services/webapp.service';

import { AwHubModel, HubListResponse, addUniq, hubToDto, mapToHub, mapToHubs, removeFromArray } from './models';
import { concatMap, map, switchMap, toArray } from 'rxjs/operators';
import { isNorOrEmpty } from 'src/app/core/functions';
import { HubApi } from '../hub.api.base';
import { AwPostModel, mapToPost } from '../../post/appwrite/models';


@Injectable({
  providedIn: 'root'
})
export class AwHubApi  implements HubApi{

  public databases: Databases;

  constructor(private aw: WebAppService) {
    this.databases = aw.databases;
  }


  create(hub: Hub): Observable<Hub> {
    if (isNorOrEmpty(hub)) {
      return of(hub);
    }
    return from(this.databases.createDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.hubs, // collectionId
      ID.unique(),
      hubToDto(hub),
      ['read("any")'] // permissions (optional)
    )).pipe(
      map((doc: AwHubModel) => mapToHub(doc))
    )
  }


  clearLinks(): Observable<Hub[]> {
    return this.getAll().pipe(
      concatMap(hubs => from(hubs).pipe(switchMap(h => this.update(h, { posts: [] })))),
      toArray()
    )
  }

  linkedAll(posts: Post[]): Observable<Post[]> {
    return from(posts).pipe(
      concatMap(post => this.updatesByPost(post)),
      toArray()
    )
  }


  updatesByPost(post: Post): Observable<Post> {
    if (!post?.hubs?.length) {
      return of(post);
    }
    return from(post.hubs).pipe(
      concatMap(hubName => this.getByName(hubName)),
      switchMap(hub => this.update(hub ? hub.id : null, hub?.posts ? { posts: addUniq(hub.posts, post.id) } : { posts: [post.id] })),
    ).pipe(
      map(() => post)
    )
  }

  getByName(hubName: string): Observable<Hub> {
    if (!hubName) {
      return of(null);
    }
    return from(this.databases.listDocuments(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.hubs, // collectionId
      [Query.equal('name', [hubName])] // queries (optional)
    )).pipe(
      map((docs: HubListResponse) => mapToHubs(docs)[0])
    );
  }

  getById(id: string): Observable<Hub> {
    if (!id) {
      return of(null);
    }
    return from(this.databases.getDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.hubs, // collectionId
      id, // documentId
      [] // queries (optional)
    )).pipe(
      map((doc: AwHubModel) => mapToHub(doc))
    )
  }

  deletePostFromHubs(post: Post): Observable<void> {
    if (isNorOrEmpty(post)) {
      return of(void 0);
    }
    if (!post.hubs || !post.hubs.length) {
      return of(void 0);
    }
    return from(post.hubs).pipe(
      concatMap(hubName => this.getByName(hubName)),
      switchMap(hub => this.updateById(hub ? hub.id : null, hub?.posts ? { posts: removeFromArray(hub.posts, post.id) } : { posts: [] })),
      map(() => { })
    )
  }

  updateById(hubId: string, data): Observable<any> {
    if (!hubId) {
      return of(data);
    }
    return this.update(hubId, data);
  }

  update(hub: Hub | string, data?: {}): Observable<Hub> {
    if (isNorOrEmpty(hub)) {
      return of(null);
    }
    const id = typeof hub === 'string' ? hub : hub.id;
    if (!data && typeof hub === 'string') {
      data = {};
    }
    return from(this.databases.updateDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.hubs, // collectionId
      id, // documentId
      data ? data : hubToDto(hub as Hub), // data (optional)
      ['read("any")'] // permissions (optional)
    )).pipe(
      map((doc: AwHubModel) => mapToHub(doc))
    )
  }

  put(hub: Hub): Observable<Hub> {
    if (isNorOrEmpty(hub)) {
      return of(null);
    }

    const data = hubToDto(hub);

    return from(this.databases.updateDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.hubs, // collectionId
      hub.id, // documentId
      data, // data (optional)
      ['read("any")'] // permissions (optional)
    )).pipe(
      map((doc: AwHubModel) => mapToHub(doc))
    )
  }

  getAll(): Observable<Hub[]> {

    return from(this.databases.listDocuments(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.hubs, // collectionId
      [] // queries (optional)
    )).pipe(
      map((docs: HubListResponse) => mapToHubs(docs))
    );

  }

  deleteHubFromPosts(hub: Hub): Observable<void> {
    if (isNorOrEmpty(hub)) {
      return of(void 0);
    }
    if (!hub.posts || !hub.posts.length) {
      return of(void 0);
    }

    return from(hub.posts).pipe(
      concatMap(id => this.getPost(id)),
      switchMap((post) => {
        return this.updatePostData(post.id, post?.id ? { hubs: removeFromArray(post.hubs, hub.name) } : {})
      }),
      map(() => { })
    )
  }

  updatePostData(postId: string, data?: {}): Observable<any> {
    if (!postId) {
      return of(data)
    }
    return from(this.databases.updateDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.posts, // collectionId
      postId, // documentId
      data, // data (optional)
      ['read("any")'] // permissions (optional)
    ))
  }

  getPost(id: string): Observable<Post> {
    if (!id) {
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



  remove(hub: Hub | string): Observable<void> {
    if (isNorOrEmpty(hub)) {
      return void 0;
    }
    const id = typeof hub === 'string' ? hub : hub.id;
    return from(this.databases.deleteDocument(
      environment.webAppConfig.databaseId, // databaseId
      environment.webAppConfig.collections.hubs, // collectionId
      id, // documentId
    )).pipe(
      switchMap(() => typeof hub === 'string' ? this.getById(hub) : of(hub)),
      switchMap((hub: Hub) => this.deleteHubFromPosts(hub))
    )
  }

}
