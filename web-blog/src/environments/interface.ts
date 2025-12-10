export interface Environment {
    production: boolean;
    url: string;
    fbUrl: string;
    apiKey: string;
    firebaseConfig?: FirebaseConfig;

    webAppUrl: string;
    webAppConfig?: WebAppConfig;

    apiPlatform: ApiPlatform;
}


export type ApiPlatform = 'firebase' | 'appwrite';
export interface FirebaseConfig{
    apiKey?: string;
    authDomain?: string;
    databaseURL: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
}

export interface WebAppConfig{
  apiKey?: string;
  authDomain?: string;
  databaseURL: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;

  databaseId: string;
  collections:{[key: string]: string}
}
