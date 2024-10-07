import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { YoutubeWebPlaybackComponent } from '../youtube-web-playback/youtube-web-playback.component';
import {
  HttpClient,
  HttpClientModule,
  provideHttpClient,
} from '@angular/common/http';
import { withFetch } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoadingComponent } from '../loading/loading.component';
import { InnerData } from '../models/types';
import * as store from 'store2';
import { v4 as uuidv4 } from 'uuid';
import { playlistSaveData } from '../models/types';

providers: [provideHttpClient(withFetch())];
@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    YoutubeWebPlaybackComponent,
    LoadingComponent,
  ],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.css',
})
export class PlaylistComponent {
  @Input() youtubeCached: boolean = false;
  @Input() spotifyCached: boolean = false;
  @Input() getTime: boolean = false;
  @Input() urls: any;
  @Input() component_id: string = uuidv4();
  @Input() inherited_link: string =
    'https://youtube.com/playlist?list=PL4xFhy5pDwEiI2FWxPOBpdwiY-Ju5uIZW&si=Amms7BzTLGVt5Reo';
  @Input() playlist_type: boolean = false;
  @Output() notifyParent: EventEmitter<any> = new EventEmitter();
  @Output() deleteComponent: EventEmitter<any> = new EventEmitter();
  @Output() updateLoading: EventEmitter<any> = new EventEmitter();
  playlist_loading = false;
  playlist_link = new FormControl();
  playlist_message = '';
  api_link = environment.API_URL;

  constructor(private http: HttpClient) {}

  getDataFromApi(source: boolean) {
    let link: string;
    if (source) {
      link =
        this.api_link +
          `youtube?is_cache=${this.youtubeCached}&get_time=${this.getTime}&yt_playlist=` +
          this.playlist_link.value || '';
      this.playlist_loading = true;
    } else {
      link =
        this.api_link +
          `spotify?is_cache=${this.spotifyCached}&get_time=${this.getTime}&spotify_playlist=` +
          this.playlist_link.value || '';
      this.playlist_loading = true;
    }
    this.updateLoading.emit(1);
    this.http.get<any>(link).subscribe({
      next: (response) => {
        const mappedUrls = Object.entries<string[]>(response.urls).map(
          ([id, item]: [string, string[]]) =>
            [id, item[0], item[1], item[2]] as InnerData
        );
        if (source) {
          this.urls.yt = this.urls.yt.concat(mappedUrls);
        } else {
          this.urls.spot = this.urls.spot.concat(mappedUrls);
        }
        this.playlist_message = 'Successfully added playlist';
        this.playlist_loading = false;

        this.notifyParent.emit('update');
        this.updateLoading.emit(-1);
      },
      error: (error) => {
        this.playlist_message = 'Problem with playlist';

        this.playlist_loading = false;
        this.updateLoading.emit(-1);
      },
    });
  }

  savePlaylist() {
    let playlists = store.default.get('playlists');
    if (playlists === null) playlists = {};
    playlists[this.component_id] = [
      this.playlist_link.value,
      this.playlist_type,
    ];
    store.default.set('playlists', playlists);
    this.playlist_message = 'Playlist saved locally';
  }

  deletePlaylist() {
    let playlists = store.default.get('playlists');
    if (playlists === null) return;
    playlists = Object.keys(playlists)
      .filter((key) => !this.component_id.includes(key))
      .reduce((obj, key) => {
        obj[key] = playlists[key];
        return obj;
      }, {} as playlistSaveData);
    store.default.set('playlists', playlists);
    this.deleteComponent.emit(this.component_id);
  }

  ngOnInit(): void {
    this.playlist_link.setValue(this.inherited_link);
  }
}
