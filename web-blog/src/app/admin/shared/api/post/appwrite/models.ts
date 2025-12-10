import { Models } from "appwrite";
import { Post } from "../../../interfaces";

export interface AwPostModel extends Models.Document {
  author: string;
  count: string | null;
  description: string;
  hubs: string[];
  icon: string | null;
  text: string;
  title: string;
  watched: string | null;
}

export interface AwGetAllResponse {
  documents: AwPostModel[];
  total: number;
}

export const mapToPosts = (docs: AwGetAllResponse): Post[] => {
  return docs.documents.map((d: AwPostModel) => mapToPost(d));
}

export const mapToPost = (doc: AwPostModel): Post => {
  return {
    id: doc.$id,
    text: doc.text,
    title: doc.title,
    description: doc.description,
    author: doc.author,
    created: new Date(doc.$createdAt),
    changed: new Date(doc.$updatedAt),
    watched: doc.watched ? new Date(doc.watched) : null,
    count: +doc.count,
    icon: doc.icon,
    hubs: doc.hubs ? [...doc.hubs] : []
  }
}


export interface PostDto {
  text: string;
  title: string;
  author: string;
  watched: string | null;
  description: string;
  count: number;
  icon: string | null;
  hubs: string[];
}

export const postToDto = (post: Post): PostDto => {
  return {
    text: post.text,
    title: post.title,
    description: post.description,
    author: post.author,
    watched: post.watched?.getDate() ? post.watched.toISOString() : null,
    count: post.count,
    icon: post.icon ? post.icon : null,
    hubs: post.hubs ? post.hubs : []
  };
}
