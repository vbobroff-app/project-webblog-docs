import { Models } from "appwrite";
import { PostInfo } from "src/app/core/interfaces/postInfo";

/**
 * DTO для создания/обновления документа info в AppWrite
 */
export interface InfoDto {
  view: number;
  like: number;
  comment: number;
  showed: string | null;
}

/**
 * Модель документа info в AppWrite (включает системные поля)
 */
export interface AwInfoModel extends Models.Document, InfoDto {}

/**
 * Ответ на запрос списка документов
 */
export interface AwInfoListResponse extends Models.DocumentList<AwInfoModel> {
  documents: AwInfoModel[];
}

/**
 * Преобразование документа AppWrite в PostInfo
 */
export const mapToInfo = (doc: AwInfoModel): PostInfo => {
  if (!doc) {
    return null;
  }
  return {
    id: doc.$id,
    view: doc.view || 0,
    like: doc.like || 0,
    comment: doc.comment || 0,
    showed: doc.showed || null
  };
};

/**
 * Преобразование PostInfo в DTO для AppWrite
 */
export const infoToDto = (info: PostInfo): InfoDto => {
  return {
    view: info.view || 0,
    like: info.like || 0,
    comment: info.comment || 0,
    showed: info.showed || null
  };
};

