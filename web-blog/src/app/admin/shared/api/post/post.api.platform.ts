import { Injectable } from "@angular/core";

import { environment } from "src/environments/environment";
import { ApiPlatform } from "src/environments/interface";
import { PostApi } from "./post.api.base";
import { FbPostApi } from "./firebase/fb.post.api";
import { AwPostApi } from "./appwrite/aw.post.api";

@Injectable({
  providedIn: 'root'
})
export class PostApiPlatform {

  public readonly platform: ApiPlatform;
  public readonly postApi: PostApi;

  constructor(private fbApi: FbPostApi, private awApi: AwPostApi) {
    this.platform = environment.apiPlatform;

     switch (this.platform) {
       case 'appwrite':
         this.postApi = awApi;
         break;
       case 'firebase':
         this.postApi = fbApi;
         break;
         default: this.postApi = awApi;
     }

  }

}
