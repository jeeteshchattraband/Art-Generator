// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase : {
    apiKey: 'AIzaSyD2WO2cmbTDX5ub5MKoY3ebSysNl-J5XnY',
    authDomain: 'art-generator-16cb1.firebaseapp.com',
    databaseURL: 'https://art-generator-16cb1.firebaseio.com',
    projectId: 'art-generator-16cb1',
    storageBucket: 'art-generator-16cb1.appspot.com',
    messagingSenderId: '281486376387'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
