import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  provideHttpClient,
} from '@angular/common/http';
import { CommonModule, NgFor } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { withFetch } from '@angular/common/http';
import { SpotifyWebPlaybackComponent } from './spotify-web-playback/spotify-web-playback.component';
import { SpotifyService } from './services/spotify.service';
import { YtserviceService } from './services/ytservice.service';
import { ViewChild, ElementRef } from '@angular/core';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { YoutubeWebPlaybackComponent } from './youtube-web-playback/youtube-web-playback.component';
import { LoadingComponent } from './loading/loading.component';

import * as store from 'store2';
import { environment } from '../environments/environment';
interface UrlsObject {
  yt: [string, string, string][];
  spot: [string, string, string][];
}
providers: [provideHttpClient(withFetch())];
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    NgFor,
    ReactiveFormsModule,
    HttpClientModule,
    SpotifyWebPlaybackComponent,
    CdkDropList,
    CdkDrag,
    FormsModule,
    LoadingComponent,
    YoutubeWebPlaybackComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  @ViewChild('youtubeIframe') youtubeIframe!: ElementRef<HTMLIFrameElement>;
  @ViewChild(SpotifyWebPlaybackComponent)
  spotifyWPComponent!: SpotifyWebPlaybackComponent;
  @ViewChild(YoutubeWebPlaybackComponent)
  youtubeWPComponent!: YoutubeWebPlaybackComponent;

  title = 'ytspot';
  youtube_link = new FormControl(
    'https://youtube.com/playlist?list=PL4xFhy5pDwEiI2FWxPOBpdwiY-Ju5uIZW&si=Amms7BzTLGVt5Reo'
  );
  spotify_link = new FormControl(
    'https://open.spotify.com/playlist/1gKIYxGVZBUpkmqamRa60w?si=655b6326c62f4a51'
  );
  spotify_message = '';
  youtube_message = '';
  playing = [false, 0];
  urls: UrlsObject = { yt: [], spot: [] };
  queue: [number, string, string, string][] = [];
  player_state = 0;
  playing_song: string = '';
  update_class = true;
  img_url = '/assets/black.png';
  isChecked = true;
  spotify_loading = false;
  spotify_queue = false;
  youtube_loading = false;
  previous_songs: [number, string, string, string][] = [];

  api_link = environment.API_URL;

  constructor(
    private http: HttpClient,
    private spotifyService: SpotifyService,
    private ytService: YtserviceService
  ) {
    this.spotifyService.currentPlayerTrackId$.subscribe(() => {
      if (this.playing[1] === 1) this.nextSong();
    });
    this.ytService.currentPlayerTrackId$.subscribe(() => {
      if (this.playing[1] === 0) this.nextSong();
    });
  }
  saveUrls() {
    store.default.set('urls', this.urls);
  }
  getUrls() {
    const urls = store.default.get('urls');
    if (urls === null) return;
    this.urls = urls;
  }
  randomNumber(): number {
    const urls_length = this.urls['yt'].length + this.urls['spot'].length - 2;
    return Math.floor(Math.random() * urls_length);
  }

  boxColor(player_name: number) {
    return player_name === 0 ? 'bg-red' : 'bg-green';
  }
  addQueue() {
    const rng_number = this.randomNumber();
    const yt_arr_len = this.urls['yt'].length - 1;
    try {
      if (rng_number < yt_arr_len) {
        this.queue.push([0, ...this.urls['yt'][rng_number]]);
      } else {
        this.queue.push([1, ...this.urls['spot'][rng_number - yt_arr_len]]);
      }
    } catch {
      return;
    }
  }
  removeFromQueue(id: string) {
    this.queue = this.queue.filter((queue) => queue[2] !== id);
    this.addQueue();
  }
  makeQueue() {
    this.queue = [];
    for (let index = 0; index < 50; index++) {
      this.addQueue();
    }
  }
  updatePlaying(is_playing: boolean, player_type: number) {
    if (
      (this.playing[1] === 1 && player_type === 0) ||
      (this.playing[1] === 0 && player_type === 1) ||
      this.player_state === 0
    ) {
      this.update_class = this.youtubeWPComponent.updateClasses(
        player_type,
        this.player_state
      );
    }
    this.playing = [is_playing, player_type];
  }

  mainController() {
    if (
      this.queue.length < 1 ||
      this.spotify_loading ||
      this.youtube_loading ||
      this.spotify_queue
    ) {
      return;
    }
    if (this.playing[0] === true) {
      switch (this.playing[1]) {
        case 0:
          this.youtubeWPComponent.pauseVideo();
          this.updatePlaying(false, 0);
          break;
        case 1:
          this.updatePlaying(false, 1);
          this.spotifyWPComponent.pauseDevice();
          break;
      }
      return;
    } else {
      if (this.player_state === 0 || this.player_state === -1) {
        this.nextSong();
        this.player_state = 1;
      } else if (this.player_state === 1) {
        switch (this.playing[1]) {
          case 0:
            this.youtubeWPComponent.playVideo();
            this.updatePlaying(true, 0);
            break;
          case 1:
            this.spotifyWPComponent.playDevice();
            this.updatePlaying(true, 1);
            break;
        }
        return;
      }
    }
  }
  nextSong() {
    if (this.spotify_loading || this.youtube_loading || this.spotify_queue) {
      return;
    }
    const item = this.queue.shift();
    if (item === undefined) return;
    let [player_type, song_name, song_id, img_url] = item;
    this.previous_songs.push(item);

    if (this.playing[1] === 0 && player_type === 1 && this.playing[0]) {
      this.youtubeWPComponent.pauseVideo();
      this.ytService.stopPlayer();
    } else if (this.playing[1] === 1 && player_type === 0 && this.playing[0]) {
      this.spotifyWPComponent.pauseDevice();
      // this.updatePlaying(false, 1);
    }
    this.updatePlaying(true, player_type);
    this.playing_song = song_name;
    if (player_type === 0) {
      this.youtubeWPComponent.playOne(song_id);
    } else {
      this.img_url = img_url;
      this.spotify_queue = true;
      this.spotify_queue = this.spotifyWPComponent.playOne(song_id);
    }
    this.addQueue();
  }
  prevSong() {
    const item = this.previous_songs.pop();
    if (item === undefined) return;
    let [player_type, song_name, song_id, img_url] = item;
    this.queue.unshift(item);
    this.player_state = -1;
    this.playing = [false, 0];
    if (player_type === 0) {
      this.youtubeWPComponent.stopVideo();
    } else {
      this.spotifyWPComponent.pauseDevice();
      this.updatePlaying(false, 1);
    }
  }

  getDataFromApi(source: boolean) {
    let link: string;
    if (source) {
      link =
        this.api_link +
          'youtube?images=1&yt_playlist=' +
          this.youtube_link.value || '';
      this.youtube_loading = true;
    } else {
      link =
        this.api_link +
          'spotify?images=1&spotify_playlist=' +
          this.spotify_link.value || '';
      this.spotify_loading = true;
    }

    this.http.get<any>(link).subscribe({
      next: (response) => {
        if (source) {
          this.urls.yt = Object.entries<string[]>(response.urls).map(
            ([title, link_image]: [string, string[]]) => [
              title,
              link_image[0],
              link_image[1],
            ]
          );
          this.youtube_message = 'Successfully added playlist';
          this.youtube_loading = false;
        } else {
          this.urls.spot = Object.entries<string[]>(response.urls).map(
            ([title, link_image]: [string, string[]]) => [
              title,
              link_image[0],
              link_image[1],
            ]
          );
          this.spotify_message = 'Successfully added playlist';
          this.spotify_loading = false;
        }

        this.makeQueue();
      },
      error: (error) => {
        if (source) {
          this.youtube_message = 'Problem with playlist';
        } else {
          this.spotify_message = 'Problem with playlist';
        }
      },
    });
  }
  clearInput(link: FormControl) {
    link.setValue('');
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.queue, event.previousIndex, event.currentIndex);
  }
}
