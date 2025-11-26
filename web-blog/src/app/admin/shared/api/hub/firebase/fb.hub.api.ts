import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, of, from } from "rxjs";
import { map, concatMap, switchMap, toArray } from "rxjs/operators";

import { environment } from "src/environments/environment";
import { Hub, Post } from "src/app/admin/shared/interfaces";
import { isNorOrEmpty } from "src/app/core/functions";

import { HubApi } from "../hub.api.base";
import { FbCreateResponse, FbGetResponse } from "../../fb.dto";
import { hubModel } from "./models";

@Injectable({ providedIn: 'root' })
export class FbHubApi  implements HubApi{

    constructor(private http: HttpClient) { }

    create(hub: Hub): Observable<Hub> {
        hub.created = new Date();
        const model = hubModel(hub);
        hub.changed = new Date(model.changed);
        return this.http.post<FbCreateResponse>(`${environment.fbUrl}/hubs.json`, model).pipe(map(
            (response: FbCreateResponse) => {
                const respHub: Hub = {
                    ...hub,
                    id: response.name
                };
                return respHub;
            }));
    }

    updatesByPost(post: Post): Observable<Post> {
        if(!post.hubs?.length){
            return of(post);
        }
        let data = {};
        const key = `posts/${post.id}`;
        data[key] = true;
        data['changed'] = new Date();
        return from(post.hubs).pipe(
            concatMap(hubName=>this.getByName(hubName)),
            switchMap(hub =>  this.updateById(hub? hub.id : null, data)),
            map(() => post)
        )
    }

    getByName(hubName: string): Observable<Hub> {
        return this.http.get<any>(`${environment.fbUrl}/hubs.json?orderBy="name"&equalTo="${hubName}"`).pipe(
            map((response) => {
               if(isNorOrEmpty(response)){
                    return undefined;
               }
                const key = Object.keys(response)[0];
                const hub: Hub = {
                    ...response[key],
                    id: key,
                    changed: new Date(response[key].changed),
                    created: new Date(response[key].created),
                    posts: response[key].posts ? [...Object.keys(response[key].posts)] : []
                }
                return hub;
            })
        )
    }

    clearLinks(): Observable<Hub[]> {
      return this.getAll().pipe(
        concatMap(hubs => from(hubs).pipe(switchMap(h => this.update( { ...h, posts: [] })))),
        toArray()
      )
    }

    linkedAll(posts: Post[]): Observable<Post[]> {
      return from(posts).pipe(
        concatMap(post => this.updatesByPost(post)),
        toArray()
      )
    }


    deletePostFromHubs(post: Post) :Observable<void> {
        if(isNorOrEmpty(post)){
            return of(void 0);
        }
        if(!post.hubs || !post.hubs.length){
            return of(void 0);
        }
        let data = {};
        const key = `posts/${post.id}`;
        data[key] = null;
        data['changed'] = new Date();
        return from(post.hubs).pipe(
            concatMap(hubName=>this.getByName(hubName)),
            switchMap(hub =>  this.updateById(hub? hub.id : null, data)),
            map(() => {})
        )
    }

    updateById(hubId: string, data): Observable<any> {
        if(!hubId){
            return of(data);
        }
        return this.http.patch<any>(`${environment.fbUrl}/hubs/${hubId}.json`, data);
    }

    updatePostDate(postId: string, data): Observable<any> {
        return this.http.patch<any>(`${environment.fbUrl}/posts/${postId}.json`, data);
    }

    put(hub: Hub): Observable<Hub> {
        return this.http.put<Hub>(`${environment.fbUrl}/hubs/${hub.id}.json`, hubModel(hub));
    }

    update(hub: Hub): Observable<Hub> {
        return this.http.patch<Hub>(`${environment.fbUrl}/hubs/${hub.id}.json`, hubModel(hub));
    }

    getAll(): Observable<Hub[]> {
        return this.http.get<FbGetResponse>(`${environment.fbUrl}/hubs.json`).pipe(map((response: FbGetResponse) => {
            const posts: Hub[] = Object.keys(response).map((key) => {
                const post: Hub = {
                    ...response[key],
                    id: key,
                    changed: new Date(response[key].changed),
                    created: new Date(response[key].created),
                    posts: response[key].posts? [...Object.keys(response[key].posts)]: []
                };
                return post;
            })
            return posts;
        }));
    }

    deleteHubFromPosts(hub: Hub) :Observable<void> {
        if(isNorOrEmpty(hub)){
            return of(void 0);
        }
        if(!hub.posts || !hub.posts.length){
            return of(void 0);
        }
        let data = {};
        const key = `hubs/${hub.name}`;
        data[key] = null;
        data['changed'] = new Date();
        return from(hub.posts).pipe(
            concatMap((id) =>  {
                return this.updatePostDate(id, data)}),
            map(() => {})
        )
    }

    remove(hub: Hub): Observable<void> {
        return this.http.delete<void>(`${environment.fbUrl}/hubs/${hub.id}.json`).pipe(
            switchMap(()=>this.deleteHubFromPosts(hub))
        );
    }



}
