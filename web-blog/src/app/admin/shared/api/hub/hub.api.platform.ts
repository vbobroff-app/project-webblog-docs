import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ApiPlatform } from "src/environments/interface";
import { HubApi } from "./hub.api.base";
import { FbHubApi } from "./firebase/fb.hub.api";
import { AwHubApi } from "./appwrite/aw.hub.api";

@Injectable({
  providedIn: 'root'
})
export class HubApiPlatform {

  public readonly platform: ApiPlatform;
  public readonly api: HubApi;

  constructor(private fbApi: FbHubApi, private awApi: AwHubApi) {
    this.platform = environment.apiPlatform;

     switch (this.platform) {
       case 'appwrite':
         this.api = awApi;
         break;
       case 'firebase':
         this.api = fbApi;
         break;
         default: this.api = awApi;
     }

  }

}
