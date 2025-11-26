import { Environment, WebAppConfig } from './interface';

const appWriteConfig: WebAppConfig = {
  appId: '6695ceb7003c2815243c',
  databaseURL: 'http://webapp.nntc.pro/v1',
  databaseId: '66b1eaf2001e414f3bd2',
  collections: {
    posts: "66b1eb1200212aa41818",
    hubs: '66b2398e0020f3d25799'
  }
}


export const environment: Environment = {
  production: true,
  url: 'https://vbobroff.net',
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

  webAppUrl: 'http://webapp.nntc.pro/v1',
  webAppConfig: appWriteConfig,

  apiPlatform: 'firebase',
};
