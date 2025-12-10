import { Observable } from "rxjs";
import { PostInfo } from "src/app/core/interfaces/postInfo";

/**
 * Интерфейс API для работы со статистикой постов
 */
export interface InfoApi {

  /**
   * Получить статистику по ID поста
   */
  get(id: string): Observable<PostInfo>;

  /**
   * Создать или обновить статистику
   */
  put(info: PostInfo): Observable<PostInfo>;

  /**
   * Увеличить счётчик просмотров
   */
  incrementView(id: string): Observable<PostInfo>;

}


/**
 * Базовый класс для работы со статистикой постов (Strategy Pattern)
 */
export class InfoApiBase implements InfoApi {

  private readonly apiContext: InfoApi;

  constructor(context: InfoApi) {
    this.apiContext = context;
  }

  get(id: string): Observable<PostInfo> {
    return this.apiContext.get(id);
  }

  put(info: PostInfo): Observable<PostInfo> {
    return this.apiContext.put(info);
  }

  incrementView(id: string): Observable<PostInfo> {
    return this.apiContext.incrementView(id);
  }

}

