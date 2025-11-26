import { Post } from "../../../interfaces";
import { toJson } from "../../utils";

export interface FbPostModel {
  text: string;
  title: string;
  author: string;
  created: string;
  changed: string;
  watched: Date;
  description: string;
  count: number;
  icon: string;
  hubs: {}
}

export const postModel = (post: Post, date: Date = new Date()): FbPostModel => {
  return {
      text: post.text,
      title: post.title,
      description: post.description,
      author: post.author,
      created: post.created ? post.created.toString() : date.toString(),
      changed: date.toString(),
      watched: post.watched,
      count: post.count,
      icon: post.icon ? post.icon : null,
      hubs: toJson(post.hubs)
  };
}
