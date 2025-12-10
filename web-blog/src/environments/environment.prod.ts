import { Environment, WebAppConfig } from './interface';

const appWriteConfig: WebAppConfig = {
  appId: '6937b038000f7bcebebd',
  databaseURL: 'https://appwrite.infra-net.pro/v1',
  databaseId: '6937e2a1003e415aa8d4',
  collections: {
    posts: '6937e2e8002f4a8f10b4',
    hubs: '6937e4ba003b05696c97',
    info: '69382555000b77835a7a'
  }
}

export const environment: Environment = {
  production: true,
  url: 'https://proektiva-web-blog.infra-net.pro',
  fbUrl: 'https://web-blog-726ee.firebaseio.com',
  apiKey: 'AIzaSyBhlqmG79XrD1-hALgu4gco1ok2NzbjH20',
  firebaseConfig: {
    apiKey: "AIzaSyBhlqmG79XrD1-hALgu4gco1ok2NzbjH20",
    authDomain: "web-blog-726ee.firebaseapp.com",
    databaseURL: "https://web-blog-726ee.firebaseio.com",
    projectId: "web-blog-726ee",
    storageBucket: "web-blog-726ee.appspot.com",
    messagingSenderId: "975279611920",
    appId: "1:975279611920:web:ce56126fbfe53540d06a95",
    measurementId: "G-HZF17QCXZ9"
  },

  webAppUrl: 'https://appwrite.infra-net.pro/v1',
  webAppConfig: appWriteConfig,

  apiPlatform: 'appwrite',
};
