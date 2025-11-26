import { Hub } from "../../../interfaces"
import { toJson } from "../../utils"

export interface FbHubModel {
  name: string,
  description: string,
  created: string,
  changed: string,
  posts: {}
}

export const hubModel = (hub: Hub, date: Date = new Date()): FbHubModel => {
    return {
        name: hub.name,
        description: hub.description,
        created: hub.created ? hub.created.toString() : date.toString(),
        changed: date.toString(),
        posts: toJson(hub.posts)
    }
}
