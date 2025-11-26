import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Databases } from 'appwrite';

import { environment } from 'src/environments/environment';
import { WebAppService } from 'src/app/core/services/webapp.service';
import { PostInfo } from 'src/app/core/interfaces/postInfo';
import { InfoApi } from '../info.api.base';
import { AwInfoModel, infoToDto, mapToInfo } from './models';


@Injectable({
  providedIn: 'root'
})
export class AwInfoApi implements InfoApi {

  public databases: Databases;

  constructor(private aw: WebAppService) {
    this.databases = aw.databases;
  }

  /**
   * Получить статистику по ID поста
   * В AppWrite $id документа info = $id поста
   */
  get(id: string): Observable<PostInfo> {
    if (!id) {
      return of(null);
    }
    return from(this.databases.getDocument(
      environment.webAppConfig.databaseId,
      environment.webAppConfig.collections.info,
      id
    )).pipe(
      map((doc: AwInfoModel) => mapToInfo(doc)),
      catchError(error => {
        // Документ не найден - возвращаем null
        console.warn(`Info not found for post ${id}`);
        return of(null);
      })
    );
  }

  /**
   * Создать или обновить статистику
   * Использует ID поста как ID документа
   */
  put(info: PostInfo): Observable<PostInfo> {
    if (!info?.id) {
      return of(null);
    }
    info.showed = new Date().toString();
    
    // Пробуем обновить существующий документ
    return from(this.databases.updateDocument(
      environment.webAppConfig.databaseId,
      environment.webAppConfig.collections.info,
      info.id,
      infoToDto(info),
      ['read("any")']
    )).pipe(
      map((doc: AwInfoModel) => mapToInfo(doc)),
      catchError(error => {
        // Документ не существует - создаём новый с ID поста
        return from(this.databases.createDocument(
          environment.webAppConfig.databaseId,
          environment.webAppConfig.collections.info,
          info.id, // Используем ID поста как ID документа
          infoToDto(info),
          ['read("any")']
        )).pipe(
          map((doc: AwInfoModel) => mapToInfo(doc))
        );
      })
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
      })
    );
  }

}

