import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PostInfo } from "../interfaces/postInfo";
import { InfoApi, InfoApiBase } from "src/app/admin/shared/api/info/info.api.base";
import { InfoApiPlatform } from "src/app/admin/shared/api/info/info.api.platform";

/**
 * Сервис для работы со статистикой постов
 * Использует Strategy Pattern для переключения между Firebase и AppWrite
 */
@Injectable({ providedIn: 'root' })
export class InfoService extends InfoApiBase implements InfoApi {

    constructor(private context: InfoApiPlatform) {
        super(context.infoApi);
    }

    /**
     * @deprecated Используйте put() или incrementView()
     * Оставлено для обратной совместимости
     */
    putLegacy(post: PostInfo): Observable<PostInfo> {
        post.showed = new Date().toString();
        return this.put(post);
    }

}
