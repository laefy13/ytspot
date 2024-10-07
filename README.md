# Ytspot

Goofy ahh angular web app for mixing yt playlist and spotify playlist.
Deployed here -> https://zealous-bay-0c9670c00.5.azurestaticapps.net/

## Features:
   * Put a public spotify and youtube playlist and a queue will be made, automatically shuffled. 
   * Better YT player that has no ads(unless there is hidden ad blocker in my incognito)(better cuz yt player is so bad)
   * I love shuffled playlists and its kind of a game for me to get a good song so yeah...
   * API server is this -> [ytspotServer](https://github.com/laefy13/ytspotServer)

## Added Features
   * 5/11/24
      * Volume sliders
      * Auto hide controller
      * Auto clear of the link inputs
      * "Styled" the spotify login/logout buttons
      * Animation for the auto hide controller
   * 8/10/24
      * Button so that the user can play the song in the queue immediately
      * Changed some css for the queue-container: song names will now truncate and wider container
      * Added github link at the top right 
      * Can now pause, go next and go previous with space button, right arrow and left arrow.
      * Fixed the bug where if you removed one of the songs in the queue, and there is an existing same song somewhere in the queue, those will also be removed
      * Fixed the bug? where if you put the cursor over the controller, the controller will hide within 3 seconds 
   * 10/1/2024 (development branch update)
      * Added button for refreshing the token for spotify
      * Added search function FeelsStrongMan
      * Added time switch,
         * if on the retrieved playlist will get the time of each song and will display in the queue
         * if off just the usual
         * in the case where the user already retrieved any playlist, and just turned on the time, the user will need to retrieve again the playlist, also the cache button needs to be turned off.
      * Added youtube and spotify cache switch
         * with the new update on the server, when a new playlist is retrieved, it will be saved in MongoDB for faster playlist retrieval (check the repo of the server if curious about the data saved)
         * if on, the server will return the saved playlist, which means, any new changes after the last retrieve of that playlist without cache, will not be sent. 
         * if off the usual
      * when in mobile, made the scroll bar bigger (i dunno if because i have fat finger or something but i cant scroll in mobile)
      * volume is saved locally
   * 10/7/2024
      * Changed the 2 playlists to a component where the user can add multiple playlists
         * still only supports yt and spot
         * The new "Save" button per playlist will save the playlist and the type of it locally, so when user visited the site again in the same browser, it will load saved playlist
      * Settings button where a navbar will show the three switches mentioned on 10/01/2024 update
      * Fixed the refresh function
      * New button in the queue items. When clicked it will move the item to the top of the queue
      * Fixed the bug where if the user used the immediate play function at the start, paused then play again, the next song will play.
      * made the GUI uglier

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
