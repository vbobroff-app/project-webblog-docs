import { Injectable } from "@angular/core";

import { environment } from "src/environments/environment";
import { ApiPlatform } from "src/environments/interface";
import { InfoApi } from "./info.api.base";
import { FbInfoApi } from "./firebase/fb.info.api";
import { AwInfoApi } from "./appwrite/aw.info.api";

/**
 * Фабрика для выбора реализации InfoApi в зависимости от платформы
 */
@Injectable({
  providedIn: 'root'
})
export class InfoApiPlatform {

  public readonly platform: ApiPlatform;
  public readonly infoApi: InfoApi;

  constructor(private fbApi: FbInfoApi, private awApi: AwInfoApi) {
    this.platform = environment.apiPlatform;

    switch (this.platform) {
      case 'appwrite':
        this.infoApi = awApi;
        break;
      case 'firebase':
        this.infoApi = fbApi;
        break;
      default:
        this.infoApi = awApi;
    }
  }

}

