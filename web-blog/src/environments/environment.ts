// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment, WebAppConfig } from './interface';


const appWriteConfig: WebAppConfig = {
    appId: '6937b038000f7bcebebd',
    databaseURL: 'http://appwrite.infra-net.pro/v1',
    databaseId: '6937e2a1003e415aa8d4',
    collections: {
      posts: '6937e2e8002f4a8f10b4',
      hubs: '6937e4ba003b05696c97',
      info: '69382555000b77835a7a'
    }
}

export const environment: Environment = {
  production: false,
  url: 'http://localhost:4200',

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
  webAppUrl: 'http://appwrite.infra-net.pro/v1',
  webAppConfig: appWriteConfig,

  apiPlatform: 'appwrite',

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
