import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, from, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { HubService } from 'src/app/admin/shared/services/hub.service';
import { Post } from '../../../interfaces';

import { PostApi } from "../post.api.base";
import { FbPostModel, postModel } from "./models";
import { FbCreateResponse, FbGetResponse } from "../../fb.dto";




@Injectable({ providedIn: 'root' })
export class FbPostApi implements PostApi {

    private fbClient: firebase.database.Database;

    constructor(private http: HttpClient, private hubService: HubService, private firebaseService: FirebaseService) {
        this.fbClient = this.firebaseService.database;
    }

    create(post: Post): Observable<Post> {
        post.created = new Date();
        const model = postModel(post);
        post.changed = new Date(model.changed);
        return this.http.post<FbCreateResponse>(`${environment.fbUrl}/posts.json`, model).pipe(
            map((response: FbCreateResponse) => {
                const respPost: Post = {
                    ...post,
                    id: response.name
                };
                return respPost;
            }),
            switchMap((post) => this.hubService.updatesByPost(post))
        );
    }

    getAll(): Observable<Post[]> {
        return this.http.get<FbGetResponse>(`${environment.fbUrl}/posts.json`).pipe(map((response: FbGetResponse) => {
            const posts: Post[] = Object.keys(response).map((key) => {
                const post: Post = {
                    ...response[key],
                    id: key,
                    changed: new Date(response[key].changed),
                    created: new Date(response[key].created),
                    watched: new Date(response[key].watched),
                    hubs: response[key].hubs ? [...Object.keys(response[key].hubs)] : []
                };
                return post;
            })
            return posts.sort((a, b)=>{
              if(a.created < b.created){
                return 1;
              }
              if(a.created > b.created){
                return -1;
              }
              return 0;
            });
        }));
    }

    getRecent(): Observable<Post[]> {
        return this.http.get<FbGetResponse>(`${environment.fbUrl}/posts.json?orderBy="watched"&limitToLast=5&print=pretty`).pipe(map((response: FbGetResponse) => {
            const posts: Post[] = Object.keys(response).map((key) => {
                const post: Post = {
                    ...response[key],
                    id: key,
                    changed: new Date(response[key].changed),
                    created: new Date(response[key].created),
                    watched: new Date(response[key].watched),
                    hubs: response[key].hubs ? [...Object.keys(response[key].hubs)] : []
                };
                return post;
            })
            return posts.sort((a,b)=>b.watched?.getTime() - a.watched?.getTime());
        }));
    }

    getPopular(): Observable<Post[]> {
        return this.http.get<FbGetResponse>(`${environment.fbUrl}/posts.json?orderBy="count"&limitToLast=5&print=pretty`).pipe(map((response: FbGetResponse) => {
            const posts: Post[] = Object.keys(response).map((key) => {
                const post: Post = {
                    ...response[key],
                    id: key,
                    changed: new Date(response[key].changed),
                    created: new Date(response[key].created),
                    watched: new Date(response[key].watched),
                    hubs: response[key].hubs ? [...Object.keys(response[key].hubs)] : []
                };

                return post;
            })
            return posts.sort((a,b)=>b.count-a.count);
        }));
    }

    setSome(hubName: string): Observable<any> {

        let data = {};
        const key = `post/newpost`;
        data[key] = true;


        return this.hubService.getByName(hubName).pipe(
            switchMap(hub => this.hubService.updateById(hub.id, data))
        );

        // var id = 'xxxx';
        // debugger;
        // var promise = this.fbClient.ref(`/posts/xxxx`).set(postModel(post)).then(function (snapshot) {
        //     debugger;
        //     var value = (snapshot.val());


        //         // const post: Post = {
        //         //     ...value
        //         // };

        //         // return post;
        //         return {};


        // });

        // return from(promise) as Observable<Hub>;
    }

    refPosts(): Observable<Post[]> {
        var promise = this.fbClient.ref('/posts/').once('value').then(function (snapshot) {
            var value = (snapshot.val());

            const posts: Post[] = Object.keys(value).map((key) => {
                const post: Post = {
                    ...value[key],
                    id: key,
                    changed: new Date(value[key].changed),
                    created: new Date(value[key].created),
                    watched: new Date(value[key].watched),
                    hubs: value[key].hubs ? [...Object.keys(value[key].hubs)] : []
                };
                return post;
            });
            return posts;
        });
        return from(promise) as Observable<Post[]>;
    }

    refPostsByHubName(name: string): Observable<Post[]> {
        var ref = this.fbClient.ref('posts');
        var promise = ref.orderByChild(`hubs/${name}`).equalTo(true).once("value").then(function (snapshot) {

            var value = (snapshot.val());
            const posts: Post[] = Object.keys(value).map((key) => {
                const post: Post = {
                    ...value[key],
                    id: key,
                    changed: new Date(value[key].changed),
                    created: new Date(value[key].created),
                    watched: new Date(value[key].watched),
                    hubs: value[key].hubs ? [...Object.keys(value[key].hubs)] : []
                };
                return post;
            });
            return posts;

        });
        return from(promise) as Observable<Post[]>;
    }



    getById(id: string): Observable<Post> {
        return this.http.get<FbPostModel>(`${environment.fbUrl}/posts/${id}.json`).pipe(
            map((response: FbPostModel) => {
                const post: Post = {
                    ...response,
                    id: id,
                    changed: new Date(response.changed),
                    created: new Date(response.created),
                    watched: new Date(response.watched),
                    hubs: response.hubs ? [...Object.keys(response.hubs)] : null
                };
                return post;
            })
        );
    }

    getByRange(ids: string[]): Observable<Post[]> {
        return combineLatest([
            ...ids.map(id => this.http.get<FbPostModel>(`${environment.fbUrl}/posts/${id}.json`)
                .pipe(
                    map((response: FbPostModel) => {
                        const post: Post = {
                            ...response,
                            id: id,
                            changed: new Date(response.changed),
                            created: new Date(response.created),
                            watched: new Date(response.watched),
                            hubs: response.hubs ? [...Object.keys(response.hubs)] : null
                        };
                        return post;
                    })
                )
            )
        ])
    }

    update(post: Post): Observable<Post> {
        post.changed = new Date();
        return this.http.patch<FbPostModel>(`${environment.fbUrl}/posts/${post.id}.json`, postModel(post)).pipe(
            map((response: FbPostModel) => {
                const respPost: Post = {
                    ...response,
                    id: post.id,
                    changed: new Date(response.changed),
                    created: new Date(response.created),
                    watched: new Date(response.watched),
                    hubs: response.hubs ? [...Object.keys(response.hubs)] : null
                };
                return respPost;
            }),
            switchMap((post) => this.hubService.updatesByPost(post))
        );
    }

    remove(post: Post): Observable<void> {
        return this.http.delete<void>(`${environment.fbUrl}/posts/${post.id}.json`).pipe(
            switchMap(() => this.hubService.deletePostFromHubs(post))
        );
    }

}

