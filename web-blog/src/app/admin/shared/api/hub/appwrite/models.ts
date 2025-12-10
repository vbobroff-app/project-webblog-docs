import { Models } from "appwrite";
import { Hub } from "src/app/admin/shared/interfaces";

export interface AwHubModel extends Models.Document {
  name: string;
  description: string;
  posts: string[];
}

export interface HubListResponse {
  documents: AwHubModel[];
  total: number;
}

export const mapToHubs = (docs: HubListResponse): Hub[] => {
  return docs.documents.map((d: AwHubModel) => mapToHub(d));
}

export const mapToHub = (doc: AwHubModel): Hub => {
  return {
    id: doc.$id,
    name: doc.name,
    description: doc.description,
    created: new Date(doc.$createdAt),
    changed: new Date(doc.$updatedAt),
    posts: doc.posts ? [...doc.posts] : []
  }
}


export interface HubDto {
  name: string;
  description: string;
  posts: string[];
}

export const hubToDto = (hub: Hub, date: Date = new Date()): HubDto => {
  return {
    name: hub.name,
    description: hub.description,
    posts: hub.posts? [...hub.posts] : []
  };
}

export const removeFromArray = (arr: string[], item: string): string[] => {
  const index = arr.indexOf(item);
  if(index > -1){
    arr.splice(index, 1);
  }
  return arr;
}

export const addUniq = (arr: string[], value: string) =>{
  if(arr.includes(value)) return arr;
  return [...arr, value];
}
