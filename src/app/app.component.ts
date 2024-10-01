import { Component, HostListener } from '@angular/core';
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
import { v4 as uuidv4 } from 'uuid';

interface UrlsObject {
  yt: [string, string, string][];
  spot: [string, string, string][];
}
type QueueTuple = [number, string, string, string, string];
type SearchTuple = [number, string, string, string];

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
  spotifyCached: boolean = false;
  youtubeCached: boolean = false;
  getTime: boolean = false;
  playing = [false, 0];
  urls: UrlsObject = { yt: [], spot: [] };
  queue: QueueTuple[] = [];
  player_state = 0;
  playing_song: string = '';
  update_class = true;
  img_url = '/assets/black.png';
  isChecked = true;
  spotify_loading = false;
  spotify_queue = false;
  youtube_loading = false;
  previous_songs: QueueTuple[] = [];
  api_link = environment.API_URL;
  isMobile: boolean = false;
  showControllers: boolean = true;
  timer: any;
  search_results: SearchTuple[] = [];
  search_name = new FormControl('');
  show_search_container = false;
  search_added_status = '...';

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

    this.checkIfMobile();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }

  checkIfMobile() {
    if (typeof window !== 'undefined') this.isMobile = window.innerWidth <= 768;
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

  addSongToQueue(song_item: SearchTuple) {
    this.queue.unshift([...song_item, uuidv4()]);
    this.search_added_status = `${song_item[2]} added to Queue`;

    setTimeout(() => {
      this.search_added_status = '...';
    }, 3000);
  }

  addQueue() {
    const rng_number = this.randomNumber();
    const yt_arr_len = this.urls['yt'].length - 1;
    const song_uuid: string = uuidv4();
    try {
      if (rng_number < yt_arr_len) {
        this.queue.push([0, ...this.urls['yt'][rng_number], song_uuid]);
      } else {
        this.queue.push([
          1,
          ...this.urls['spot'][rng_number - yt_arr_len],
          song_uuid,
        ]);
      }
    } catch {
      return;
    }
  }

  removeFromQueue(id: string) {
    this.queue = this.queue.filter((queue) => queue[3] !== id);
    if (this.queue.length < 50) this.addQueue();
  }

  immediatePlay(id: string) {
    const startIndex = this.queue.findIndex((queue) => queue[3] === id);
    if (startIndex === -1) {
      return;
    }
    this.previous_songs.push(...this.queue.slice(0, startIndex));
    this.queue = this.queue.slice(startIndex);
    if (this.queue.length < 50)
      for (let i = 0; i < startIndex; i++) this.addQueue();
    this.nextSong();
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
    let [player_type, song_name, song_id, song_uuid] = item;
    this.previous_songs.push(item);

    if (this.playing[1] === 0 && player_type === 1 && this.playing[0]) {
      this.youtubeWPComponent.pauseVideo();
      this.ytService.stopPlayer();
    } else if (this.playing[1] === 1 && player_type === 0 && this.playing[0]) {
      this.spotifyWPComponent.pauseDevice();
    }
    this.updatePlaying(true, player_type);
    this.playing_song = song_name;
    if (player_type === 0) {
      this.youtubeWPComponent.playOne(song_id);
    } else {
      this.spotify_queue = true;
      this.spotify_queue = this.spotifyWPComponent.playOne(song_id);
    }
    if (this.queue.length < 50) this.addQueue();
  }

  prevSong() {
    const item = this.previous_songs.pop();
    if (item === undefined) return;
    let [player_type, song_name, song_id, song_uuid] = item;
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

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isInputActive =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    if (!isInputActive) {
      if (event.code === 'Space') {
        event.preventDefault();
        this.mainController();
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        this.nextSong();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        this.prevSong();
      }
    }
  }

  getDataFromApi(source: boolean) {
    let link: string;
    if (source) {
      link =
        this.api_link +
          `youtube?is_cache=${this.youtubeCached}&get_time=${this.getTime}&yt_playlist=` +
          this.youtube_link.value || '';
      this.youtube_loading = true;
    } else {
      link =
        this.api_link +
          `spotify?is_cache=${this.spotifyCached}&get_time=${this.getTime}&spotify_playlist=` +
          this.spotify_link.value || '';
      this.spotify_loading = true;
    }

    this.http.get<any>(link).subscribe({
      next: (response) => {
        if (source) {
          this.urls.yt = Object.entries<string[]>(response.urls).map(
            ([id, item]: [string, string[]]) => [id, item[0], item[1]]
          );
          this.youtube_message = 'Successfully added playlist';
          this.youtube_loading = false;
        } else {
          this.urls.spot = Object.entries<string[]>(response.urls).map(
            ([id, item]: [string, string[]]) => [id, item[0], item[1]]
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
    if (
      link.value ===
        'https://open.spotify.com/playlist/1gKIYxGVZBUpkmqamRa60w?si=655b6326c62f4a51' ||
      link.value ===
        'https://youtube.com/playlist?list=PL4xFhy5pDwEiI2FWxPOBpdwiY-Ju5uIZW&si=Amms7BzTLGVt5Reo'
    )
      link.setValue('');
  }

  ngOnInit() {
    this.startTimer();
  }

  startTimer() {
    this.timer = setTimeout(() => {
      this.mouseLeft();
    }, 3000);
  }

  resetTimer() {
    if (!this.isMobile) {
      clearTimeout(this.timer);
      this.showControllers = true;
    }
  }

  mouseLeft() {
    if (!this.isMobile) this.showControllers = false;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.queue, event.previousIndex, event.currentIndex);
  }

  search() {
    this.search_results = [];
    const search_name_value = this.search_name.value
      ? this.search_name.value.toLowerCase()
      : '';
    if (search_name_value == '') return;

    this.urls.spot.map(([id, name, time]) => {
      if (name.toLowerCase().includes(search_name_value))
        this.search_results.push([1, id, name, time]);
    });
    this.urls.yt.map(([id, name, time]) => {
      if (name.toLowerCase().includes(search_name_value))
        this.search_results.push([0, id, name, time]);
    });
  }
  trackSong(index: number, song: SearchTuple) {
    return song[0];
  }

  flipBool(variable_: boolean): boolean {
    return !variable_;
  }
}
