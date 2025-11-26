export interface User {
    email: string;
    password: string;
    returnSecureToken?: boolean;
}

export interface FbAuthResponse {
    idToken: string;
    expiresIn: string;
    refreshToken: string;
}

export interface AwAuthResponse {
  jwt: string;
}

export interface Hub {
    id?: string;
    name: string;
    description?: string;
    created?: Date;
    changed?: Date;
    posts?: string[];//relation
}

export interface Post {
    id?: string;
    text: string;
    title: string;
    description: string;
    author: string;
    created?: Date;
    changed?: Date;
    watched?: Date;
    count?: number;
    icon?: string;
    hubs?: string[]//relation
}

export const postClone = (post: Post): Post => {
    return {
        text: post.text,
        title: post.title,
        description: post.description,
        author: post.author,
        created: post.created,
        changed: post.changed,
        watched: post.watched,
        count: post.count,
        icon: post.icon,
        hubs: post.hubs? [...post.hubs]: []
    };
}

