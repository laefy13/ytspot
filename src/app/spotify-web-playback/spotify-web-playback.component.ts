import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import * as store from 'store2';
import { Inject, PLATFORM_ID } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { environment } from '../../environments/environment';
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

@Component({
  selector: 'app-spotify-web-playback',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './spotify-web-playback.component.html',
  styleUrl: './spotify-web-playback.component.css',
})
export class SpotifyWebPlaybackComponent implements OnInit {
  @Input() player_state!: number;
  @Input() img_url!: string;
  @Input() update_class!: boolean;

  player: any;
  api_link = environment.API_URL;
  access_token = null;
  // is_updated: boolean=false;
  private position_changed = false;
  device_ready = false;
  spot_to_yt = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit(): Promise<void> {
    let id = store.default.get('id');

    if (id === null) {
      if (isPlatformBrowser(this.platformId)) {
        this.route.queryParams.subscribe(async (params) => {
          if ('id' in params) id = params['id'];
          else return;

          store.default.set('id', id);

          const urlWithoutId = window.location.href.split('?')[0];
          window.history.replaceState({}, document.title, urlWithoutId);

          await this.getToken(id);
        });
      }
    } else {
      await this.getToken(id);
    }
  }

  private async getToken(id: any): Promise<void> {
    id = store.default.get('id');
    if (id === null) return;
    const link = this.api_link + 'token';
    const headers = new HttpHeaders({
      'X-Spotify-UUID': id,
    });
    this.http.get<any>(link, { headers }).subscribe({
      next: (response) => {
        const access_token = response.token;
        if (access_token === null) {
          return null;
        }
        this.access_token = access_token;
        store.default.set('access_token', access_token);
        this.initializeSpotifyPlayer();
        return;
      },
      error: (error) => {
        this.logout();
        return;
      },
    });
  }
  private initializeSpotifyPlayer() {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb: (arg0: any) => void) => {
          cb(this.access_token);
        },
        volume: 1,
      });

      this.player.addListener('ready', ({ device_id }: any) => {
        store.default.set('device_id', device_id);
      });

      this.player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Device ID has gone offline', device_id);
      });

      this.player.connect().then((success: any) => {
        if (success) {
          this.device_ready = true;
        }
      });
      this.player.addListener(
        'player_state_changed',
        ({ position, duration, track_window: { current_track } }: any) => {
          if (position > 0) {
            // this.position_changed = true;
            this.player.getCurrentState().then((state: any) => {
              if (!state) return;
              if (!state.paused) {
                this.positionChange(true);
              }
            });
          }
          if (this.position_changed && position === 0) {
            this.positionChange(false);
            this.spotifyService.updateCurrentTrackId();
            // }
          }
        }
      );
    };
  }
  positionChange(is_changed: boolean) {
    this.position_changed = is_changed;
  }
  logout() {
    store.default.clearAll();
    this.access_token = null;
  }

  pauseDevice() {
    this.player.pause().then(() => {
      this.positionChange(false);
    });
  }
  playDevice() {
    this.player.resume().then(() => {});
  }
  playOne(track_uri: string) {
    this.spot_to_yt = true;
    track_uri = this.getIdFromUri(track_uri);
    this.spotifyService.playOne(track_uri).subscribe({});
    return false;
  }
  private getIdFromUri(uri: string): string {
    const type = uri.includes('/playlist')
      ? 'playlist'
      : uri.includes('/track')
      ? 'track'
      : 'album';
    const regex = new RegExp(`\/${type}\/([a-zA-Z0-9]+)`);
    const match = uri.match(regex);
    if (match && match.length >= 2) {
      return match[1];
    }
    return '';
  }
}
