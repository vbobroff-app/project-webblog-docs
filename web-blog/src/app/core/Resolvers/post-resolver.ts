import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { Post } from "src/app/admin/shared/interfaces";
import { PostService } from "src/app/admin/shared/services/posts.service";


@Injectable({ providedIn: 'root' })
export class PostResolver implements Resolve<Post> {

    constructor(private postService: PostService){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Post | Observable<Post> | Promise<Post> {

        return this.postService.getById(route.params.id)
    }

}
