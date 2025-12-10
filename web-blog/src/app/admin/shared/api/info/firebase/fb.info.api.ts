import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { PostInfo } from "src/app/core/interfaces/postInfo";
import { InfoApi } from "../info.api.base";
import { FbInfoModel, infoToFbModel, fbModelToInfo } from "./models";


@Injectable({ providedIn: 'root' })
export class FbInfoApi implements InfoApi {

  constructor(private http: HttpClient) {}

  /**
   * Получить статистику по ID поста
   */
  get(id: string): Observable<PostInfo> {
    if (!id) {
      return of(null);
    }
    return this.http.get<FbInfoModel>(`${environment.fbUrl}/info/${id}.json`).pipe(
      map((response: FbInfoModel) => fbModelToInfo(response, id))
    );
  }

  /**
   * Создать или обновить статистику
   */
  put(info: PostInfo): Observable<PostInfo> {
    if (!info?.id) {
      return of(null);
    }
    info.showed = new Date().toString();
    const model = infoToFbModel(info);
    
    return this.http.put<FbInfoModel>(`${environment.fbUrl}/info/${info.id}.json`, model).pipe(
      map((response: FbInfoModel) => fbModelToInfo(response, info.id))
    );
  }

  /**
   * Увеличить счётчик просмотров
   */
  incrementView(id: string): Observable<PostInfo> {
    if (!id) {
      return of(null);
    }
    return this.get(id).pipe(
      switchMap(info => {
        if (info) {
          info.view = (info.view || 0) + 1;
          return this.put(info);
        } else {
          // Создаём новую запись
          const newInfo: PostInfo = {
            id: id,
            view: 1,
            like: 0,
            comment: 0,
            showed: new Date().toString()
          };
          return this.put(newInfo);
        }
      }),
      catchError(error => {
        // Если записи нет - создаём новую
        const newInfo: PostInfo = {
          id: id,
          view: 1,
          like: 0,
          comment: 0,
          showed: new Date().toString()
        };
        return this.put(newInfo);
      })
    );
  }

}

