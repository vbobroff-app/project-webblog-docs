import { PostInfo } from "src/app/core/interfaces/postInfo";

/**
 * Модель Firebase для статистики поста
 */
export interface FbInfoModel {
  id: string;
  view: number;
  like: number;
  comment: number;
  showed: string | null;
}

/**
 * Преобразование PostInfo в модель Firebase
 */
export const infoToFbModel = (info: PostInfo): FbInfoModel => {
  return {
    id: info.id,
    view: info.view || 0,
    like: info.like || 0,
    comment: info.comment || 0,
    showed: info.showed || null
  };
};

/**
 * Преобразование модели Firebase в PostInfo
 */
export const fbModelToInfo = (model: FbInfoModel, id: string): PostInfo => {
  return {
    id: id,
    view: model?.view || 0,
    like: model?.like || 0,
    comment: model?.comment || 0,
    showed: model?.showed || null
  };
};

